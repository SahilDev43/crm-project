"""seed deal master data

Revision ID: bd0b0572923d
Revises: edc25faa6f52
Create Date: 2026-08-11
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "bd0b0572923d"
down_revision: Union[str, Sequence[str], None] = "edc25faa6f52"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    project_types = sa.table(
        "project_types",
        sa.column("id", sa.Integer),
        sa.column("name", sa.String),
    )

    op.bulk_insert(
        project_types,
        [
            {"id": 1, "name": "Web"},
            {"id": 2, "name": "Digital Marketing (SEO, PPC, SMM, ORM)"},
            {"id": 3, "name": "Mobile app"},
            {"id": 4, "name": "Web and Mobile app"},
            {"id": 5, "name": "Others"},
        ],
    )

    deal_platforms = sa.table(
        "deal_platforms",
        sa.column("id", sa.Integer),
        sa.column("name", sa.String),
    )

    op.bulk_insert(
        deal_platforms,
        [
            {"id": 1, "name": "Up-work"},
            {"id": 2, "name": "Direct"},
            {"id": 3, "name": "Fiverr"},
            {"id": 4, "name": "PPH"},
            {"id": 5, "name": "Old Client"},
            {"id": 6, "name": "Up-Sale"},
            {"id": 7, "name": "Facebook"},
            {"id": 8, "name": "Google PPC"},
            {"id": 9, "name": "HR"},
            {"id": 10, "name": "Inhouse"},
        ],
    )

    deal_statuses = sa.table(
        "deal_statuses",
        sa.column("id", sa.Integer),
        sa.column("name", sa.String),
        sa.column("code", sa.String),
        sa.column("is_active", sa.Boolean),
    )

    statuses = [
        (1, "In Queue", "in_queue"),
        (2, "In Proccess", "in_process"),
        (3, "Meeting", "meeting"),
        (4, "Sent FRD", "sent_frd"),
        (5, "Hot Deals", "hot_deals"),
        (6, "Won", "won"),
        (7, "Lost", "lost"),
        (8, "Dead Leads", "dead_leads"),
        (9, "Contact Established", "contact_established"),
        (10, "No Contact Established Yet", "no_contact_established_yet"),
        (11, "Follow-up 1", "follow_up_1"),
        (12, "Follow-up 2", "follow_up_2"),
        (13, "Follow-up 3", "follow_up_3"),
        (14, "Follow-up 4", "follow_up_4"),
        (15, "Follow-up 5", "follow_up_5"),
        (16, "Follow-up 6", "follow_up_6"),
        (17, "Follow-up 7", "follow_up_7"),
        (18, "Follow-up 8", "follow_up_8"),
        (19, "Follow-up 9", "follow_up_9"),
        (20, "Need FRD", "need_frd"),
        (21, "Project Discussion", "project_discussion"),
        (22, "PD Follow-up 1", "pd_follow_up_1"),
        (23, "PD Follow-up 2", "pd_follow_up_2"),
        (24, "Contract Sent", "contract_sent"),
        (25, "CS Follow-up 1", "cs_follow_up_1"),
        (26, "CS Follow-up 2", "cs_follow_up_2"),
        (27, "Completed FRD", "completed_frd"),
        (28, "Duplicate", "duplicate"),
        (29, "Call", "call"),
        (30, "Future pipeline", "future_pipeline"),
        (31, "Junk", "junk"),
        (32, "Old Client", "old_client"),
    ]

    op.bulk_insert(
        deal_statuses,
        [
            {
                "id": id_,
                "name": name,
                "code": code,
                "is_active": True,
            }
            for id_, name, code in statuses
        ],
    )


def downgrade() -> None:
    op.execute("DELETE FROM deal_statuses")
    op.execute("DELETE FROM deal_platforms")
    op.execute("DELETE FROM project_types")