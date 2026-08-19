from datetime import date
from decimal import Decimal, ROUND_HALF_UP
from sqlalchemy import func, select

from app.common.exceptions import DealNotFoundError

from app.db.unit_of_work import UnitOfWork
from app.modules.invoices.model import Invoice
from app.modules.invoices.item_model import InvoiceItem
from app.modules.invoices.schema import InvoiceCreate
from app.modules.invoices.repository import InvoiceRepository
from app.modules.deals.repository import DealRepository

class InvoiceService:

    def __init__(
        self,
        repo: InvoiceRepository,
        uow: UnitOfWork,
        deal_repo: DealRepository,
    ):
        self.repo = repo
        self.uow = uow
        self.deal_repo = deal_repo

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

        same_state = True

        # ---------------------------------------------------------
        # Create invoice
        # ---------------------------------------------------------

        invoice = Invoice(
            company_id=company_id,
            deal_id=data.deal_id,
            invoice_number=invoice_number,
            invoice_date=data.invoice_date,
            due_date=data.due_date,

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

        await self.repo.db.refresh(
            invoice
        )

        return invoice