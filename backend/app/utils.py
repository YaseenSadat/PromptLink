# ======================== Imports ========================

# Standard libraries
import os
import re
from datetime import datetime, timezone
from collections import deque
import numpy as np
from dotenv import load_dotenv

# LangChain imports
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from langchain.prompts import ChatPromptTemplate
from langchain.schema import HumanMessage
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import Runnable
from langchain_google_genai import ChatGoogleGenerativeAI

# Neo4j
from neo4j import GraphDatabase

# ======================== Environment Variables ========================

load_dotenv()

NEO4J_URI = os.getenv("NEO4J_URI")
NEO4J_USERNAME = os.getenv("NEO4J_USERNAME")
NEO4J_PASSWORD = os.getenv("NEO4J_PASSWORD")

# ======================== LLM Clients ========================

llm_3 = ChatOpenAI(model="gpt-3.5-turbo", openai_api_key=os.getenv("OPENAI_API_KEY"))
llm_4o = ChatOpenAI(model="gpt-4o", openai_api_key=os.getenv("OPENAI_API_KEY"))
llm_gemini = ChatGoogleGenerativeAI(
    model="gemini-2.0-flash",
    google_api_key=os.getenv("GOOGLE_API_KEY"),
    temperature=0.7
)

embedding_model = OpenAIEmbeddings(openai_api_key=os.getenv("OPENAI_API_KEY"))

# ======================== Cache Config ========================

CACHE = deque(maxlen=100)  # LRU cache to store recent (embedding_vector, intent, response)
SIMILARITY_THRESHOLD = 0.92

# ======================== Prompt Templates ========================

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
    "compare": ChatPromptTemplate.from_template(
        "You are a helpful assistant. Provide a clear side-by-side comparison of the following options:\n\n{input}"
    ),
    "review": ChatPromptTemplate.from_template(
        "You are a critical reviewer. Offer a balanced and insightful critique of the following:\n\n{input}"
    ),
    "rephrase": ChatPromptTemplate.from_template(
        "You are a skilled rewriter. Paraphrase the following content in a new tone or style while preserving the original meaning:\n\n{input}"
    ),
    "expand": ChatPromptTemplate.from_template(
        "You are a thoughtful writer. Expand on the following idea with additional details, examples, or explanations:\n\n{input}"
    ),
    "outline": ChatPromptTemplate.from_template(
        "You are a structured thinker. Convert the following ideas into a clear, organized outline:\n\n{input}"
    ),
    "default": ChatPromptTemplate.from_template(
        "You are a helpful assistant. Respond helpfully and concisely to the following input:\n\n{input}"
    )
}

# ======================== Intent Detection ========================

intent_prompt = ChatPromptTemplate.from_template(
    "You are a helpful AI assistant. Categorize the user's prompt into one of the following intents:\n"
    "Summarize, Code, Explain, Generate, Reason, Analyze, Advise, Edit, Translate, Compare, Review, Rephrase, Expand, Outline .\n\n"
    "Return only the one-word intent. Do not explain anything.\n\n"
    "Prompt:\n{input}"
)

intent_chain: Runnable = intent_prompt | llm_3 | StrOutputParser()

def detect_intent(prompt: str) -> str:
    intent = intent_chain.invoke({"input": prompt}).strip().lower()
    print(f"[DEBUG] LangChain predicted intent: {intent}")
    valid_intents = {
        "summarize", "code", "explain", "generate", "reason",
        "analyze", "advise", "edit", "translate",
        "compare", "review", "rephrase", "expand", "outline"
    }
    return intent if intent in valid_intents else "default"

# ======================== Main Router ========================

async def route_prompt(prompt: str, email: str | None = None):
    intent = detect_intent(prompt)
    template = prompt_templates[intent]
    incoming_vec = embedding_model.embed_query(prompt)

    # Check cache
    for cached_vec, cached_intent, cached_response, cached_model in CACHE:
        cosine_sim = np.dot(incoming_vec, cached_vec) / (np.linalg.norm(incoming_vec) * np.linalg.norm(cached_vec))
        if cosine_sim > SIMILARITY_THRESHOLD and cached_intent == intent:
            print("[CACHE HIT] Reusing previous response")
            return intent, cached_response, 100, cached_model, True



    # Select model based on intent
    if intent in {"analyze", "compare", "review", "expand"}:
        llm_model = llm_gemini
        model_used = "gemini-2.0-flash"
    elif intent in {"summarize", "generate", "advise", "edit", "translate", "rephrase", "outline", "explain", "reason"}:
        llm_model = llm_3
        model_used = "gpt-3.5-turbo"
    else:
        llm_model = llm_4o
        model_used = "gpt-4o"

    print(f"[DEBUG] Intent: {intent} | Using model: {model_used}")
    chain = template | llm_model
    response = await chain.ainvoke({"input": prompt})

    score = await score_response(prompt, response.content, intent)
    cot_score = await validate_chain_of_thought(response.content)

    log_to_neo4j(prompt, intent, response.content, score, cot_score, model_used, email)

    print(f"[DEBUG] CoT Score: {cot_score * 2}/20")
    CACHE.append((incoming_vec, intent, response.content, model_used))
    return intent, response.content, score, model_used, False

# ======================== Scoring and Evaluation ========================

# ---- Modular scoring functions ----

def score_overlap(prompt: str, response: str) -> int:
    prompt_words = set(re.findall(r'\w+', prompt.lower()))
    response_words = set(re.findall(r'\w+', response.lower()))
    overlap = prompt_words & response_words
    overlap_ratio = len(overlap) / max(len(prompt_words), 1)

    if overlap_ratio > 0.5:
        return 20
    elif overlap_ratio > 0.3:
        return 15
    elif overlap_ratio > 0.2:
        return 10
    elif overlap_ratio > 0.1:
        return 5
    return 0

def score_cosine_similarity(prompt: str, response: str) -> int:
    try:
        vec_prompt = embedding_model.embed_query(prompt)
        vec_response = embedding_model.embed_query(response)
        cosine_sim = np.dot(vec_prompt, vec_response) / (np.linalg.norm(vec_prompt) * np.linalg.norm(vec_response))
        if cosine_sim > 0.95:
            return 20
        elif cosine_sim > 0.9:
            return 15
        elif cosine_sim > 0.85:
            return 10
        elif cosine_sim > 0.8:
            return 5
    except Exception:
        pass
    return 0

def score_avg_sentence_length(response: str) -> int:
    sentences = re.split(r'[.!?]', response)
    avg_len = sum(len(s.split()) for s in sentences if s.strip()) / max(1, len(re.findall(r'[.!?]', response)))
    if avg_len < 20:
        return 20
    elif avg_len < 25:
        return 15
    elif avg_len < 30:
        return 10
    elif avg_len < 35:
        return 5
    return 0

def score_length(response: str, intent: str) -> int:
    word_count = len(response.split())
    if intent == "summarize":
        if word_count < 40: return 20
        elif word_count < 60: return 15
        elif word_count < 80: return 10
        elif word_count < 100: return 5
        else: return 0
    else:
        if word_count > 150: return 20
        elif word_count > 100: return 15
        elif word_count > 50: return 10
        elif word_count > 25: return 5
        else: return 0

async def validate_chain_of_thought(response: str) -> float:
    eval_prompt = f"""You are a reasoning evaluator. Analyze the following answer and rate how logically sound, step-by-step, and coherent the reasoning is.

Answer:
{response}

Respond with a number from 0 to 10 only, no explanation."""
    print("[DEBUG] Sending CoT validation prompt to LLM:")
    print(eval_prompt)
    try:
        evaluation = await llm_3.ainvoke([HumanMessage(content=eval_prompt)])
        print("[DEBUG] Raw LLM CoT score response:", evaluation.content)
        raw_score = int("".join(filter(str.isdigit, evaluation.content)))
        return min(max(raw_score, 0), 10)
    except Exception as e:
        print("[ERROR] Failed to extract CoT score:", str(e))
        return 0

# ---- Main scoring function ----

async def score_response(prompt: str, response: str, intent: str) -> int:
    if intent == "translate":
        return 100

    score = 0
    score += score_length(response, intent)
    score += score_overlap(prompt, response)
    score += score_cosine_similarity(prompt, response)
    score += score_avg_sentence_length(response)
    score += await validate_chain_of_thought(response) * 2

    return int(round(score / 10.0) * 10)

# ======================== Fallback Handler ========================

async def enhance_prompt(prompt: str):
    intent = detect_intent(prompt)
    incoming_vec = embedding_model.embed_query(prompt)

    # Custom instruction based on intent
    if intent == "summarize":
        custom_instruction = (
            "Ensure your summary is under 40 words, includes key terms from the input, "
            "is written with high clarity using simple sentences, and closely reflects "
            "the original meaning to maximize semantic similarity.\n\n"
        )
    else:
        custom_instruction = (
            "Ensure your response is over 150 words, includes many keywords from the input, "
            "is written with high clarity using short, readable sentences, uses step-by-step reasoning "
            "when appropriate, and closely matches the intended meaning to maximize semantic similarity.\n\n"
        )

    modified_prompt = custom_instruction + prompt
    template = prompt_templates.get(intent, prompt_templates["default"])
    chain = template | llm_4o
    model_used = "gpt-4o"

    try:
        print(f"[DEBUG] Enhancing response with GPT-4o override (intent={intent})")
        response = await chain.ainvoke({"input": modified_prompt})
        score = await score_response(prompt, response.content, intent)
        cot_score = await validate_chain_of_thought(response.content)

        log_to_neo4j(prompt, intent, response.content, score, cot_score, model_used, email)
        CACHE.append((incoming_vec, intent, response.content, model_used))

        return intent, response.content, score, model_used
    except Exception as e:
        print("[ERROR] Failed in enhance_prompt:", e)
        return intent, "[ERROR] GPT-4o override failed.", 0, model_used


# ======================== Neo4j Logging ========================

driver = GraphDatabase.driver(NEO4J_URI, auth=(NEO4J_USERNAME, NEO4J_PASSWORD))

def log_to_neo4j(prompt: str, intent: str, response: str, score: float, cot_score: float, model: str, email=None):
    with driver.session() as session:
        session.run(
    """
    CREATE (i:Interaction {
        prompt: $prompt,
        intent: $intent,
        response: $response,
        score: $score,
        cot_score: $cot_score,
        model: $model,
        email: $email,
        timestamp: datetime()
    })
    """,
    prompt=prompt,
    intent=intent,
    response=response,
    score=score,
    cot_score=cot_score,
    model=model,
    email=email,
)


