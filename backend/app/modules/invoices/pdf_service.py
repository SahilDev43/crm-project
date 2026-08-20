from decimal import Decimal
from io import BytesIO

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import mm
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
)

from app.modules.invoices.model import Invoice


class InvoicePDFService:

    @staticmethod
    def _money(value: Decimal) -> str:
        return f"₹{Decimal(value):,.2f}"

    @staticmethod
    def generate(invoice: Invoice) -> BytesIO:

        buffer = BytesIO()

        document = SimpleDocTemplate(
            buffer,
            pagesize=A4,
            rightMargin=15 * mm,
            leftMargin=15 * mm,
            topMargin=15 * mm,
            bottomMargin=15 * mm,
        )

        styles = getSampleStyleSheet()

        title_style = ParagraphStyle(
            "InvoiceTitle",
            parent=styles["Heading1"],
            fontSize=20,
            leading=24,
            spaceAfter=5,
        )

        heading_style = ParagraphStyle(
            "SectionHeading",
            parent=styles["Heading2"],
            fontSize=11,
            leading=14,
            spaceAfter=5,
        )

        normal_style = ParagraphStyle(
            "InvoiceNormal",
            parent=styles["Normal"],
            fontSize=9,
            leading=12,
        )

        small_style = ParagraphStyle(
            "InvoiceSmall",
            parent=styles["Normal"],
            fontSize=8,
            leading=10,
        )

        story = []

        # ---------------------------------------------------------
        # Company Header
        # ---------------------------------------------------------

        story.append(
            Paragraph(
                invoice.company_name,
                title_style,
            )
        )

        company_details = []

        if invoice.company_address:
            company_details.append(
                invoice.company_address
            )

        if invoice.company_state:
            state_text = invoice.company_state

            if invoice.company_state_code:
                state_text += (
                    f" - {invoice.company_state_code}"
                )

            company_details.append(state_text)

        if invoice.company_gstin:
            company_details.append(
                f"GSTIN: {invoice.company_gstin}"
            )

        for detail in company_details:
            story.append(
                Paragraph(
                    detail,
                    normal_style,
                )
            )

        story.append(Spacer(1, 8 * mm))

        # ---------------------------------------------------------
        # Invoice Information
        # ---------------------------------------------------------

        invoice_info = [
            [
                Paragraph("<b>Invoice Number</b>", normal_style),
                invoice.invoice_number,
                Paragraph("<b>Invoice Date</b>", normal_style),
                invoice.invoice_date.strftime("%d-%m-%Y"),
            ],
            [
                Paragraph("<b>Due Date</b>", normal_style),
                (
                    invoice.due_date.strftime("%d-%m-%Y")
                    if invoice.due_date
                    else "-"
                ),
                Paragraph("<b>Status</b>", normal_style),
                str(invoice.status),
            ],
        ]

        invoice_table = Table(
            invoice_info,
            colWidths=[
                35 * mm,
                55 * mm,
                30 * mm,
                45 * mm,
            ],
        )

        invoice_table.setStyle(
            TableStyle(
                [
                    ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
                    ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                    ("LEFTPADDING", (0, 0), (-1, -1), 5),
                    ("RIGHTPADDING", (0, 0), (-1, -1), 5),
                    ("TOPPADDING", (0, 0), (-1, -1), 5),
                    ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
                ]
            )
        )

        story.append(invoice_table)
        story.append(Spacer(1, 8 * mm))

        # ---------------------------------------------------------
        # Customer
        # ---------------------------------------------------------

        story.append(
            Paragraph(
                "Bill To",
                heading_style,
            )
        )

        customer_details = [
            f"<b>{invoice.customer_name}</b>"
        ]

        if invoice.customer_company:
            customer_details.append(
                invoice.customer_company
            )

        if invoice.customer_address:
            customer_details.append(
                invoice.customer_address
            )

        if invoice.customer_state:
            state_text = invoice.customer_state

            if invoice.customer_state_code:
                state_text += (
                    f" - {invoice.customer_state_code}"
                )

            customer_details.append(state_text)

        if invoice.customer_gstin:
            customer_details.append(
                f"GSTIN: {invoice.customer_gstin}"
            )

        for detail in customer_details:
            story.append(
                Paragraph(
                    detail,
                    normal_style,
                )
            )

        story.append(Spacer(1, 8 * mm))

        # ---------------------------------------------------------
        # Items
        # ---------------------------------------------------------

        item_rows = [
            [
                Paragraph("<b>Description</b>", small_style),
                Paragraph("<b>Qty</b>", small_style),
                Paragraph("<b>Unit Price</b>", small_style),
                Paragraph("<b>Discount</b>", small_style),
                Paragraph("<b>Taxable</b>", small_style),
                Paragraph("<b>GST</b>", small_style),
                Paragraph("<b>Total</b>", small_style),
            ]
        ]

        for item in invoice.items:

            item_rows.append(
                [
                    Paragraph(
                        item.description,
                        small_style,
                    ),
                    str(item.quantity),
                    InvoicePDFService._money(
                        item.unit_price
                    ),
                    InvoicePDFService._money(
                        item.discount
                    ),
                    InvoicePDFService._money(
                        item.taxable_amount
                    ),
                    f"{item.gst_rate}%",
                    InvoicePDFService._money(
                        item.total
                    ),
                ]
            )

        items_table = Table(
            item_rows,
            colWidths=[
                45 * mm,
                15 * mm,
                25 * mm,
                22 * mm,
                25 * mm,
                18 * mm,
                25 * mm,
            ],
            repeatRows=1,
        )

        items_table.setStyle(
            TableStyle(
                [
                    ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
                    ("BACKGROUND", (0, 0), (-1, 0), colors.lightgrey),
                    ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                    ("ALIGN", (1, 1), (-1, -1), "RIGHT"),
                    ("LEFTPADDING", (0, 0), (-1, -1), 4),
                    ("RIGHTPADDING", (0, 0), (-1, -1), 4),
                    ("TOPPADDING", (0, 0), (-1, -1), 5),
                    ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
                ]
            )
        )

        story.append(items_table)
        story.append(Spacer(1, 8 * mm))

        # ---------------------------------------------------------
        # GST Summary
        # ---------------------------------------------------------

        tax_rows = [
            [
                Paragraph("<b>Tax Summary</b>", normal_style),
                "",
            ],
            [
                "Taxable Amount",
                InvoicePDFService._money(
                    invoice.taxable_amount
                ),
            ],
        ]

        if invoice.cgst_amount > 0:
            tax_rows.append(
                [
                    "CGST",
                    InvoicePDFService._money(
                        invoice.cgst_amount
                    ),
                ]
            )

        if invoice.sgst_amount > 0:
            tax_rows.append(
                [
                    "SGST",
                    InvoicePDFService._money(
                        invoice.sgst_amount
                    ),
                ]
            )

        if invoice.igst_amount > 0:
            tax_rows.append(
                [
                    "IGST",
                    InvoicePDFService._money(
                        invoice.igst_amount
                    ),
                ]
            )

        tax_rows.extend(
            [
                [
                    "Total Tax",
                    InvoicePDFService._money(
                        invoice.total_tax
                    ),
                ],
                [
                    Paragraph("<b>Grand Total</b>", normal_style),
                    Paragraph(
                        f"<b>{InvoicePDFService._money(invoice.grand_total)}</b>",
                        normal_style,
                    ),
                ],
            ]
        )

        tax_table = Table(
            tax_rows,
            colWidths=[
                55 * mm,
                45 * mm,
            ],
            hAlign="RIGHT",
        )

        tax_table.setStyle(
            TableStyle(
                [
                    ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
                    ("SPAN", (0, 0), (1, 0)),
                    ("ALIGN", (1, 1), (1, -1), "RIGHT"),
                    ("BACKGROUND", (0, 0), (-1, 0), colors.lightgrey),
                    ("LEFTPADDING", (0, 0), (-1, -1), 5),
                    ("RIGHTPADDING", (0, 0), (-1, -1), 5),
                    ("TOPPADDING", (0, 0), (-1, -1), 5),
                    ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
                ]
            )
        )

        story.append(tax_table)
        story.append(Spacer(1, 8 * mm))

        # ---------------------------------------------------------
        # Payment Summary
        # ---------------------------------------------------------

        total_paid = sum(
            (
                payment.amount
                for payment in invoice.payments
            ),
            Decimal("0"),
        )

        remaining = (
            invoice.grand_total - total_paid
        )

        if remaining < 0:
            remaining = Decimal("0")

        payment_rows = [
            [
                "Total Paid",
                InvoicePDFService._money(
                    total_paid
                ),
            ],
            [
                "Balance Due",
                InvoicePDFService._money(
                    remaining
                ),
            ],
        ]

        payment_table = Table(
            payment_rows,
            colWidths=[
                55 * mm,
                45 * mm,
            ],
            hAlign="RIGHT",
        )

        payment_table.setStyle(
            TableStyle(
                [
                    ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
                    ("ALIGN", (1, 0), (1, -1), "RIGHT"),
                    ("LEFTPADDING", (0, 0), (-1, -1), 5),
                    ("RIGHTPADDING", (0, 0), (-1, -1), 5),
                    ("TOPPADDING", (0, 0), (-1, -1), 5),
                    ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
                ]
            )
        )

        story.append(payment_table)

        # ---------------------------------------------------------
        # Notes
        # ---------------------------------------------------------

        if invoice.notes:
            story.append(Spacer(1, 8 * mm))
            story.append(
                Paragraph(
                    f"<b>Notes:</b> {invoice.notes}",
                    normal_style,
                )
            )

        document.build(story)

        buffer.seek(0)

        return buffer