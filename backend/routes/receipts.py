"""
Receipts API routes for storing and managing transaction receipts
"""

from flask import Blueprint, request, jsonify
from ..database import get_db_connection
import json
import uuid
from datetime import datetime

receipts_bp = Blueprint('receipts', __name__)

@receipts_bp.route('/receipts', methods=['POST'])
def create_receipt():
    """Create and store a new receipt"""
    data = request.get_json()
    
    if not all(key in data for key in ['items', 'total_amount', 'payment_method', 'payment_status']):
        return jsonify({"error": "Missing required fields"}), 400
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Generate unique receipt ID
        receipt_id = str(uuid.uuid4())
        
        # Store receipt
        cursor.execute(
            "INSERT INTO receipts (receipt_id, items, total_amount, payment_method, payment_status) VALUES (?, ?, ?, ?, ?)",
            (receipt_id, json.dumps(data['items']), float(data['total_amount']), 
             data['payment_method'], data['payment_status'])
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
    
    # Parse items from JSON string
    receipts_list = []
    for receipt in receipts:
        receipt_dict = dict(receipt)
        receipt_dict['items'] = json.loads(receipt_dict['items'])
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