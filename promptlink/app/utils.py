from langchain.chat_models import ChatOpenAI
from langchain.prompts import ChatPromptTemplate
from langchain.schema import HumanMessage
import os
from dotenv import load_dotenv
from neo4j import GraphDatabase

load_dotenv()


NEO4J_URI = os.getenv("NEO4J_URI")
NEO4J_USERNAME = os.getenv("NEO4J_USERNAME")
NEO4J_PASSWORD = os.getenv("NEO4J_PASSWORD")

llm = ChatOpenAI(model="gpt-3.5-turbo", openai_api_key=os.getenv("OPENAI_API_KEY"))

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



def score_response(prompt: str, response: str) -> float:
    """
    Score the response based on simple heuristics.
    You can improve this later with eval chains.
    """
    score = 0

    # Heuristic 1: Length
    if len(response) > 100:
        score += 0.5

    # Heuristic 2: Keyword overlap
    overlap = set(prompt.lower().split()) & set(response.lower().split())
    if len(overlap) > 2:
        score += 0.5

    return round(score, 2)

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
