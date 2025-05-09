from langchain_openai import ChatOpenAI
from langchain.prompts import ChatPromptTemplate
from langchain.schema import HumanMessage
import os
from dotenv import load_dotenv
from neo4j import GraphDatabase
import re
from datetime import datetime
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
    "code": ChatPromptTemplate.from_template(
        "You are an expert software engineer. Write clean, efficient, and well-commented code to solve the following problem:\n\n{input}"
    ),

    "explain": ChatPromptTemplate.from_template(
        "You are a skilled technical educator. Break down the following concept clearly and simply for a beginner audience:\n\n{input}"
    ),

    "summarize": ChatPromptTemplate.from_template(
        "You are a professional summarizer. Create a concise and accurate summary of the following content in bullet points or a paragraph:\n\n{input}"
    ),

    "generate": ChatPromptTemplate.from_template(
        "You are a creative content generator. Use an engaging and original tone to generate content based on this prompt:\n\n{input}"
    ),

    "reason": ChatPromptTemplate.from_template(
        "You are a logical AI designed for step-by-step reasoning. Solve or evaluate the following situation by explaining each step clearly:\n\n{input}"
    ),

    "analyze": ChatPromptTemplate.from_template(
        "You are a critical analyst. Provide a detailed analysis of the following topic, identifying causes, effects, and implications:\n\n{input}"
    ),

    "advise": ChatPromptTemplate.from_template(
        "You are a helpful and thoughtful advisor. Offer practical, clear, and empathetic advice for the following question or situation:\n\n{input}"
    ),

    "edit": ChatPromptTemplate.from_template(
        "You are a professional editor. Improve the grammar, clarity, and tone of the following text without changing its meaning:\n\n{input}"
    ),

    "translate": ChatPromptTemplate.from_template(
        "You are a fluent translator. Translate the following text to fluent English while keeping original tone and context:\n\n{input}"
    ),

    "default": ChatPromptTemplate.from_template(
        "You are a helpful assistant. Respond helpfully and concisely to the following input:\n\n{input}"
    )
}


def detect_intent(prompt: str) -> str:
    system_msg = (
        "You are a helpful AI assistant. Categorize the user's prompt into one of the following intents:\n"
        "Summarize, Code, Explain, Generate, Reason, Analyze, Advise, Edit, Translate.\n\n"
        "Return only the one-word intent. Do not explain anything."
    )

    intent_eval = llm.invoke([
        HumanMessage(content=system_msg),
        HumanMessage(content=prompt)
    ])

    intent = intent_eval.content.strip().lower()

    print(f"[DEBUG] GPT-3.5 predicted intent: {intent}")

    # Normalize it to match lowercase keys
    valid_intents = {
        "summarize", "code", "explain", "generate",
        "reason", "analyze", "advise", "edit", "translate"
    }

    return intent if intent in valid_intents else "default"


# Main LangChain call
def route_prompt(prompt: str):
    intent = detect_intent(prompt)
    template = prompt_templates[intent]
    chain = template | llm
    response = chain.invoke({"input": prompt})

    # Run scoring (which now includes CoT validation)
    score = score_response(prompt, response.content)

    # OPTIONAL: pull CoT score separately if you want to log/see it clearly
    cot_score = validate_chain_of_thought(response.content)

    # Log to Neo4j with CoT as a property
    log_to_neo4j(prompt, intent, response.content, score, cot_score)

    # Print for debugging
    print(f"[DEBUG] CoT Score: {cot_score * 2}/20")

    return intent, response.content, score



driver = GraphDatabase.driver(NEO4J_URI, auth=(NEO4J_USERNAME, NEO4J_PASSWORD))

def log_to_neo4j(prompt: str, intent: str, response: str, score: float, cot_score: float):
    with driver.session() as session:
        session.run(
            """
            MERGE (p:Prompt {text: $prompt})
            MERGE (i:Intent {type: $intent})
            CREATE (r:Response {
                text: $response,
                score: $score,
                cot_score: $cot_score,
                timestamp: datetime($timestamp)
            })
            MERGE (p)-[:HAS_INTENT]->(i)
            MERGE (p)-[:GOT_RESPONSE]->(r)
            MERGE (i)-[:TRIGGERED]->(r)
            """,
            prompt=prompt,
            intent=intent,
            response=response,
            score=score,
            cot_score=cot_score,
            timestamp=datetime.utcnow().isoformat()
        )

def score_length(prompt: str, response: str) -> int:
    word_count = len(response.split())
    concise_keywords = ["brief", "summarize", "summary", "short", "quick", "quickly", "tldr", "less"]

    wants_concise = any(kw in prompt.lower() for kw in concise_keywords)

    if wants_concise:
        if word_count < 40:
            return 20
        elif word_count < 60:
            return 15
        elif word_count < 80:
            return 10
        elif word_count < 100:
            return 5
        else:
            return 0
    else:
        if word_count > 150:
            return 20
        elif word_count > 100:
            return 15
        elif word_count > 50:
            return 10
        elif word_count > 25:
            return 5
        else:
            return 0



def score_response(prompt: str, response: str) -> int:
    score = 0

    # --- 1. Length Score (0–20) ---
    score += score_length(prompt, response)

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

    # --- 3. Semantic Similarity Score (0–20) ---
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
        pass

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

    # --- 5. Chain-of-Thought Score (0–20) ---
    cot_raw = validate_chain_of_thought(response)  # 0 to 10
    score += cot_raw * 2

    # --- Final Rounding ---
    return int(round(score / 10.0) * 10)

def validate_chain_of_thought(response: str) -> float:
    eval_prompt = f"""You are a reasoning evaluator. Analyze the following answer and rate how logically sound, step-by-step, and coherent the reasoning is.

Answer:
{response}

Respond with a number from 0 to 10 only, no explanation."""

    print("[DEBUG] Sending CoT validation prompt to LLM:")
    print(eval_prompt)

    try:
        evaluation = llm.invoke([HumanMessage(content=eval_prompt)])
        print("[DEBUG] Raw LLM CoT score response:", evaluation.content)

        raw_score = int("".join(filter(str.isdigit, evaluation.content)))
        final_score = min(max(raw_score, 0), 10)
        print(f"[DEBUG] Parsed CoT Score: {final_score}")
        return final_score
    except Exception as e:
        print("[ERROR] Failed to extract CoT score:", str(e))
        return 0