"""
Routes package for API endpoints
"""

from products import products_bp
from sales import sales_bp
from receipts import receipts_bp
from barcode import barcode_bp

__all__ = ['products_bp', 'sales_bp', 'receipts_bp', 'barcode_bp']