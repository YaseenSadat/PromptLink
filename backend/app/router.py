from fastapi import APIRouter
from pydantic import BaseModel
from app.utils import route_prompt

router = APIRouter()

class PromptInput(BaseModel):
    prompt: str

@router.post("/prompt")
async def handle_prompt(data: PromptInput):
    intent, response, score = await route_prompt(data.prompt)
    return {
        "intent": intent,
        "response": response,
        "score": score
    }
