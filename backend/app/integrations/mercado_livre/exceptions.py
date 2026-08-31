class MercadoLivreError(Exception):
    """Base error for Mercado Livre integration failures."""


class InvalidCredentialsError(MercadoLivreError):
    """client_id/client_secret rejected by Mercado Livre."""


class ExpiredAuthorizationCodeError(MercadoLivreError):
    """The OAuth `code` is invalid, already used, or expired."""


class NetworkError(MercadoLivreError):
    """Could not reach Mercado Livre (timeout, DNS, connection error, 5xx)."""


class TokenRefreshError(MercadoLivreError):
    """Refresh token rejected or expired; user must reconnect."""
