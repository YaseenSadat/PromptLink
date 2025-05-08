from langchain.chat_models import ChatOpenAI
from langchain.prompts import ChatPromptTemplate
from langchain.schema import HumanMessage
import os
from dotenv import load_dotenv

load_dotenv()

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
def route_prompt(prompt: str) -> str:
    intent = detect_intent(prompt)
    template = prompt_templates[intent]
    chain = template | llm
    response = chain.invoke({"input": prompt})
    return intent, response.content
