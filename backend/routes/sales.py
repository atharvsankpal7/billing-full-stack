"""
Sales API routes
"""

from flask import Blueprint, request, jsonify
from database import get_db_connection

sales_bp = Blueprint('sales', __name__)

@sales_bp.route('/sales', methods=['POST'])
def record_sale():
    """Record a sale transaction"""
    data = request.get_json()
    
    if not all(key in data for key in ['barcode', 'name', 'price']):
        return jsonify({"error": "Missing required fields"}), 400
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Record the sale
        cursor.execute(
            "INSERT INTO sales (barcode, name, price) VALUES (?, ?, ?)",
            (data['barcode'], data['name'], float(data['price']))
        )
        
        # Update product stock
        cursor.execute(
            "UPDATE products SET stock = stock - 1 WHERE barcode = ? AND stock > 0",
            (data['barcode'],)
        )
        
        conn.commit()
        conn.close()
        
        return jsonify({"message": "Sale recorded successfully"}), 201
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@sales_bp.route('/sales', methods=['GET'])
def get_sales():
    """Get all sales records"""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM sales ORDER BY timestamp DESC")
    sales = cursor.fetchall()
    conn.close()
    
    return jsonify([dict(sale) for sale in sales])

@sales_bp.route('/forecast', methods=['GET'])
def run_forecast():
    """Run stock forecasting analysis"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Get sales count by product
    cursor.execute("""
        SELECT barcode, name, COUNT(*) as sales_count 
        FROM sales 
        GROUP BY barcode 
        ORDER BY sales_count DESC
    """)
    
    sales_data = cursor.fetchall()
    
    if not sales_data:
        conn.close()
        return jsonify({"message": "No sales data available for analysis"})
    
    # Get top selling product
    top_seller = dict(sales_data[0])
    
    # Get current stock for top seller
    cursor.execute("SELECT stock FROM products WHERE barcode = ?", (top_seller['barcode'],))
    stock_result = cursor.fetchone()
    current_stock = stock_result['stock'] if stock_result else 0
    
    conn.close()
    
    # Forecasting logic
    LOW_STOCK_THRESHOLD = 15
    
    forecast_result = {
        "top_seller": {
            "barcode": top_seller['barcode'],
            "name": top_seller['name'],
            "sales_count": top_seller['sales_count'],
            "current_stock": current_stock
        },
        "alert": current_stock < LOW_STOCK_THRESHOLD,
        "message": f"High demand detected for '{top_seller['name']}' with {top_seller['sales_count']} units sold. "
                   f"Current stock: {current_stock} units."
    }
    
    if forecast_result['alert']:
        forecast_result["recommendation"] = "Restock this item immediately"
    else:
        forecast_result["recommendation"] = "Stock levels appear adequate"
    
    return jsonify(forecast_result)