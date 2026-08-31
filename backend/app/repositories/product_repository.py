from app.models.product import Product
from app.repositories.base import OrgScopedRepository


class ProductRepository(OrgScopedRepository[Product]):
    model = Product
