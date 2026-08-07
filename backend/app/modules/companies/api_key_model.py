from sqlalchemy import Boolean, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base
from app.db.mixins import TimestampMixin

class CompanyApiKey(Base, TimestampMixin):
    __tablename__ = "company_api_keys"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True
    )

    company_id: Mapped[int] = mapped_column(
        ForeignKey(
            "companies.id",
            ondelete="CASCADE"
        ),
        nullable=False,
        index=True
    )

    #Example: Production Website / Staging Website
    name: Mapped[str] = mapped_column(
        String(100),
        nullable=False
    )

    #public identifier used to locate the key quickly
    key_prefix: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        unique=True,
        index=True
    )

    #Never store the complete API Key
    key_hash: Mapped[str] = mapped_column(
        String(255),
        nullable=False
    )

    is_active: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False
    )

    company: Mapped["Company"] = relationship(
        "Company",
        back_populates="api_keys"
    )
