"""
Barcode scanning API routes
"""

from flask import Blueprint, request, jsonify
from ..database import get_db_connection
import base64
import cv2
import numpy as np
from pyzbar.pyzbar import decode
import io
from PIL import Image

barcode_bp = Blueprint('barcode', __name__)

@barcode_bp.route('/barcode/scan', methods=['POST'])
def scan_barcode():
    """Scan barcode from image data"""
    try:
        data = request.get_json()
        
        if not data or 'image' not in data:
            return jsonify({"error": "No image data provided"}), 400
        
        # Decode base64 image
        image_data = data['image']
        if image_data.startswith('data:image'):
            # Remove data URL prefix if present
            image_data = image_data.split(',')[1]
        
        # Decode base64 to image
        image_bytes = base64.b64decode(image_data)
        image = Image.open(io.BytesIO(image_bytes))
        
        # Convert to OpenCV format
        open_cv_image = np.array(image)
        open_cv_image = open_cv_image[:, :, ::-1].copy()  # Convert RGB to BGR
        
        # Decode barcodes
        decoded_objects = decode(open_cv_image)
        
        if not decoded_objects:
            return jsonify({"error": "No barcode detected"}), 404
        
        # Get the first detected barcode
        barcode_data = decoded_objects[0].data.decode('utf-8')
        barcode_type = decoded_objects[0].type
        
        # Look up product in database
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM products WHERE barcode = ?", (barcode_data,))
        product = cursor.fetchone()
        conn.close()
        
        if product:
            product_dict = dict(product)
            return jsonify({
                "success": True,
                "barcode": barcode_data,
                "type": barcode_type,
                "product": product_dict
            })
        else:
            return jsonify({
                "success": True,
                "barcode": barcode_data,
                "type": barcode_type,
                "message": "Product not found in database",
                "product": None
            })
    
    except Exception as e:
        return jsonify({"error": f"Barcode scanning failed: {str(e)}"}), 500

@barcode_bp.route('/barcode/validate/<barcode>', methods=['GET'])
def validate_barcode(barcode):
    """Validate if a barcode exists in the database"""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM products WHERE barcode = ?", (barcode,))
    product = cursor.fetchone()
    conn.close()
    
    if product:
        return jsonify({
            "valid": True,
            "product": dict(product)
        })
    else:
        return jsonify({
            "valid": False,
            "message": "Barcode not found in database"
        })