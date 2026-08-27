"""create deal feed

Revision ID: f1a2b3c4d5e6
Revises: 5de4322f2d37
Create Date: 2026-08-27
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "f1a2b3c4d5e6"
down_revision: Union[str, Sequence[str], None] = "5de4322f2d37"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "deal_feed",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("deal_id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=True),
        sa.Column("event_type", sa.String(length=50), nullable=False),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column("metadata_json", sa.JSON(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["deal_id"], ["deals.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_deal_feed_deal_id", "deal_feed", ["deal_id"])
    op.create_index("ix_deal_feed_user_id", "deal_feed", ["user_id"])


def downgrade() -> None:
    op.drop_index("ix_deal_feed_user_id", table_name="deal_feed")
    op.drop_index("ix_deal_feed_deal_id", table_name="deal_feed")
    op.drop_table("deal_feed")
