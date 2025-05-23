"""
===================================================================
  router.py — Defines API endpoints for handling prompt operations
===================================================================

This file sets up and defines the main HTTP routes (endpoints) used 
by the frontend to interact with the backend's prompt processing logic.

Key functionalities:
1. Accepts incoming POST requests with user prompts.
2. Delegates prompt processing to utility functions.
3. Returns structured JSON responses including model metadata.
4. Supports an optional email field for user/session tracking.
5. Separates basic prompt handling (/prompt) from enhancement logic (/enhance).

===================================================================
"""

from fastapi import APIRouter
from pydantic import BaseModel
from utils import route_prompt, enhance_prompt  

router = APIRouter()

# ============================================================
# Request schema for prompt submission
# Contains:
#   - prompt (str): required user input prompt
#   - email (Optional[str]): optional user email for tracking
# ============================================================
class PromptInput(BaseModel):
    prompt: str
    email: str | None = None

# ============================================================
# POST /prompt
# Accepts a prompt and optional email from the client.
# Routes the prompt through the classification and response
# generation pipeline and returns the result.
# ============================================================
@router.post("/prompt")
async def handle_prompt(data: PromptInput):
    intent, response, score, model_used, served_from_cache = await route_prompt(data.prompt, data.email)
    return {
        "intent": intent,
        "response": response,
        "score": score,
        "model": model_used,
        "served_from_cache": served_from_cache
    }

# ============================================================
# POST /enhance
# Accepts a prompt and optional email from the client.
# Enhances the prompt using a specialized enhancement pipeline
# and returns the improved result.
# ============================================================
@router.post("/enhance")
async def enhance_route(data: PromptInput):
    intent, response, score, model_used = await enhance_prompt(data.prompt, data.email)
    return {
        "intent": intent,
        "response": response,
        "score": score,
        "model": model_used
    }
