"""Shared Groq chat completion helper for agents."""

from __future__ import annotations

import os

from groq import Groq
from groq import APIConnectionError, APIStatusError

MODEL = "llama-3.3-70b-versatile"

_client: Groq | None = None


def _get_client() -> Groq:
    global _client
    if _client is None:
        key = os.environ.get("GROQ_API_KEY")
        if not key:
            raise RuntimeError(
                "GROQ_API_KEY is not set. Add it to your .env file or environment."
            )
        _client = Groq(api_key=key)
    return _client


def _assistant_text(resp) -> str:
    content = resp.choices[0].message.content
    if content is None or not str(content).strip():
        raise RuntimeError("The model returned an empty message.")
    return str(content).strip()


def complete_chat(
    messages: list[dict[str, str]],
    *,
    response_format: dict | None = None,
    temperature: float = 0.5,
) -> str:
    """Run a chat completion and return assistant text."""
    kwargs: dict = {
        "model": MODEL,
        "messages": messages,
        "temperature": temperature,
    }
    if response_format is not None:
        kwargs["response_format"] = response_format
    try:
        resp = _get_client().chat.completions.create(**kwargs)
    except APIStatusError as e:
        raise RuntimeError(f"Groq API error ({e.status_code}): {e.message}") from e
    except APIConnectionError as e:
        raise RuntimeError(f"Groq connection failed: {e.message}") from e
    return _assistant_text(resp)
