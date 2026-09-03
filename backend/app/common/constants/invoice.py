class InvoiceStatus:
    """Mirrors the status ints applied in app.modules.invoices.service."""

    DRAFT = 1
    ISSUED = 2
    PARTIALLY_PAID = 3
    PAID = 4
    CANCELLED = 6

    LABELS = {
        DRAFT: "Draft",
        ISSUED: "Issued",
        PARTIALLY_PAID: "Partially Paid",
        PAID: "Paid",
        CANCELLED: "Cancelled",
    }
