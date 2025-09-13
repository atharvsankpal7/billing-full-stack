"""
Products API routes
"""

from flask import Blueprint, request, jsonify
from database import get_db_connection

products_bp = Blueprint('products', __name__)

@products_bp.route('/products', methods=['GET'])
def get_products():
    """Get all products"""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM products ORDER BY name")
    products = cursor.fetchall()
    conn.close()
    
    return jsonify([dict(product) for product in products])

@products_bp.route('/products/<barcode>', methods=['GET'])
def get_product(barcode):
    """Get a specific product by barcode"""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM products WHERE barcode = ?", (barcode,))
    product = cursor.fetchone()
    conn.close()
    
    if product:
        return jsonify(dict(product))
    else:
        return jsonify({"error": "Product not found"}), 404

@products_bp.route('/products', methods=['POST'])
def add_product():
    """Add a new product"""
    data = request.get_json()
    
    if not all(key in data for key in ['barcode', 'name', 'price', 'stock']):
        return jsonify({"error": "Missing required fields"}), 400
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Check if product already exists
        cursor.execute("SELECT * FROM products WHERE barcode = ?", (data['barcode'],))
        if cursor.fetchone():
            conn.close()
            return jsonify({"error": "Product with this barcode already exists"}), 400
        
        # Insert new product
        cursor.execute(
            "INSERT INTO products (barcode, name, price, stock) VALUES (?, ?, ?, ?)",
            (data['barcode'], data['name'], float(data['price']), int(data['stock']))
        )
        
        conn.commit()
        conn.close()
        
        return jsonify({"message": "Product added successfully"}), 201
    
    except ValueError:
        return jsonify({"error": "Invalid price or stock value"}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@products_bp.route('/products/<barcode>', methods=['PUT'])
def update_product(barcode):
    """Update an existing product"""
    data = request.get_json()
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Check if product exists
    cursor.execute("SELECT * FROM products WHERE barcode = ?", (barcode,))
    if not cursor.fetchone():
        conn.close()
        return jsonify({"error": "Product not found"}), 404
    
    try:
        update_fields = []
        update_values = []
        
        if 'name' in data:
            update_fields.append("name = ?")
            update_values.append(data['name'])
        
        if 'price' in data:
            update_fields.append("price = ?")
            update_values.append(float(data['price']))
        
        if 'stock' in data:
            update_fields.append("stock = ?")
            update_values.append(int(data['stock']))
        
        if update_fields:
            update_values.append(barcode)
            query = f"UPDATE products SET {', '.join(update_fields)} WHERE barcode = ?"
            cursor.execute(query, update_values)
            conn.commit()
        
        conn.close()
        return jsonify({"message": "Product updated successfully"})
    
    except ValueError:
        return jsonify({"error": "Invalid price or stock value"}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@products_bp.route('/products/<barcode>', methods=['DELETE'])
def delete_product(barcode):
    """Delete a product"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Check if product exists
    cursor.execute("SELECT * FROM products WHERE barcode = ?", (barcode,))
    product = cursor.fetchone()
    if not product:
        conn.close()
        return jsonify({"error": "Product not found"}), 404
    
    # Delete product
    cursor.execute("DELETE FROM products WHERE barcode = ?", (barcode,))
    conn.commit()
    conn.close()
    
    return jsonify({"message": "Product deleted successfully"})