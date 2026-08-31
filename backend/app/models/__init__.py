"""Import all models so Base.metadata is fully populated for Alembic /
create_all() (test suite uses SQLite create_all)."""
from app.models.alert import Alert, AlertType  # noqa: F401
from app.models.advertisement import Advertisement, AdvertisementVersion  # noqa: F401
from app.models.api_credential import ApiCredential, CredentialStatus, MarketplaceEnum  # noqa: F401
from app.models.auth_token import PasswordResetToken, RefreshTokenRecord  # noqa: F401
from app.models.competitor import Competitor  # noqa: F401
from app.models.fees import Fee, LogisticsRate, LogisticsType  # noqa: F401
from app.models.keyword import Keyword, KeywordHistory  # noqa: F401
from app.models.listing import Listing, ListingHistory, ListingPrice  # noqa: F401
from app.models.monitoring import MonitoredProduct  # noqa: F401
from app.models.opportunity import Opportunity  # noqa: F401
from app.models.organization import Organization, OrganizationMember, OrgRole  # noqa: F401
from app.models.product import Product  # noqa: F401
from app.models.sales import RevenueEstimate, SalesEstimate, SalesHistory  # noqa: F401
from app.models.supplier import Supplier, SupplierProduct  # noqa: F401
from app.models.user import User  # noqa: F401
