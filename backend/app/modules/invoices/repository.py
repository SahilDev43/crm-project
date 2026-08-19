from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.db.base_repository import BaseRepository
from app.modules.invoices.model import Invoice
from app.modules.invoices.item_model import InvoiceItem
from app.modules.invoices.payment_model import InvoicePayment


class InvoiceRepository(BaseRepository):

    # ---------------------------------------------------------
    # Invoice
    # ---------------------------------------------------------

    async def get_by_id(
        self,
        invoice_id: int,
    ) -> Invoice | None:

        result = await self.db.execute(
            select(Invoice)
            .options(
                selectinload(Invoice.items),
                selectinload(Invoice.payments),
            )
            .where(
                Invoice.id == invoice_id,
                Invoice.is_deleted.is_(False),
            )
        )

        return result.scalar_one_or_none()

    async def get_by_invoice_number(
        self,
        invoice_number: str,
    ) -> Invoice | None:

        result = await self.db.execute(
            select(Invoice).where(
                Invoice.invoice_number == invoice_number,
                Invoice.is_deleted.is_(False),
            )
        )

        return result.scalar_one_or_none()

    async def get_by_deal(
        self,
        deal_id: int,
    ) -> list[Invoice]:

        result = await self.db.execute(
            select(Invoice)
            .where(
                Invoice.deal_id == deal_id,
                Invoice.is_deleted.is_(False),
            )
            .order_by(
                Invoice.invoice_date.desc(),
                Invoice.id.desc(),
            )
        )

        return list(result.scalars().all())

    async def get_all(
        self,
        company_id: int,
        page: int = 1,
        page_size: int = 20,
        status: int | None = None,
        deal_id: int | None = None,
    ) -> tuple[list[Invoice], int]:

        conditions = [
            Invoice.company_id == company_id,
            Invoice.is_deleted.is_(False),
        ]

        if status is not None:
            conditions.append(
                Invoice.status == status
            )

        if deal_id is not None:
            conditions.append(
                Invoice.deal_id == deal_id
            )

        count_result = await self.db.execute(
            select(func.count(Invoice.id)).where(
                *conditions
            )
        )

        total = count_result.scalar_one()

        offset = (page - 1) * page_size

        result = await self.db.execute(
            select(Invoice)
            .options(
                selectinload(Invoice.items),
            )
            .where(
                *conditions
            )
            .order_by(
                Invoice.invoice_date.desc(),
                Invoice.id.desc(),
            )
            .offset(offset)
            .limit(page_size)
        )

        return list(result.scalars().unique().all()), total

    async def create(
        self,
        invoice: Invoice,
    ) -> Invoice:

        self.db.add(invoice)

        return invoice

    async def delete(
        self,
        invoice: Invoice,
    ) -> None:

        invoice.is_deleted = True

    # ---------------------------------------------------------
    # Invoice Items
    # ---------------------------------------------------------

    async def get_item_by_id(
        self,
        item_id: int,
    ) -> InvoiceItem | None:

        result = await self.db.execute(
            select(InvoiceItem).where(
                InvoiceItem.id == item_id
            )
        )

        return result.scalar_one_or_none()

    async def get_items(
        self,
        invoice_id: int,
    ) -> list[InvoiceItem]:

        result = await self.db.execute(
            select(InvoiceItem)
            .where(
                InvoiceItem.invoice_id == invoice_id
            )
            .order_by(
                InvoiceItem.id.asc()
            )
        )

        return list(result.scalars().all())

    async def add_item(
        self,
        item: InvoiceItem,
    ) -> InvoiceItem:

        self.db.add(item)

        return item

    async def delete_item(
        self,
        item: InvoiceItem,
    ) -> None:

        await self.db.delete(item)

    # ---------------------------------------------------------
    # Payments
    # ---------------------------------------------------------

    async def get_payment_by_id(
        self,
        payment_id: int,
    ) -> InvoicePayment | None:

        result = await self.db.execute(
            select(InvoicePayment).where(
                InvoicePayment.id == payment_id
            )
        )

        return result.scalar_one_or_none()

    async def get_payments(
        self,
        invoice_id: int,
    ) -> list[InvoicePayment]:

        result = await self.db.execute(
            select(InvoicePayment)
            .where(
                InvoicePayment.invoice_id == invoice_id
            )
            .order_by(
                InvoicePayment.payment_date.desc(),
                InvoicePayment.id.desc(),
            )
        )

        return list(result.scalars().all())

    async def add_payment(
        self,
        payment: InvoicePayment,
    ) -> InvoicePayment:

        self.db.add(payment)

        return payment

    async def get_total_paid(
        self,
        invoice_id: int,
    ):
        result = await self.db.execute(
            select(
                func.coalesce(
                    func.sum(InvoicePayment.amount),
                    0,
                )
            ).where(
                InvoicePayment.invoice_id == invoice_id
            )
        )

        return result.scalar_one()