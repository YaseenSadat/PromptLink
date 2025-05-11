from fastapi import APIRouter
from pydantic import BaseModel
from app.utils import route_prompt, enhance_prompt  # ⬅️ include enhance_prompt here

router = APIRouter()

class PromptInput(BaseModel):
    prompt: str

@router.post("/prompt")
async def handle_prompt(data: PromptInput):
    intent, response, score, model_used, served_from_cache = await route_prompt(data.prompt)
    return {
        "intent": intent,
        "response": response,
        "score": score,
        "model": model_used,
        "served_from_cache": served_from_cache
    }

@router.post("/enhance")
async def enhance_route(data: PromptInput):
    intent, response, score, model_used = await enhance_prompt(data.prompt)
    return {
        "intent": intent,
        "response": response,
        "score": score,
        "model": model_used
    }
