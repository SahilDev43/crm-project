from fastapi import APIRouter, Depends, Query, status

from app.core.jwt import get_current_user

from app.modules.invoices.dependencies import get_invoice_service
from app.modules.invoices.schema import (
InvoiceCreate,
    InvoiceResponse,
    InvoiceListResponse,
    InvoicePaymentCreate,
    InvoicePaymentResponse,
    InvoicePaymentSummary,
    InvoiceItemCreate,
    InvoiceItemUpdate,
    InvoiceUpdate
)
from app.modules.invoices.service import InvoiceService
from fastapi.responses import StreamingResponse

router = APIRouter(
    prefix="/invoices",
    tags=["Invoices"],
)

@router.post(
    "",
    response_model=InvoiceResponse,
    status_code=status.HTTP_201_CREATED
)

async def create_invoice(
    data: InvoiceCreate,
    service: InvoiceService = Depends(get_invoice_service),
    current_user = Depends(get_current_user)
):
    return await service.create_invoice(
        data=data,
        company_id=current_user.company_id
    )

@router.get(
    "",
    response_model=InvoiceListResponse,
)
async def get_invoices(
    status: int | None = Query(
        default=None,
        ge=1,
        le=7,
    ),
    deal_id: int | None = Query(
        default=None,
        gt=0,
    ),
    page: int = Query(
        default=1,
        ge=1,
    ),
    page_size: int = Query(
        default=20,
        ge=1,
        le=100,
    ),
    service: InvoiceService = Depends(get_invoice_service),
    current_user=Depends(get_current_user),
):
    return await service.get_invoices(
        company_id=current_user.company_id,
        page=page,
        page_size=page_size,
        status=status,
        deal_id=deal_id,
    )

@router.patch(
    "/{invoice_id}/items/{item_id}",
    response_model=InvoiceResponse
)
async def update_invoice_item(
    invoice_id: int,
    item_id: int,
    data: InvoiceItemUpdate,
    service: InvoiceService = Depends(get_invoice_service),
    current_user=Depends(get_current_user)
):
    return await service.update_invoice_item(
        invoice_id=invoice_id,
        item_id=item_id,
        data=data,
        company_id=current_user.company_id
    )

@router.post(
    "/{invoice_id}/issue",
    response_model=InvoiceResponse
)
async def issue_invoice(
    invoice_id: int,
    service: InvoiceService = Depends(get_invoice_service),
    current_user=Depends(get_current_user)
):
    return await service.issue_invoice(
        invoice_id=invoice_id,
        company_id=current_user.company_id
    )

@router.post(
    "/{invoice_id}/cancel",
    response_model=InvoiceResponse
)
async def cancel_invoice(
    invoice_id: int,
    service: InvoiceService = Depends(get_invoice_service),
    current_user=Depends(get_current_user)
):
    return await service.cancel_invoice(
        invoice_id=invoice_id,
        company_id=current_user.company_id
    )

@router.get(
    "/{invoice_id}/pdf"
)
async def get_invoice_pdf(
    invoice_id: int,
    service: InvoiceService = Depends(get_invoice_service),
    current_user=Depends(get_current_user)
):
    pdf = await service.generate_invoice_pdf(
        invoice_id=invoice_id,
        company_id=current_user.company_id
    )

    return StreamingResponse(
        pdf,
        media_type="application/pdf",
        headers={
            "Content-Disposition": (
                f'inline; filename="invoice-{invoice_id}.pdf"'
            )
        }
    )

@router.post(
    "/{invoice_id}/payments",
    response_model=InvoicePaymentResponse,
    status_code=status.HTTP_201_CREATED
)

async def add_invoice_payment(
    invoice_id: int,
    data: InvoicePaymentCreate,
    service: InvoiceService = Depends(get_invoice_service),
    current_user=Depends(get_current_user)
):

    return await service.add_payment(
        invoice_id=invoice_id,
        data=data
    )

@router.get(
    "/{invoice_id}/payments",
    response_model=list[InvoicePaymentResponse]
)
async def get_invoice_payments(
    invoice_id: int,
    service: InvoiceService = Depends(get_invoice_service),
    current_user=Depends(get_current_user),
):
    return await service.get_payments(
        invoice_id=invoice_id,
    )

@router.get(
    "/{invoice_id}/payment-summary",
    response_model=InvoicePaymentSummary
)
async def get_invoice_payment_summary(
    invoice_id: int,
    service: InvoiceService = Depends(get_invoice_service),
    current_user=Depends(get_current_user)
):
    return await service.get_payment_summary(
        invoice_id=invoice_id
    )

@router.delete(
    "/{invoice_id}/items/{item_id}",
    response_model=InvoiceResponse,
)
async def delete_invoice_item(
    invoice_id: int,
    item_id: int,
    service: InvoiceService = Depends(get_invoice_service),
    current_user=Depends(get_current_user),
):
    return await service.delete_invoice_item(
        invoice_id=invoice_id,
        item_id=item_id,
        company_id=current_user.company_id,
    )

@router.post(
    "/{invoice_id}/items",
    response_model=InvoiceResponse,
    status_code=status.HTTP_201_CREATED,
)
async def add_invoice_item(
    invoice_id: int,
    data: InvoiceItemCreate,
    service: InvoiceService = Depends(get_invoice_service),
    current_user=Depends(get_current_user),
):
    return await service.add_invoice_item(
        invoice_id=invoice_id,
        data=data,
        company_id=current_user.company_id,
    )

@router.patch(
    "/{invoice_id}",
    response_model=InvoiceResponse,
)
async def update_invoice(
    invoice_id: int,
    data: InvoiceUpdate,
    service: InvoiceService = Depends(get_invoice_service),
    current_user=Depends(get_current_user),
):
    return await service.update_invoice(
        invoice_id=invoice_id,
        data=data,
        company_id=current_user.company_id,
    )

@router.delete(
    "/{invoice_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
async def delete_invoice(
    invoice_id: int,
    service: InvoiceService = Depends(get_invoice_service),
    current_user=Depends(get_current_user),
):
    await service.delete_invoice(
        invoice_id=invoice_id,
        company_id=current_user.company_id,
    )

@router.get(
    "/{invoice_id}",
    response_model=InvoiceResponse,
)
async def get_invoice(
    invoice_id: int,
    service: InvoiceService = Depends(get_invoice_service),
    current_user=Depends(get_current_user),
):
    return await service.get_invoice(
        invoice_id=invoice_id,
        company_id=current_user.company_id,
    )
