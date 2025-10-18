"""
Standalone migration script to update database schema
Run this script to add missing columns to existing database tables
"""

import sqlite3
from pathlib import Path

DB_PATH = Path(__file__).parent / "database.db"


def migrate_database():
    """Migrate existing database to add missing columns"""

    if not DB_PATH.exists():
        print(f"Database not found at {DB_PATH}")
        print(
            "No migration needed - database will be created with correct schema on first run"
        )
        return

    print(f"Migrating database at {DB_PATH}")
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    try:
        # Check if receipts table exists
        cursor.execute(
            "SELECT name FROM sqlite_master WHERE type='table' AND name='receipts'"
        )
        if not cursor.fetchone():
            print("Receipts table does not exist. No migration needed.")
            conn.close()
            return

        # Check current columns in receipts table
        cursor.execute("PRAGMA table_info(receipts)")
        columns = [column[1] for column in cursor.fetchall()]

        print(f"Current columns in receipts table: {columns}")

        migrations_applied = False

        # Add customer_name column if it doesn't exist
        if "customer_name" not in columns:
            print("Adding customer_name column...")
            cursor.execute(
                "ALTER TABLE receipts ADD COLUMN customer_name TEXT DEFAULT 'Customer'"
            )
            migrations_applied = True
            print("✓ Added customer_name column")

        # Add customer_phone column if it doesn't exist
        if "customer_phone" not in columns:
            print("Adding customer_phone column...")
            cursor.execute(
                "ALTER TABLE receipts ADD COLUMN customer_phone TEXT DEFAULT ''"
            )
            migrations_applied = True
            print("✓ Added customer_phone column")

        # Add amount_paid column if it doesn't exist
        if "amount_paid" not in columns:
            print("Adding amount_paid column...")
            cursor.execute("ALTER TABLE receipts ADD COLUMN amount_paid REAL")
            # Update existing records to set amount_paid = total_amount
            cursor.execute(
                "UPDATE receipts SET amount_paid = total_amount WHERE amount_paid IS NULL"
            )
            migrations_applied = True
            print("✓ Added amount_paid column")

        # Add change_amount column if it doesn't exist
        if "change_amount" not in columns:
            print("Adding change_amount column...")
            cursor.execute(
                "ALTER TABLE receipts ADD COLUMN change_amount REAL DEFAULT 0"
            )
            migrations_applied = True
            print("✓ Added change_amount column")

        if migrations_applied:
            conn.commit()
            print("\n✅ Database migration completed successfully!")

            # Show updated schema
            cursor.execute("PRAGMA table_info(receipts)")
            updated_columns = [column[1] for column in cursor.fetchall()]
            print(f"\nUpdated columns in receipts table: {updated_columns}")
        else:
            print("\n✅ Database schema is already up to date. No migration needed.")

    except Exception as e:
        print(f"\n❌ Migration error: {e}")
        conn.rollback()
        raise
    finally:
        conn.close()


if __name__ == "__main__":
    print("=" * 60)
    print("Database Migration Script")
    print("=" * 60)
    migrate_database()
    print("=" * 60)
