"""user owned listings

Revision ID: 0002_user_owned_listings
Revises: 0001_initial_schema
Create Date: 2026-06-09 00:00:00.000000

"""
from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa


revision: str = "0002_user_owned_listings"
down_revision: str | None = "0001_initial_schema"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    with op.batch_alter_table("listings") as batch_op:
        batch_op.add_column(sa.Column("owner_id", sa.Integer(), nullable=False))
        batch_op.create_index("ix_listings_owner_id", ["owner_id"], unique=False)
        batch_op.create_foreign_key(
            "fk_listings_owner_id_users",
            "users",
            ["owner_id"],
            ["id"],
            ondelete="CASCADE",
        )


def downgrade() -> None:
    with op.batch_alter_table("listings") as batch_op:
        batch_op.drop_constraint("fk_listings_owner_id_users", type_="foreignkey")
        batch_op.drop_index("ix_listings_owner_id")
        batch_op.drop_column("owner_id")
