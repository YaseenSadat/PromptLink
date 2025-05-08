from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()

class PromptInput(BaseModel):
    prompt: str

@router.post("/prompt")
async def handle_prompt(data: PromptInput):
    return {"message": f"Received prompt: {data.prompt}"}
