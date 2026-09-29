"""Schemas Pydantic partages par le moteur IA."""

from typing import Any, Dict, Optional

from pydantic import BaseModel


class AIMessage(BaseModel):
    """Message individuel dans une conversation."""
    role: str
    content: str


class AIRequest(BaseModel):
    """Requete normalisee vers un provider IA."""
    system_prompt: str
    user_prompt: str
    temperature: float = 0.2
    max_tokens: Optional[int] = None
    response_format_json: bool = True


class AIResponse(BaseModel):
    """Reponse normalisee d un provider IA."""
    content: str
    provider: str
    model: str
    tokens_input: Optional[int] = None
    tokens_output: Optional[int] = None
    latency_ms: int = 0
    raw: Optional[Dict[str, Any]] = None


class AIProviderInfo(BaseModel):
    """Metadonnees d un provider."""
    name: str
    model: str
    available: bool
    priority: int = 0
