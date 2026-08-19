from datetime import date, datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field


# ---------------------------------------------------------
# Invoice Item
# ---------------------------------------------------------

class InvoiceItemCreate(BaseModel):
    description: str

    quantity: Decimal = Field(
        default=1,
        gt=0,
        max_digits=15,
        decimal_places=3,
    )

    unit_price: Decimal = Field(
        ge=0,
        max_digits=15,
        decimal_places=2,
    )

    discount: Decimal = Field(
        default=0,
        ge=0,
        max_digits=15,
        decimal_places=2,
    )

    gst_rate: Decimal = Field(
        default=0,
        ge=0,
        le=100,
        max_digits=5,
        decimal_places=2,
    )


class InvoiceItemUpdate(BaseModel):
    description: str | None = None

    quantity: Decimal | None = Field(
        default=None,
        gt=0,
        max_digits=15,
        decimal_places=3,
    )

    unit_price: Decimal | None = Field(
        default=None,
        ge=0,
        max_digits=15,
        decimal_places=2,
    )

    discount: Decimal | None = Field(
        default=None,
        ge=0,
        max_digits=15,
        decimal_places=2,
    )

    gst_rate: Decimal | None = Field(
        default=None,
        ge=0,
        le=100,
        max_digits=5,
        decimal_places=2,
    )


class InvoiceItemResponse(BaseModel):
    id: int
    invoice_id: int

    description: str
    quantity: Decimal
    unit_price: Decimal
    discount: Decimal

    taxable_amount: Decimal

    gst_rate: Decimal

    cgst_rate: Decimal
    cgst_amount: Decimal

    sgst_rate: Decimal
    sgst_amount: Decimal

    igst_rate: Decimal
    igst_amount: Decimal

    total: Decimal

    model_config = ConfigDict(
        from_attributes=True
    )


# ---------------------------------------------------------
# Invoice
# ---------------------------------------------------------

class InvoiceCreate(BaseModel):
    deal_id: int

    invoice_date: date
    due_date: date | None = None

    customer_name: str
    customer_company: str | None = None
    customer_email: str | None = None
    customer_phone: str | None = None
    customer_address: str | None = None

    customer_state: str | None = None
    customer_state_code: str | None = None
    customer_gstin: str | None = None

    notes: str | None = None

    items: list[InvoiceItemCreate] = Field(
        min_length=1
    )


class InvoiceUpdate(BaseModel):
    due_date: date | None = None

    customer_name: str | None = None
    customer_company: str | None = None
    customer_email: str | None = None
    customer_phone: str | None = None
    customer_address: str | None = None

    customer_state: str | None = None
    customer_state_code: str | None = None
    customer_gstin: str | None = None

    notes: str | None = None

    status: int | None = Field(
        default=None,
        ge=1,
        le=7,
    )


class InvoiceResponse(BaseModel):
    id: int

    company_id: int
    deal_id: int

    invoice_number: str

    invoice_date: date
    due_date: date | None

    customer_name: str
    customer_company: str | None
    customer_email: str | None
    customer_phone: str | None
    customer_address: str | None

    customer_state: str | None
    customer_state_code: str | None
    customer_gstin: str | None

    subtotal: Decimal
    discount: Decimal
    taxable_amount: Decimal

    cgst_amount: Decimal
    sgst_amount: Decimal
    igst_amount: Decimal
    total_tax: Decimal

    grand_total: Decimal

    status: int
    notes: str | None

    created_at: datetime
    updated_at: datetime

    items: list[InvoiceItemResponse] = []

    model_config = ConfigDict(
        from_attributes=True
    )


class InvoiceListResponse(BaseModel):
    items: list[InvoiceResponse]
    total: int
    page: int
    page_size: int
    total_pages: int


# ---------------------------------------------------------
# Payment
# ---------------------------------------------------------

class InvoicePaymentCreate(BaseModel):
    payment_date: date

    amount: Decimal = Field(
        gt=0,
        max_digits=15,
        decimal_places=2,
    )

    payment_method: str

    transaction_reference: str | None = None
    remarks: str | None = None


class InvoicePaymentResponse(BaseModel):
    id: int
    invoice_id: int

    payment_date: date
    amount: Decimal

    payment_method: str
    transaction_reference: str | None
    remarks: str | None

    model_config = ConfigDict(
        from_attributes=True
    )