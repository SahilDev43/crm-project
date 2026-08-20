from fastapi import Depends

from app.db.session import get_db
from app.db.unit_of_work import UnitOfWork

from app.modules.deals.repository import DealRepository
from app.modules.invoices.repository import InvoiceRepository
from app.modules.invoices.service import InvoiceService
from app.modules.companies.repository import CompanyRepository

def get_invoice_service(
    db=Depends(get_db),
) -> InvoiceService:

    repository = InvoiceRepository(db)
    deal_repository = DealRepository(db)
    company_repository = CompanyRepository(db)
    uow = UnitOfWork(db)

    return InvoiceService(
        repo=repository,
        uow=uow,
        deal_repo=deal_repository,
        company_repo=company_repository
    )