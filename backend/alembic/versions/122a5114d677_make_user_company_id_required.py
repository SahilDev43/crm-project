"""make user company id required

Revision ID: 122a5114d677
Revises: 78feaca46ab2
Create Date: 2026-08-07 11:22:40.969495

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '122a5114d677'
down_revision: Union[str, Sequence[str], None] = '78feaca46ab2'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.alter_column(
        "users",
        "company_id",
        existing_type=sa.INTEGER(),
        nullable=False,
    )


def downgrade() -> None:
    op.alter_column(
        "users",
        "company_id",
        existing_type=sa.INTEGER(),
        nullable=True,
    )
