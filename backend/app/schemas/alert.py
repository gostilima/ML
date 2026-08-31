from datetime import datetime
from typing import Optional

from app.models.alert import AlertType
from app.schemas.common import ORMBase


class AlertOut(ORMBase):
    id: str
    product_id: Optional[str] = None
    type: AlertType
    message: str
    is_read: bool
    created_at: datetime
