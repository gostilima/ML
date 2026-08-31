from app.integrations.mercado_livre.base_client import MercadoLivreApiClient


class UsersService:
    def __init__(self, client: MercadoLivreApiClient):
        self.client = client

    async def get_me(self) -> dict:
        return await self.client.get("/users/me")
