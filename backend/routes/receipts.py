"""
Receipts API routes for storing and managing transaction receipts
"""

from flask import Blueprint, request, jsonify
from database import get_db_connection
import json
import uuid
from datetime import datetime

receipts_bp = Blueprint('receipts', __name__)

@receipts_bp.route('/receipts', methods=['POST'])
def create_receipt():
    """Create and store a new receipt"""
    data = request.get_json()
    
    required_fields = ['items', 'total', 'payment_method', 'payment_status', 'amount_paid', 'customer_name', 'customer_phone']
    if not all(key in data for key in required_fields):
        return jsonify({"error": "Missing required fields"}), 400
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Generate unique receipt ID
        receipt_id = str(uuid.uuid4())
        
        # Store receipt with customer info
        customer_name = data['customer_name']
        customer_phone = data['customer_phone']
        amount_paid = float(data['amount_paid'])
        total_amount = float(data['total'])
        change_amount = max(0, amount_paid - total_amount)

        cursor.execute(
            "INSERT INTO receipts (receipt_id, items, total_amount, payment_method, payment_status, customer_name, customer_phone, amount_paid, change_amount) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
            (receipt_id, json.dumps(data['items']), total_amount, 
             data['payment_method'], data['payment_status'], customer_name, customer_phone, amount_paid, change_amount)
        )
        
        conn.commit()
        conn.close()
        
        return jsonify({
            "message": "Receipt created successfully",
            "receipt_id": receipt_id
        }), 201
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@receipts_bp.route('/receipts', methods=['GET'])
def get_receipts():
    """Get all receipts"""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM receipts ORDER BY timestamp DESC")
    receipts = cursor.fetchall()
    conn.close()
    
    # Parse items from JSON string and map fields to frontend expectations
    receipts_list = []
    for receipt in receipts:
        receipt_dict = dict(receipt)
        receipt_dict['items'] = json.loads(receipt_dict['items'])
        receipt_dict['total'] = receipt_dict.pop('total_amount', 0)
        receipt_dict['change'] = receipt_dict.pop('change_amount', 0)
        receipt_dict['created_at'] = receipt_dict.pop('timestamp', '')
        receipts_list.append(receipt_dict)
    
    return jsonify(receipts_list)

@receipts_bp.route('/receipts/<receipt_id>', methods=['GET'])
def get_receipt(receipt_id):
    """Get a specific receipt by ID"""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM receipts WHERE receipt_id = ?", (receipt_id,))
    receipt = cursor.fetchone()
    conn.close()
    
    if receipt:
        receipt_dict = dict(receipt)
        receipt_dict['items'] = json.loads(receipt_dict['items'])
        receipt_dict['total'] = receipt_dict.pop('total_amount', 0)
        receipt_dict['change'] = receipt_dict.pop('change_amount', 0)
        receipt_dict['created_at'] = receipt_dict.pop('timestamp', '')
        return jsonify(receipt_dict)
    else:
        return jsonify({"error": "Receipt not found"}), 404

@receipts_bp.route('/receipts/<receipt_id>', methods=['DELETE'])
def delete_receipt(receipt_id):
    """Delete a receipt"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Check if receipt exists
    cursor.execute("SELECT * FROM receipts WHERE receipt_id = ?", (receipt_id,))
    receipt = cursor.fetchone()
    if not receipt:
        conn.close()
        return jsonify({"error": "Receipt not found"}), 404
    
    # Delete receipt
    cursor.execute("DELETE FROM receipts WHERE receipt_id = ?", (receipt_id,))
    conn.commit()
    conn.close()
    
    return jsonify({"message": "Receipt deleted successfully"})