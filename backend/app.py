"""
Flask Application for Smart Stock Prediction System
"""

from flask import Flask
from flask_cors import CORS
from .database import init_db
from .routes import products_bp, sales_bp, receipts_bp, barcode_bp

app = Flask(__name__)
CORS(app)

# Register blueprints
app.register_blueprint(products_bp, url_prefix='/api')
app.register_blueprint(sales_bp, url_prefix='/api')
app.register_blueprint(receipts_bp, url_prefix='/api')
app.register_blueprint(barcode_bp, url_prefix='/api')

# Initialize database
init_db()

@app.route('/')
def home():
    return {"message": "Billing System API is running!"}

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)