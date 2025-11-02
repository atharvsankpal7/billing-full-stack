"""
ML Demand Forecasting API routes
"""

from flask import Blueprint, request, jsonify
from database import get_db_connection
import requests
from datetime import datetime

ml_forecast_bp = Blueprint("ml_forecast", __name__)

ML_API_URL = "http://localhost:8000"


@ml_forecast_bp.route("/ml/predict/<barcode>", methods=["POST"])
def predict_demand(barcode):
    """Predict demand for a specific product using ML model"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        # Get product details from database
        cursor.execute("SELECT * FROM products WHERE barcode = ?", (barcode,))
        product = cursor.fetchone()

        if not product:
            conn.close()
            return jsonify({"error": "Product not found"}), 404

        # Get request data
        data = request.get_json() or {}

        # Get historical sales data for this product
        cursor.execute(
            """
            SELECT
                DATE(timestamp) as sale_date,
                COUNT(*) as quantity
            FROM sales
            WHERE barcode = ?
            GROUP BY DATE(timestamp)
            ORDER BY timestamp DESC
            LIMIT 7
        """,
            (barcode,),
        )

        historical_sales = cursor.fetchall()
        conn.close()

        # Calculate lag values and rolling statistics
        lag_1 = historical_sales[0]["quantity"] if len(historical_sales) > 0 else 0
        lag_3 = historical_sales[2]["quantity"] if len(historical_sales) > 2 else 0
        lag_7 = historical_sales[6]["quantity"] if len(historical_sales) > 6 else 0

        quantities = [sale["quantity"] for sale in historical_sales]
        rolling_mean_3 = (
            sum(quantities[:3]) / len(quantities[:3]) if len(quantities) >= 3 else 0
        )

        if len(quantities) >= 7:
            mean_7 = sum(quantities) / len(quantities)
            variance_7 = sum((x - mean_7) ** 2 for x in quantities) / len(quantities)
            rolling_std_7 = variance_7**0.5
        else:
            rolling_std_7 = 0

        # Get current date info
        now = datetime.now()
        day_of_week = now.weekday()
        month = now.month
        is_weekend = 1 if day_of_week >= 5 else 0

        # Prepare ML API request
        ml_request = {
            "store_name": data.get("store_name", "Store 1"),
            "product_name": product["name"],
            "quantity": data.get("quantity", lag_1 if lag_1 > 0 else 5),
            "unit_price": float(product["price"]),
            "discount_amount": data.get("discount_amount", 0),
            "final_amount": data.get(
                "final_amount", float(product["price"]) * (lag_1 if lag_1 > 0 else 5)
            ),
            "lag_1": lag_1,
            "lag_3": lag_3,
            "lag_7": lag_7,
            "rolling_mean_3": rolling_mean_3,
            "rolling_std_7": rolling_std_7,
            "day_of_week": day_of_week,
            "month": month,
            "is_weekend": is_weekend,
        }

        # Call ML API
        response = requests.post(f"{ML_API_URL}/predict", json=ml_request, timeout=10)

        if response.status_code == 200:
            prediction = response.json()
            return jsonify(
                {
                    "product": {
                        "barcode": product["barcode"],
                        "name": product["name"],
                        "current_stock": product["stock"],
                        "price": product["price"],
                    },
                    "prediction": prediction,
                    "historical_data": {
                        "lag_1": lag_1,
                        "lag_3": lag_3,
                        "lag_7": lag_7,
                        "rolling_mean_3": round(rolling_mean_3, 2),
                        "rolling_std_7": round(rolling_std_7, 2),
                    },
                }
            )
        else:
            return jsonify(
                {"error": "ML API error", "details": response.json()}
            ), response.status_code

    except requests.exceptions.ConnectionError:
        return jsonify(
            {
                "error": "Could not connect to ML service. Please ensure the ML API is running."
            }
        ), 503
    except requests.exceptions.Timeout:
        return jsonify({"error": "ML service request timed out"}), 504
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@ml_forecast_bp.route("/ml/predict/batch", methods=["POST"])
def predict_batch():
    """Predict demand for multiple products"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        data = request.get_json() or {}
        barcodes = data.get("barcodes", [])
        store_name = data.get("store_name", "Store 1")

        if not barcodes:
            return jsonify({"error": "No barcodes provided"}), 400

        results = []

        for barcode in barcodes:
            # Get product details
            cursor.execute("SELECT * FROM products WHERE barcode = ?", (barcode,))
            product = cursor.fetchone()

            if not product:
                results.append({"barcode": barcode, "error": "Product not found"})
                continue

            # Get historical sales
            cursor.execute(
                """
                SELECT
                    DATE(timestamp) as sale_date,
                    COUNT(*) as quantity
                FROM sales
                WHERE barcode = ?
                GROUP BY DATE(timestamp)
                ORDER BY timestamp DESC
                LIMIT 7
            """,
                (barcode,),
            )

            historical_sales = cursor.fetchall()

            # Calculate metrics
            lag_1 = historical_sales[0]["quantity"] if len(historical_sales) > 0 else 0
            lag_3 = historical_sales[2]["quantity"] if len(historical_sales) > 2 else 0
            lag_7 = historical_sales[6]["quantity"] if len(historical_sales) > 6 else 0

            quantities = [sale["quantity"] for sale in historical_sales]
            rolling_mean_3 = (
                sum(quantities[:3]) / len(quantities[:3]) if len(quantities) >= 3 else 0
            )

            if len(quantities) >= 7:
                mean_7 = sum(quantities) / len(quantities)
                variance_7 = sum((x - mean_7) ** 2 for x in quantities) / len(
                    quantities
                )
                rolling_std_7 = variance_7**0.5
            else:
                rolling_std_7 = 0

            now = datetime.now()

            results.append(
                {
                    "barcode": barcode,
                    "product_name": product["name"],
                    "current_stock": product["stock"],
                    "store_name": store_name,
                    "quantity": lag_1 if lag_1 > 0 else 5,
                    "unit_price": float(product["price"]),
                    "discount_amount": 0,
                    "final_amount": float(product["price"])
                    * (lag_1 if lag_1 > 0 else 5),
                    "lag_1": lag_1,
                    "lag_3": lag_3,
                    "lag_7": lag_7,
                    "rolling_mean_3": rolling_mean_3,
                    "rolling_std_7": rolling_std_7,
                    "day_of_week": now.weekday(),
                    "month": now.month,
                    "is_weekend": 1 if now.weekday() >= 5 else 0,
                }
            )

        conn.close()

        # Call ML API batch endpoint
        predictions_request = {"predictions": results}
        response = requests.post(
            f"{ML_API_URL}/predict/batch", json=predictions_request, timeout=30
        )

        if response.status_code == 200:
            predictions = response.json()

            # Merge predictions with product data
            final_results = []
            for i, pred in enumerate(predictions):
                final_results.append(
                    {
                        "barcode": results[i]["barcode"],
                        "product_name": results[i]["product_name"],
                        "current_stock": results[i]["current_stock"],
                        "predicted_quantity": pred["predicted_quantity"],
                        "recommended_stock": pred["recommended_stock"],
                        "confidence": pred["confidence"],
                    }
                )

            return jsonify(final_results)
        else:
            return jsonify(
                {"error": "ML API error", "details": response.json()}
            ), response.status_code

    except requests.exceptions.ConnectionError:
        return jsonify({"error": "Could not connect to ML service"}), 503
    except requests.exceptions.Timeout:
        return jsonify({"error": "ML service request timed out"}), 504
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@ml_forecast_bp.route("/ml/model/info", methods=["GET"])
def get_model_info():
    """Get ML model information"""
    try:
        response = requests.get(f"{ML_API_URL}/model/info", timeout=5)
        if response.status_code == 200:
            return jsonify(response.json())
        else:
            return jsonify(
                {"error": "Failed to fetch model info"}
            ), response.status_code
    except requests.exceptions.ConnectionError:
        return jsonify({"error": "Could not connect to ML service"}), 503
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@ml_forecast_bp.route("/ml/health", methods=["GET"])
def ml_health_check():
    """Check ML service health"""
    try:
        response = requests.get(f"{ML_API_URL}/", timeout=5)
        if response.status_code == 200:
            return jsonify(
                {"status": "ML service is running", "details": response.json()}
            )
        else:
            return jsonify(
                {"status": "ML service returned error", "code": response.status_code}
            ), 503
    except requests.exceptions.ConnectionError:
        return jsonify({"status": "ML service is not reachable"}), 503
    except Exception as e:
        return jsonify({"status": "Error checking ML service", "error": str(e)}), 500
