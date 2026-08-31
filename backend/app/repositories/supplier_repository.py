from app.models.supplier import Supplier, SupplierProduct
from app.repositories.base import OrgScopedRepository


class SupplierRepository(OrgScopedRepository[Supplier]):
    model = Supplier


class SupplierProductRepository(OrgScopedRepository[SupplierProduct]):
    model = SupplierProduct
