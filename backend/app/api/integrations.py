from typing import Optional
from urllib.parse import urlencode

from fastapi import APIRouter, Depends
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.db import get_db
from app.core.deps import get_current_org
from app.core.responses import AppError, success_envelope
from app.integrations.mercado_livre.exceptions import MercadoLivreError
from app.models.organization import Organization
from app.schemas.api_credential import AuthorizeUrlOut, CredentialCreateRequest, CredentialOut
from app.services.api_credential_service import ApiCredentialService

router = APIRouter(prefix="/integrations/mercado-livre", tags=["integrations"])


@router.post("/credentials")
def save_credentials(
    payload: CredentialCreateRequest,
    org: Organization = Depends(get_current_org),
    db: Session = Depends(get_db),
):
    service = ApiCredentialService(db)
    result = service.save_credentials(org.id, payload.client_id, payload.client_secret, payload.redirect_uri)
    return success_envelope(result)


@router.get("/credentials")
def get_credentials(org: Organization = Depends(get_current_org), db: Session = Depends(get_db)):
    service = ApiCredentialService(db)
    result = service.get_credentials(org.id)
    return success_envelope(result)


@router.delete("/credentials")
def delete_credentials(org: Organization = Depends(get_current_org), db: Session = Depends(get_db)):
    service = ApiCredentialService(db)
    service.delete_credentials(org.id)
    return success_envelope({"message": "Mercado Livre credentials disconnected."})


@router.get("/oauth/authorize-url")
def get_authorize_url(
    redirect_uri: Optional[str] = None,
    org: Organization = Depends(get_current_org),
    db: Session = Depends(get_db),
):
    service = ApiCredentialService(db)
    url, state = service.build_authorize_url(org.id, redirect_uri)
    return success_envelope(AuthorizeUrlOut(authorize_url=url, state=state))


@router.get("/oauth/callback")
async def oauth_callback(
    code: Optional[str] = None,
    state: Optional[str] = None,
    error: Optional[str] = None,
    db: Session = Depends(get_db),
):
    """Public callback endpoint hit by the user's browser via Mercado Livre's
    redirect -- org is resolved from the signed `state` param (CSRF
    protection), not from the caller's auth header.

    This is a browser-facing redirect target, not a JSON API: it always
    finishes by 302-redirecting the browser back to the frontend's
    /configuracoes page with either `?ml_connected=1` or `?ml_error=<msg>`,
    which is the contract the frontend's settings page expects.
    """
    redirect_base = f"{settings.FRONTEND_URL.rstrip('/')}/configuracoes"

    if error:
        return RedirectResponse(f"{redirect_base}?{urlencode({'ml_error': error})}")
    if not code or not state:
        return RedirectResponse(f"{redirect_base}?{urlencode({'ml_error': 'missing_code_or_state'})}")

    service = ApiCredentialService(db)
    try:
        await service.handle_callback(code, state)
    except AppError as exc:
        return RedirectResponse(f"{redirect_base}?{urlencode({'ml_error': exc.message})}")
    except (MercadoLivreError, ValueError) as exc:
        return RedirectResponse(f"{redirect_base}?{urlencode({'ml_error': str(exc)})}")

    return RedirectResponse(f"{redirect_base}?{urlencode({'ml_connected': '1'})}")


@router.post("/oauth/refresh")
async def oauth_refresh(org: Organization = Depends(get_current_org), db: Session = Depends(get_db)):
    service = ApiCredentialService(db)
    result = await service.refresh_token(org.id)
    return success_envelope(result)
