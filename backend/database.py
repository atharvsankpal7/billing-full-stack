"""
Database configuration and utilities
"""

import sqlite3
from pathlib import Path

DB_PATH = Path(__file__).parent / "database.db"


def migrate_db():
    """Migrate existing database to add missing columns"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    try:
        # Check if customer_name column exists in receipts table
        cursor.execute("PRAGMA table_info(receipts)")
        columns = [column[1] for column in cursor.fetchall()]

        # Add customer_name column if it doesn't exist
        if "customer_name" not in columns:
            cursor.execute(
                "ALTER TABLE receipts ADD COLUMN customer_name TEXT DEFAULT 'Customer'"
            )
            print("Added customer_name column to receipts table")

        # Add customer_phone column if it doesn't exist
        if "customer_phone" not in columns:
            cursor.execute(
                "ALTER TABLE receipts ADD COLUMN customer_phone TEXT DEFAULT ''"
            )
            print("Added customer_phone column to receipts table")

        # Add amount_paid column if it doesn't exist
        if "amount_paid" not in columns:
            cursor.execute(
                "ALTER TABLE receipts ADD COLUMN amount_paid REAL NOT NULL DEFAULT 0"
            )
            print("Added amount_paid column to receipts table")

        # Add change_amount column if it doesn't exist
        if "change_amount" not in columns:
            cursor.execute(
                "ALTER TABLE receipts ADD COLUMN change_amount REAL DEFAULT 0"
            )
            print("Added change_amount column to receipts table")

        conn.commit()
        print("Database migration completed successfully")
    except Exception as e:
        print(f"Migration error: {e}")
        conn.rollback()
    finally:
        conn.close()


def get_db_connection():
    """Get a database connection"""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row  # This enables column access by name
    return conn


def init_db():
    """Initialize the SQLite database with required tables"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # Create products table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS products (
            barcode TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            price REAL NOT NULL,
            stock INTEGER NOT NULL
        )
    """)

    # Create sales table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS sales (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            barcode TEXT NOT NULL,
            name TEXT NOT NULL,
            price REAL NOT NULL,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (barcode) REFERENCES products (barcode)
        )
    """)

    # Create receipts table for storing complete transaction receipts
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS receipts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            receipt_id TEXT NOT NULL UNIQUE,
            items TEXT NOT NULL,
            total_amount REAL NOT NULL,
            payment_method TEXT NOT NULL,
            payment_status TEXT NOT NULL,
            customer_name TEXT DEFAULT 'Customer',
            customer_phone TEXT DEFAULT '',
            amount_paid REAL NOT NULL,
            change_amount REAL DEFAULT 0,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    """)

    # Insert initial sample data if products table is empty
    cursor.execute("SELECT COUNT(*) FROM products")
    if cursor.fetchone()[0] == 0:
        sample_products = [
            ("8901234567890", "Parle-G Biscuit 50g", 10.00, 100),
            ("8901719123456", "Amul Gold Milk 500ml", 28.00, 50),
            ("8901030721273", "Tata Salt 1kg", 25.00, 80),
            ("9000000000001", "Local Loose Sugar 1kg", 45.00, 40),
            ("9000000000002", "Local Loose Rice 1kg", 60.00, 60),
            ("8904004400018", "Aashirvaad Atta 5kg", 250.00, 30),
        ]
        cursor.executemany("INSERT INTO products VALUES (?, ?, ?, ?)", sample_products)

    conn.commit()
    conn.close()

    # Run migrations to update existing database
    migrate_db()
