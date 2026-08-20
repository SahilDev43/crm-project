import math
from datetime import date
from decimal import Decimal, ROUND_HALF_UP
from sqlalchemy import func, select

from app.common.exceptions import DealNotFoundError, CompanyNotFoundError, CompanyBillingDetailsRequiredError, InvoiceNotFoundError, PaymentExceedsInvoiceBalanceError, InvalidInvoiceStatusTransitionError, InvoiceCannotBeCancelledError

from app.db.unit_of_work import UnitOfWork
from app.modules.invoices.model import Invoice
from app.modules.invoices.item_model import InvoiceItem
from app.modules.invoices.schema import (InvoiceCreate, InvoicePaymentCreate, InvoicePaymentSummary, InvoiceItemUpdate, InvoiceUpdate)
from app.modules.invoices.repository import InvoiceRepository
from app.modules.deals.repository import DealRepository
from app.modules.companies.repository import CompanyRepository
from app.modules.invoices.payment_model import InvoicePayment
from app.modules.invoices.pdf_service import InvoicePDFService

class InvoiceService:

    def __init__(
        self,
        repo: InvoiceRepository,
        uow: UnitOfWork,
        deal_repo: DealRepository,
        company_repo: CompanyRepository
    ):
        self.repo = repo
        self.uow = uow
        self.deal_repo = deal_repo
        self.company_repo = company_repo

    @staticmethod
    def _calculate_gst(
        taxable_amount: Decimal,
        gst_rate: Decimal,
        same_state: bool,
    ) -> dict:

        taxable_amount = Decimal(taxable_amount)
        gst_rate = Decimal(gst_rate)

        total_tax = (
            taxable_amount * gst_rate / Decimal("100")
        ).quantize(
            Decimal("0.01"),
            rounding=ROUND_HALF_UP,
        )

        if same_state:
            half_rate = gst_rate / Decimal("2")

            cgst_amount = (
                taxable_amount * half_rate / Decimal("100")
            ).quantize(
                Decimal("0.01"),
                rounding=ROUND_HALF_UP,
            )

            sgst_amount = (
                taxable_amount * half_rate / Decimal("100")
            ).quantize(
                Decimal("0.01"),
                rounding=ROUND_HALF_UP,
            )

            return {
                "gst_rate": gst_rate,
                "cgst_rate": half_rate,
                "cgst_amount": cgst_amount,
                "sgst_rate": half_rate,
                "sgst_amount": sgst_amount,
                "igst_rate": Decimal("0"),
                "igst_amount": Decimal("0"),
                "total_tax": cgst_amount + sgst_amount,
            }

        return {
            "gst_rate": gst_rate,
            "cgst_rate": Decimal("0"),
            "cgst_amount": Decimal("0"),
            "sgst_rate": Decimal("0"),
            "sgst_amount": Decimal("0"),
            "igst_rate": gst_rate,
            "igst_amount": total_tax,
            "total_tax": total_tax,
        }

    @staticmethod
    def _validate_gst_states(
        company_state_code: str | None,
        customer_state_code: str | None
    ) -> bool:

        if not company_state_code:
            raise CompanyBillingDetailsRequiredError()

        if not customer_state_code:
            raise CompanyBillingDetailsRequiredError()

        return (
            company_state_code.strip().lower() == customer_state_code.strip().lower()
        )

    async def _generate_invoice_number(
        self,
        company_id: int,
    ) -> str:

        year = date.today().year

        prefix = f"INV-{year}-"

        result = await self.repo.db.execute(
            select(func.max(Invoice.id)).where(
                Invoice.company_id == company_id
            )
        )

        last_id = result.scalar_one()

        next_number = (last_id or 0) + 1

        return f"{prefix}{next_number:04d}"


    async def create_invoice(
        self,
        data: InvoiceCreate,
        company_id: int,
    ) -> Invoice:

        # ---------------------------------------------------------
        # Validate Deal
        # ---------------------------------------------------------

        deal = await self.deal_repo.get_by_id(
            data.deal_id
        )

        if not deal:
            raise DealNotFoundError()

        if deal.company_id != company_id:
            raise DealNotFoundError()

        company = await self.company_repo.get_by_id(
            company_id
        )

        if not company:
            raise CompanyNotFoundError()

        # ---------------------------------------------------------
        # Generate invoice number
        # ---------------------------------------------------------

        invoice_number = await self._generate_invoice_number(
            company_id=company_id
        )

        # ---------------------------------------------------------
        # Determine GST type
        # ---------------------------------------------------------

        # For now, company state will be determined from the
        # authenticated company's configuration.
        #
        # Until company GST/state fields are available,
        # we will temporarily use the customer state comparison
        # hook here and complete company-state lookup next.

        same_state = self._validate_gst_states(
            company_state_code=company.state_code,
            customer_state_code=data.customer_state_code,
        )

        # ---------------------------------------------------------
        # Create invoice
        # ---------------------------------------------------------

        invoice = Invoice(
            company_id=company_id,
            deal_id=data.deal_id,
            invoice_number=invoice_number,
            invoice_date=data.invoice_date,
            due_date=data.due_date,
            company_name=company.name,
            company_address=company.company_address,
            company_state=company.state,
            company_state_code=company.state_code,
            company_gstin=company.gst_number,
            customer_name=data.customer_name,
            customer_company=data.customer_company,
            customer_email=data.customer_email,
            customer_phone=data.customer_phone,
            customer_address=data.customer_address,
            customer_state=data.customer_state,
            customer_state_code=data.customer_state_code,
            customer_gstin=data.customer_gstin,

            subtotal=Decimal("0"),
            discount=Decimal("0"),
            taxable_amount=Decimal("0"),

            cgst_amount=Decimal("0"),
            sgst_amount=Decimal("0"),
            igst_amount=Decimal("0"),
            total_tax=Decimal("0"),

            grand_total=Decimal("0"),

            status=1,
            notes=data.notes,
        )

        subtotal = Decimal("0")
        total_discount = Decimal("0")
        taxable_amount = Decimal("0")

        total_cgst = Decimal("0")
        total_sgst = Decimal("0")
        total_igst = Decimal("0")

        # ---------------------------------------------------------
        # Calculate Items
        # ---------------------------------------------------------

        for item_data in data.items:

            gross_amount = (
                item_data.quantity *
                item_data.unit_price
            )

            item_discount = item_data.discount

            item_taxable = (
                gross_amount - item_discount
            )

            if item_taxable < 0:
                item_taxable = Decimal("0")

            item_taxable = item_taxable.quantize(
                Decimal("0.01"),
                rounding=ROUND_HALF_UP,
            )

            gst = self._calculate_gst(
                taxable_amount=item_taxable,
                gst_rate=item_data.gst_rate,
                same_state=same_state,
            )

            item_total = (
                item_taxable +
                gst["total_tax"]
            )

            invoice_item = InvoiceItem(
                description=item_data.description,
                quantity=item_data.quantity,
                unit_price=item_data.unit_price,
                discount=item_discount,

                taxable_amount=item_taxable,

                gst_rate=gst["gst_rate"],

                cgst_rate=gst["cgst_rate"],
                cgst_amount=gst["cgst_amount"],

                sgst_rate=gst["sgst_rate"],
                sgst_amount=gst["sgst_amount"],

                igst_rate=gst["igst_rate"],
                igst_amount=gst["igst_amount"],

                total=item_total,
            )

            invoice.items.append(invoice_item)

            subtotal += gross_amount
            total_discount += item_discount
            taxable_amount += item_taxable

            total_cgst += gst["cgst_amount"]
            total_sgst += gst["sgst_amount"]
            total_igst += gst["igst_amount"]

        # ---------------------------------------------------------
        # Invoice totals
        # ---------------------------------------------------------

        total_tax = (
            total_cgst +
            total_sgst +
            total_igst
        )

        grand_total = (
            taxable_amount +
            total_tax
        )

        invoice.subtotal = subtotal.quantize(
            Decimal("0.01"),
            rounding=ROUND_HALF_UP,
        )

        invoice.discount = total_discount.quantize(
            Decimal("0.01"),
            rounding=ROUND_HALF_UP,
        )

        invoice.taxable_amount = taxable_amount

        invoice.cgst_amount = total_cgst
        invoice.sgst_amount = total_sgst
        invoice.igst_amount = total_igst

        invoice.total_tax = total_tax
        invoice.grand_total = grand_total

        # ---------------------------------------------------------
        # Save transaction
        # ---------------------------------------------------------

        async with self.uow:

            await self.repo.create(invoice)

            await self.repo.flush()

        return await self.repo.get_by_id(invoice.id)

    async def add_payment(
        self,
        invoice_id: int,
        data: InvoicePaymentCreate
    ) -> InvoicePayment:

        invoice = await self.repo.get_by_id(
            invoice_id
        )

        if not invoice:
            raise InvoiceNotFoundError()

        total_paid = await self.repo.get_total_paid(
            invoice_id
        )

        total_paid = Decimal(total_paid)

        remaining_amount = (
            invoice.grand_total - total_paid
        )

        if data.amount > remaining_amount:
            raise PaymentExceedsInvoiceBalanceError()

        payment = InvoicePayment(
            invoice_id=invoice.id,
            payment_date=data.payment_date,
            amount=data.amount,
            payment_method=data.payment_method,
            transaction_reference=data.transaction_reference,
            remarks=data.remarks
        )

        new_total_paid = (
            total_paid + data.amount
        )

        if new_total_paid >= invoice.grand_total:
            invoice.status = 4

        elif new_total_paid > Decimal("0"):
            invoice.status = 3

        async with self.uow:

            await self.repo.add_payment(
                payment
            )

            await self.repo.flush()

        await self.repo.db.refresh(
            payment
        )

        return payment


    async def get_payments(
        self,
        invoice_id: int,
    ) -> list[InvoicePayment]:

        invoice = await self.repo.get_by_id(
            invoice_id
        )

        if not invoice:
            raise InvoiceNotFoundError()

        return await self.repo.get_payments(
            invoice_id
        )

    async def get_payment_summary(
        self,
        invoice_id: int
    ) -> InvoicePaymentSummary:

        invoice = await self.repo.get_by_id(invoice_id)

        if not invoice:
            raise InvoiceNotFoundError()

        total_paid = await self.repo.get_total_paid(invoice_id)

        total_paid = Decimal(total_paid)

        remaining_amount = (
            invoice.grand_total - total_paid
        )

        if remaining_amount < Decimal("0"):
            remaining_amount = Decimal("0")


        return InvoicePaymentSummary(
            invoice_id=invoice.id,
            grand_total=invoice.grand_total,
            total_paid=total_paid,
            remaining_amount=remaining_amount
        )

    async def get_invoices(
        self,
        company_id: int,
        page: int = 1,
        page_size: int = 20,
        status: int | None = None,
        deal_id: int | None = None
    ):
        invoice, total = await self.repo.get_all(
            company_id=company_id,
            page=page,
            page_size=page_size,
            status=status,
            deal_id=deal_id
        )

        total_pages = (
            math.ceil(total / page_size)
            if total
            else 0
        )

        return {
            "items": invoice,
            "total": total,
            "page": page,
            "page_size": page_size,
            "total_pages": total_pages
        }

    async def get_invoice(
        self,
        invoice_id: int,
        company_id: int
    ) -> Invoice:

        invoice = await self.repo.get_by_id(invoice_id)

        if not invoice or invoice.company_id != company_id:
            raise InvoiceNotFoundError()

        return invoice

    async def issue_invoice(
        self,
        invoice_id: int,
        company_id: int
    ) -> Invoice:

        invoice = await self.repo.get_by_id(invoice_id)

        if not invoice or invoice.company_id != company_id:
            raise InvoiceNotFoundError()

        if invoice.status != 1:
            raise InvalidInvoiceStatusTransitionError()

        invoice.status = 2

        async with self.uow:
            await self.repo.flush()

        await self.repo.refresh(invoice)

        return invoice

    async def cancel_invoice(
        self,
        invoice_id: int,
        company_id: int
    ) -> Invoice:

        invoice = await self.repo.get_by_id(invoice_id)

        if not invoice or invoice.company_id != company_id:
            raise InvoiceNotFoundError()

        if invoice.status in (4, 6):
            raise InvoiceCannotBeCancelledError()

        if invoice.status not in (1, 2):
            raise InvalidInvoiceStatusTransitionError()

        invoice.status = 6

        async with self.uow:
            await self.repo.flush()

        await self.repo.refresh(invoice)

        return invoice

    async def generate_invoice_pdf(
        self,
        invoice_id: int,
        company_id: int
    ):
        invoice = await self.repo.get_by_id(invoice_id)

        if not invoice or invoice.company_id != company_id:
            raise InvoiceNotFoundError()

        return InvoicePDFService.generate(invoice)

    async def _recalculate_invoice_totals(
        self,
        invoice: Invoice,
    ) -> None:

        subtotal = Decimal("0")
        total_discount = Decimal("0")
        taxable_amount = Decimal("0")

        total_cgst = Decimal("0")
        total_sgst = Decimal("0")
        total_igst = Decimal("0")

        for item in invoice.items:
            subtotal += (
                item.quantity * item.unit_price
            )

            total_discount += item.discount
            taxable_amount += item.taxable_amount

            total_cgst += item.cgst_amount
            total_sgst += item.sgst_amount
            total_igst += item.igst_amount

        total_tax = (
            total_cgst +
            total_sgst +
            total_igst
        )

        grand_total = (
            taxable_amount +
            total_tax
        )

        invoice.subtotal = subtotal.quantize(
            Decimal("0.01"),
            rounding=ROUND_HALF_UP,
        )

        invoice.discount = total_discount.quantize(
            Decimal("0.01"),
            rounding=ROUND_HALF_UP,
        )

        invoice.taxable_amount = taxable_amount.quantize(
            Decimal("0.01"),
            rounding=ROUND_HALF_UP,
        )

        invoice.cgst_amount = total_cgst.quantize(
            Decimal("0.01"),
            rounding=ROUND_HALF_UP,
        )

        invoice.sgst_amount = total_sgst.quantize(
            Decimal("0.01"),
            rounding=ROUND_HALF_UP,
        )

        invoice.igst_amount = total_igst.quantize(
            Decimal("0.01"),
            rounding=ROUND_HALF_UP,
        )

        invoice.total_tax = total_tax.quantize(
            Decimal("0.01"),
            rounding=ROUND_HALF_UP,
        )

        invoice.grand_total = grand_total.quantize(
            Decimal("0.01"),
            rounding=ROUND_HALF_UP,
        )

    def _build_invoice_item(
        self,
        item_data,
        same_state: bool,
    ) -> InvoiceItem:

        gross_amount = (
            item_data.quantity *
            item_data.unit_price
        )

        item_discount = item_data.discount

        item_taxable = (
            gross_amount - item_discount
        )

        if item_taxable < Decimal("0"):
            item_taxable = Decimal("0")

        item_taxable = item_taxable.quantize(
            Decimal("0.01"),
            rounding=ROUND_HALF_UP,
        )

        gst = self._calculate_gst(
            taxable_amount=item_taxable,
            gst_rate=item_data.gst_rate,
            same_state=same_state,
        )

        item_total = (
            item_taxable +
            gst["total_tax"]
        )

        return InvoiceItem(
            description=item_data.description,
            quantity=item_data.quantity,
            unit_price=item_data.unit_price,
            discount=item_discount,

            taxable_amount=item_taxable,

            gst_rate=gst["gst_rate"],

            cgst_rate=gst["cgst_rate"],
            cgst_amount=gst["cgst_amount"],

            sgst_rate=gst["sgst_rate"],
            sgst_amount=gst["sgst_amount"],

            igst_rate=gst["igst_rate"],
            igst_amount=gst["igst_amount"],

            total=item_total,
        )

    async def add_invoice_item(
        self,
        invoice_id: int,
        data,
        company_id: int,
    ) -> Invoice:

        invoice = await self.repo.get_by_id(
            invoice_id
        )

        if not invoice or invoice.company_id != company_id:
            raise InvoiceNotFoundError()

        if invoice.status != 1:
            raise InvalidInvoiceStatusTransitionError(
                "Only draft invoices can be modified"
            )

        same_state = self._validate_gst_states(
            company_state_code=invoice.company_state_code,
            customer_state_code=invoice.customer_state_code,
        )

        item = self._build_invoice_item(
            item_data=data,
            same_state=same_state,
        )

        invoice.items.append(item)

        await self._recalculate_invoice_totals(
            invoice
        )

        async with self.uow:
            await self.repo.flush()

        return await self.repo.get_by_id(
            invoice.id
        )

    async def update_invoice_item(
        self,
        invoice_id: int,
        item_id: int,
        data: InvoiceItemUpdate,
        company_id: int,
    ) -> Invoice:

        invoice = await self.repo.get_by_id(
            invoice_id
        )

        if not invoice or invoice.company_id != company_id:
            raise InvoiceNotFoundError()

        # Only draft invoices can be modified
        if invoice.status != 1:
            raise InvalidInvoiceStatusTransitionError(
                "Only draft invoices can be modified"
            )

        item = await self.repo.get_item_by_id(
            item_id
        )

        if not item or item.invoice_id != invoice.id:
            raise InvoiceNotFoundError(
                "Invoice item not found"
            )

        update_data = data.model_dump(
            exclude_unset=True
        )

        for field, value in update_data.items():
            setattr(item, field, value)

        same_state = self._validate_gst_states(
            company_state_code=invoice.company_state_code,
            customer_state_code=invoice.customer_state_code,
        )

        # Recalculate the item after changes
        gross_amount = (
            item.quantity * item.unit_price
        )

        item_taxable = (
            gross_amount - item.discount
        )

        if item_taxable < Decimal("0"):
            item_taxable = Decimal("0")

        item_taxable = item_taxable.quantize(
            Decimal("0.01"),
            rounding=ROUND_HALF_UP,
        )

        gst = self._calculate_gst(
            taxable_amount=item_taxable,
            gst_rate=item.gst_rate,
            same_state=same_state,
        )

        item.taxable_amount = item_taxable

        item.cgst_rate = gst["cgst_rate"]
        item.cgst_amount = gst["cgst_amount"]

        item.sgst_rate = gst["sgst_rate"]
        item.sgst_amount = gst["sgst_amount"]

        item.igst_rate = gst["igst_rate"]
        item.igst_amount = gst["igst_amount"]

        item.total = (
            item_taxable +
            gst["total_tax"]
        )

        await self._recalculate_invoice_totals(
            invoice
        )

        async with self.uow:
            await self.repo.flush()

        return await self.repo.get_by_id(
            invoice.id
        )

    async def delete_invoice_item(
        self,
        invoice_id: int,
        item_id: int,
        company_id: int,
    ) -> Invoice:

        invoice = await self.repo.get_by_id(
            invoice_id
        )

        if not invoice or invoice.company_id != company_id:
            raise InvoiceNotFoundError()

        # Only draft invoices can be modified
        if invoice.status != 1:
            raise InvalidInvoiceStatusTransitionError(
                "Only draft invoices can be modified"
            )

        item = await self.repo.get_item_by_id(
            item_id
        )

        if not item or item.invoice_id != invoice.id:
            raise InvoiceNotFoundError(
                "Invoice item not found"
            )

        # Don't allow an invoice to have zero items
        if len(invoice.items) <= 1:
            raise InvalidInvoiceStatusTransitionError(
                "Invoice must contain at least one item"
            )

        await self.repo.delete_item(item)

        # Remove it from the relationship as well
        invoice.items.remove(item)

        await self._recalculate_invoice_totals(
            invoice
        )

        async with self.uow:
            await self.repo.flush()

        return await self.repo.get_by_id(
            invoice.id
        )

    async def update_invoice(
        self,
        invoice_id: int,
        data: InvoiceUpdate,
        company_id: int,
    ) -> Invoice:

        invoice = await self.repo.get_by_id(invoice_id)

        if not invoice or invoice.company_id != company_id:
            raise InvoiceNotFoundError()

        if invoice.status != 1:
            raise InvalidInvoiceStatusTransitionError(
                "Only draft invoices can be modified"
            )

        update_data = data.model_dump(
            exclude_unset=True
        )

        for field, value in update_data.items():
            setattr(invoice, field, value)

        async with self.uow:
            await self.repo.flush()

        return await self.repo.get_by_id(
            invoice.id
        )

    async def delete_invoice(
        self,
        invoice_id: int,
        company_id: int,
    ) -> None:

        invoice = await self.repo.get_by_id(
            invoice_id
        )

        if not invoice or invoice.company_id != company_id:
            raise InvoiceNotFoundError()

        # Only draft invoices can be deleted
        if invoice.status != 1:
            raise InvalidInvoiceStatusTransitionError(
                "Only draft invoices can be deleted"
            )

        # Don't delete invoices that have payments
        total_paid = await self.repo.get_total_paid(
            invoice_id
        )

        if Decimal(total_paid) > Decimal("0"):
            raise InvalidInvoiceStatusTransitionError(
                "Invoice with payments cannot be deleted"
            )

        async with self.uow:
            await self.repo.delete(invoice)
            await self.repo.flush()