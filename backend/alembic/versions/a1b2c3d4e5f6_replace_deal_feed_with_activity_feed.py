"""replace deal feed with generic activity feed

Revision ID: a1b2c3d4e5f6
Revises: f1a2b3c4d5e6
Create Date: 2026-08-27
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "a1b2c3d4e5f6"
down_revision: Union[str, Sequence[str], None] = "f1a2b3c4d5e6"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "activity_feed",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("subject_type", sa.String(length=50), nullable=False),
        sa.Column("subject_id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=True),
        sa.Column("event_type", sa.String(length=50), nullable=False),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column("metadata_json", sa.JSON(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_activity_feed_subject", "activity_feed", ["subject_type", "subject_id"])
    op.create_index("ix_activity_feed_user_id", "activity_feed", ["user_id"])
    op.execute("""
        INSERT INTO activity_feed (id, subject_type, subject_id, user_id, event_type, content, metadata_json, created_at, updated_at)
        SELECT id, 'deal', deal_id, user_id, event_type, content, metadata_json, created_at, updated_at
        FROM deal_feed
    """)
    op.drop_index("ix_deal_feed_user_id", table_name="deal_feed")
    op.drop_index("ix_deal_feed_deal_id", table_name="deal_feed")
    op.drop_table("deal_feed")


def downgrade() -> None:
    op.create_table(
        "deal_feed",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("deal_id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=True),
        sa.Column("event_type", sa.String(length=50), nullable=False),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column("metadata_json", sa.JSON(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["deal_id"], ["deals.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_deal_feed_deal_id", "deal_feed", ["deal_id"])
    op.create_index("ix_deal_feed_user_id", "deal_feed", ["user_id"])
    op.execute("""
        INSERT INTO deal_feed (id, deal_id, user_id, event_type, content, metadata_json, created_at, updated_at)
        SELECT id, subject_id, user_id, event_type, content, metadata_json, created_at, updated_at
        FROM activity_feed WHERE subject_type = 'deal'
    """)
    op.drop_index("ix_activity_feed_user_id", table_name="activity_feed")
    op.drop_index("ix_activity_feed_subject", table_name="activity_feed")
    op.drop_table("activity_feed")
