"""AIProvider interface for generating/optimizing advertisement copy.

A mock implementation is used whenever settings.AI_API_KEY is unset, so the
advertisements endpoints work out of the box without a real AI backend.
"""
from abc import ABC, abstractmethod
from typing import Optional

from app.core.config import settings


class AIProvider(ABC):
    @abstractmethod
    async def generate_listing_copy(self, *, product_name: str, category: Optional[str], key_features: Optional[list[str]]) -> tuple[str, str]:
        ...

    @abstractmethod
    async def optimize_listing_copy(self, *, current_title: str, current_description: Optional[str]) -> tuple[str, str]:
        ...


class MockAIProvider(AIProvider):
    async def generate_listing_copy(self, *, product_name: str, category: Optional[str], key_features: Optional[list[str]]) -> tuple[str, str]:
        features = ", ".join(key_features) if key_features else "alta qualidade e ótimo custo-benefício"
        title = f"{product_name}" + (f" - {category}" if category else "")
        description = f"{product_name}: {features}. Envio rápido e garantia de satisfação."
        return title[:500], description

    async def optimize_listing_copy(self, *, current_title: str, current_description: Optional[str]) -> tuple[str, str]:
        title = current_title if len(current_title) <= 60 else current_title[:57] + "..."
        description = (current_description or "") + "\n\n[Otimizado] Frete rápido, qualidade garantida."
        return title, description


def get_ai_provider() -> AIProvider:
    # A real provider would be wired here based on settings.AI_API_KEY.
    if not settings.AI_API_KEY:
        return MockAIProvider()
    return MockAIProvider()
