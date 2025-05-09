from langchain_openai import ChatOpenAI
from langchain.prompts import ChatPromptTemplate
from langchain.schema import HumanMessage
import os
from dotenv import load_dotenv
from neo4j import GraphDatabase
import re
import numpy as np
from langchain_openai import OpenAIEmbeddings

load_dotenv()


NEO4J_URI = os.getenv("NEO4J_URI")
NEO4J_USERNAME = os.getenv("NEO4J_USERNAME")
NEO4J_PASSWORD = os.getenv("NEO4J_PASSWORD")

llm = ChatOpenAI(model="gpt-3.5-turbo", openai_api_key=os.getenv("OPENAI_API_KEY"))
embedding_model = OpenAIEmbeddings(openai_api_key=os.getenv("OPENAI_API_KEY"))

# Define multiple prompt templates
prompt_templates = {
    "code": ChatPromptTemplate.from_template("You are a Python coding assistant. Answer this: {input}"),
    "explain": ChatPromptTemplate.from_template("Explain this concept in simple terms: {input}"),
    "default": ChatPromptTemplate.from_template("Respond to this input: {input}")
}

# Rudimentary intent detection
def detect_intent(prompt: str) -> str:
    if any(word in prompt.lower() for word in ["code", "implement", "function", "class", "bug"]):
        return "code"
    elif any(word in prompt.lower() for word in ["explain", "what is", "why", "how does"]):
        return "explain"
    else:
        return "default"

# Main LangChain call
def route_prompt(prompt: str):
    intent = detect_intent(prompt)
    template = prompt_templates[intent]
    chain = template | llm
    response = chain.invoke({"input": prompt})
    score = score_response(prompt, response.content)

    # Log interaction
    log_to_neo4j(prompt, intent, response.content, score)

    return intent, response.content, score


driver = GraphDatabase.driver(NEO4J_URI, auth=(NEO4J_USERNAME, NEO4J_PASSWORD))

def log_to_neo4j(prompt: str, intent: str, response: str, score: float):
    with driver.session() as session:
        session.run(
            """
            MERGE (p:Prompt {text: $prompt})
            MERGE (i:Intent {type: $intent})
            CREATE (r:Response {text: $response, score: $score})
            MERGE (p)-[:HAS_INTENT]->(i)
            MERGE (p)-[:GOT_RESPONSE]->(r)
            MERGE (i)-[:TRIGGERED]->(r)
            """,
            prompt=prompt,
            intent=intent,
            response=response,
            score=score
        )


def score_response(prompt: str, response: str) -> int:
    score = 0

    # --- 1. Length Score (0–20) ---
    word_count = len(response.split())
    if word_count > 150:
        score += 20
    elif word_count > 100:
        score += 15
    elif word_count > 50:
        score += 10
    elif word_count > 25:
        score += 5
    else:
        score += 0

    # --- 2. Keyword Overlap Score (0–20) ---
    prompt_words = set(re.findall(r'\w+', prompt.lower()))
    response_words = set(re.findall(r'\w+', response.lower()))
    overlap = prompt_words & response_words
    overlap_ratio = len(overlap) / max(len(prompt_words), 1)
    if overlap_ratio > 0.5:
        score += 20
    elif overlap_ratio > 0.3:
        score += 15
    elif overlap_ratio > 0.2:
        score += 10
    elif overlap_ratio > 0.1:
        score += 5

    # --- 3. Semantic Relevance via Embedding Cosine Similarity (0–20) ---
    try:
        vec_prompt = embedding_model.embed_query(prompt)
        vec_response = embedding_model.embed_query(response)
        cosine_sim = np.dot(vec_prompt, vec_response) / (np.linalg.norm(vec_prompt) * np.linalg.norm(vec_response))
        if cosine_sim > 0.95:
            score += 20
        elif cosine_sim > 0.9:
            score += 15
        elif cosine_sim > 0.85:
            score += 10
        elif cosine_sim > 0.8:
            score += 5
    except Exception:
        pass  # fail gracefully if embeddings are not available

    # --- 4. Clarity Score (0–20) ---
    avg_sentence_length = sum(len(s.split()) for s in re.split(r'[.!?]', response) if s.strip()) / max(1, len(re.findall(r'[.!?]', response)))
    if avg_sentence_length < 20:
        score += 20
    elif avg_sentence_length < 25:
        score += 15
    elif avg_sentence_length < 30:
        score += 10
    elif avg_sentence_length < 35:
        score += 5

    # --- 5. Completeness Heuristic (0–20) ---
    if response.strip().endswith((".", "!", "?")):
        score += 20
    elif response.strip().endswith("..."):
        score += 10
    else:
        score += 5

    # --- Final rounding ---
    return int(round(score / 10.0) * 10)