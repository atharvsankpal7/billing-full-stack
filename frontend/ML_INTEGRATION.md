# 🤖 ML Demand Forecasting - Frontend Integration Guide

This document provides a comprehensive guide on how the Machine Learning demand forecasting system is integrated into the frontend application.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Setup & Configuration](#setup--configuration)
- [Components](#components)
- [API Integration](#api-integration)
- [Usage Guide](#usage-guide)
- [Features](#features)
- [Troubleshooting](#troubleshooting)

---

## 🎯 Overview

The ML integration allows users to predict next-day product demand using a trained LightGBM machine learning model. This helps optimize inventory management by providing:

- **Demand Predictions**: Forecast how many units will be sold tomorrow
- **Stock Recommendations**: Optimal stock levels with 20% safety buffer
- **Confidence Levels**: Prediction reliability indicators
- **Stock Status Alerts**: Visual indicators for under/over-stocked items

---

## 🏗️ Architecture

### System Components

```
┌─────────────────┐         ┌──────────────────┐         ┌─────────────────┐
│   Frontend UI   │ ◄────► │   ML API Layer   │ ◄────► │  ML Model API   │
│  (Next.js/React)│         │  (api.ts)        │         │  (FastAPI)      │
└─────────────────┘         └──────────────────┘         └─────────────────┘
       │                            │                            │
       │                            │                            │
   Products Page              HTTP Requests              LightGBM Model
   DemandForecastDialog       JSON Responses             (demand_forecast_model.pkl)
```

### Data Flow

1. **User Action**: Clicks "Forecast" button on product
2. **Dialog Opens**: `DemandForecastDialog` component loads
3. **Model Info**: Fetches valid stores/products from ML API
4. **User Input**: Enters transaction and historical data
5. **Prediction Request**: Sends data to ML API `/predict` endpoint
6. **Model Processing**: LightGBM model processes features
7. **Response**: Returns predicted demand and recommendations
8. **UI Update**: Displays results and updates product table

---

## ⚙️ Setup & Configuration

### Prerequisites

1. **ML API Running**: The FastAPI ML service must be running
2. **Environment Variables**: Configure API endpoints
3. **Dependencies**: All required npm packages installed

### Environment Configuration

Create or update `.env.local` in the frontend directory:

```env
# Backend API (default: http://localhost:5000/api)
NEXT_PUBLIC_API_URL=http://localhost:5000/api

# ML API (default: http://localhost:8000)
NEXT_PUBLIC_ML_API_URL=http://localhost:8000
```

### Starting the ML API

Before using the forecasting feature:

```bash
# Navigate to ML directory
cd ../ml

# Install dependencies (if not already done)
pip install -r requirements.txt

# Train the model (if not already trained)
python test1.py

# Start the ML API server
uvicorn app:app --reload --port 8000
```

Verify ML API is running: http://localhost:8000/docs

---

## 🧩 Components

### 1. DemandForecastDialog Component

**Location**: `src/components/DemandForecastDialog.tsx`

**Purpose**: Modal dialog for inputting data and displaying ML predictions

**Key Features**:
- Store selection dropdown (populated from ML API)
- Transaction data inputs (quantity, price, discount)
- Optional historical data inputs (lag values, rolling statistics)
- Calendar features (day of week, month, weekend flag)
- Real-time final amount calculation
- Prediction results display with visual indicators
- Stock status comparison

**Props**:
```typescript
interface DemandForecastDialogProps {
  open: boolean;                                      // Dialog visibility
  onOpenChange: (open: boolean) => void;              // Close handler
  product: Product;                                   // Product to forecast
  onPredictionComplete?: (prediction: DemandPredictionOutput) => void;  // Callback
}
```

**Usage Example**:
```tsx
<DemandForecastDialog
  open={isForecastDialogOpen}
  onOpenChange={setIsForecastDialogOpen}
  product={selectedProduct}
  onPredictionComplete={(prediction) => {
    console.log('Predicted demand:', prediction.predicted_quantity);
  }}
/>
```

### 2. Products Page Enhancement

**Location**: `src/app/products/page.tsx`

**Enhancements**:
- Added "ML Forecast" column to products table
- Forecast button (TrendingUp icon) for each product
- Display of prediction results inline
- Stock status badges based on ML recommendations
- Integration with DemandForecastDialog

**New UI Elements**:
- **Info Alert**: Explains ML forecasting availability
- **Forecast Column**: Shows predicted demand, recommended stock, and confidence
- **Status Badges**: Visual indicators for stock levels (Low/OK/High)
- **Forecast Button**: Opens prediction dialog

---

## 🔌 API Integration

### API Configuration

**File**: `src/lib/api.ts`

Added ML-specific API client:

```typescript
export const mlApi = {
  // Get model information (valid stores, products, features)
  getModelInfo: () => mlApiRequest("/model/info"),

  // Single prediction
  predict: (input: DemandPredictionInput) =>
    mlApiRequest("/predict", { method: "POST", body: JSON.stringify(input) }),

  // Batch prediction (multiple products at once)
  predictBatch: (predictions: DemandPredictionInput[]) =>
    mlApiRequest("/predict/batch", {
      method: "POST",
      body: JSON.stringify({ predictions }),
    }),

  // Health check
  healthCheck: () => mlApiRequest("/"),
};
```

### Type Definitions

**File**: `src/lib/types.ts`

```typescript
// Input to ML model
interface DemandPredictionInput {
  store_name: string;           // Store name (must match ML model)
  product_name: string;         // Product name
  quantity: number;             // Current day sales
  unit_price: number;           // Price per unit
  discount_amount: number;      // Discount applied
  final_amount: number;         // Total after discount
  lag_1?: number;              // Sales 1 day ago (optional)
  lag_3?: number;              // Sales 3 days ago (optional)
  lag_7?: number;              // Sales 7 days ago (optional)
  rolling_mean_3?: number;     // 3-day average (optional)
  rolling_std_7?: number;      // 7-day std dev (optional)
  day_of_week: number;         // 0=Monday, 6=Sunday
  month: number;               // 1-12
  is_weekend: number;          // 0 or 1
}

// Output from ML model
interface DemandPredictionOutput {
  store_name: string;
  product_name: string;
  predicted_quantity: number;    // Forecasted demand
  recommended_stock: number;     // Predicted + 20% buffer
  confidence: string;            // Low/Medium/High
}

// Model metadata
interface MLModelInfo {
  model_type: string;           // "LGBMRegressor"
  features: string[];           // List of all features
  valid_stores: string[];       // Available store names
  valid_products: string[];     // Available product names
  total_features: number;       // Feature count
}
```

---

## 📖 Usage Guide

### For End Users

#### Step 1: Open Forecast Dialog
1. Navigate to Products page
2. Find the product you want to forecast
3. Click the **TrendingUp** (📈) icon button

#### Step 2: Configure Prediction
1. **Select Store**: Choose from dropdown (required)
2. **Review Product**: Product name auto-filled
3. **Enter Sales Data**:
   - Current Quantity Sold (default: 5)
   - Unit Price (auto-filled from product)
   - Discount Amount (if any)
   - Final Amount (auto-calculated)

#### Step 3: Set Calendar Features
1. **Day of Week**: Select target day (defaults to today)
2. **Month**: Select target month (defaults to current)
3. **Is Weekend**: Select yes/no (auto-set based on day)

#### Step 4: (Optional) Add Historical Data
Expand "Advanced: Historical Sales Data" section:
- **1 Day Ago Sales**: Quantity sold yesterday
- **3 Days Ago Sales**: Quantity sold 3 days ago
- **7 Days Ago Sales**: Quantity sold 7 days ago
- **3-Day Rolling Mean**: Average of last 3 days
- **7-Day Rolling Std Dev**: Standard deviation of last 7 days

*Note: Historical data improves accuracy but is optional*

#### Step 5: Get Prediction
1. Click **"Get Prediction"** button
2. View results:
   - **Predicted Demand**: Expected units to sell tomorrow
   - **Recommended Stock**: Optimal inventory level
   - **Confidence Level**: Prediction reliability
   - **Stock Status**: Current vs recommended comparison

#### Step 6: Take Action
Based on results:
- 🔴 **Stock Low**: Order more inventory
- 🟢 **Stock OK**: Current level is optimal
- 🟡 **Stock High**: Consider reducing orders

### For Developers

#### Adding ML to Other Pages

```tsx
import { mlApi } from '@/lib/api';
import { DemandForecastDialog } from '@/components/DemandForecastDialog';

// In your component
const [forecastProduct, setForecastProduct] = useState<Product | null>(null);
const [showForecast, setShowForecast] = useState(false);

// Trigger forecast
<Button onClick={() => {
  setForecastProduct(product);
  setShowForecast(true);
}}>
  Forecast
</Button>

// Dialog
<DemandForecastDialog
  open={showForecast}
  onOpenChange={setShowForecast}
  product={forecastProduct}
  onPredictionComplete={(prediction) => {
    // Handle prediction result
    console.log(prediction);
  }}
/>
```

#### Direct API Calls

```typescript
// Get model info
const modelInfo = await mlApi.getModelInfo();
console.log('Valid stores:', modelInfo.valid_stores);

// Single prediction
const prediction = await mlApi.predict({
  store_name: "GreenGrocer Plaza",
  product_name: "Apples",
  quantity: 5.0,
  unit_price: 22.13,
  discount_amount: 11.07,
  final_amount: 99.58,
  day_of_week: 5,
  month: 11,
  is_weekend: 1,
});

console.log('Predicted demand:', prediction.predicted_quantity);
console.log('Recommended stock:', prediction.recommended_stock);

// Batch prediction
const batchResults = await mlApi.predictBatch([
  { /* product 1 data */ },
  { /* product 2 data */ },
]);
```

---

## ✨ Features

### Visual Indicators

#### Stock Status Badges
- 🔴 **Low**: Current stock below recommended
- 🟢 **OK**: Stock within optimal range
- 🟡 **High**: Stock significantly above recommended (potential overstock)

#### Confidence Badges
- **High**: Very reliable prediction (>10 units)
- **Medium-High**: Reliable (5-10 units)
- **Medium**: Moderate confidence (2-5 units)
- **Medium-Low**: Lower confidence (<2 units)
- **Low**: Unreliable (negative prediction)

### Smart Features

#### Auto-Calculation
- Final amount automatically calculated from quantity and discount
- Calendar features default to current date
- Product price auto-filled from inventory

#### Historical Data (Optional)
- Improves prediction accuracy when available
- Defaults to 0 if not provided
- Useful for products with established sales history

#### Real-Time Updates
- Predictions persist in product table
- Color-coded stock indicators
- Instant feedback on stock status

---

## 🔍 Troubleshooting

### Common Issues

#### 1. "Could not connect to ML service"

**Cause**: ML API is not running or wrong URL

**Solution**:
```bash
# Check ML API status
curl http://localhost:8000/

# Start ML API if not running
cd ../ml
uvicorn app:app --reload --port 8000

# Verify .env.local has correct URL
NEXT_PUBLIC_ML_API_URL=http://localhost:8000
```

#### 2. "Model file not found"

**Cause**: ML model not trained yet

**Solution**:
```bash
cd ../ml
python test1.py  # Train the model
# This creates demand_forecast_model.pkl
```

#### 3. "Invalid store_name"

**Cause**: Store name doesn't match ML model's trained stores

**Solution**:
- Only use stores from the dropdown (populated from `/model/info`)
- Valid stores:
  - City Fresh Store
  - Corner Grocery
  - FreshMart Downtown
  - GreenGrocer Plaza
  - MegaMart Westside
  - QuickStop Market
  - SuperSave Central
  - ValuePlus Market

#### 4. "Invalid product_name"

**Cause**: Product name doesn't match ML model's trained products

**Solution**:
- Use standard product names matching the ML training data
- Valid products:
  - Apples, Bananas, Cereal, Cheese, Ground Beef, Milk
  - Onions, Orange Juice, Pasta, Rice, Salmon, Tomatoes

#### 5. Predictions seem inaccurate

**Possible causes**:
- Missing historical data (lag values, rolling stats)
- Product not in ML training set
- Unusual transaction patterns

**Solution**:
- Provide historical sales data for better accuracy
- Ensure product name matches training data exactly
- Use predictions as guidelines, not absolute values

#### 6. CORS errors in browser console

**Cause**: ML API not allowing frontend origin

**Solution**: Update ML API CORS settings in `app.py`:
```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Add your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## 📊 ML Model Details

### Algorithm
- **Type**: LightGBM Regressor
- **Task**: Regression (predicting continuous quantity values)
- **Training Data**: 1,982 historical transactions

### Features (14 total)
1. **Categorical**: store_name, product_name
2. **Transaction**: quantity, unit_price, discount_amount, final_amount
3. **Historical**: lag_1, lag_3, lag_7, rolling_mean_3, rolling_std_7
4. **Calendar**: day_of_week, month, is_weekend

### Performance
- Evaluated on time-based split
- Metrics: MAE, MSE, RMSE, R² Score
- See `ml/TECHNICAL_DOCUMENTATION.md` for detailed performance

### Safety Buffer
- All recommendations include 20% safety margin
- `recommended_stock = predicted_quantity × 1.2`
- Reduces risk of stockouts

---

## 🚀 Future Enhancements

### Planned Features
- [ ] Batch forecasting for all products at once
- [ ] Historical trend visualization
- [ ] Export predictions to CSV
- [ ] Weekly/monthly demand forecasts
- [ ] Automated reorder suggestions
- [ ] Integration with POS system for auto-update
- [ ] Custom safety buffer configuration
- [ ] Multi-store comparison view

### API Improvements
- [ ] Caching for model info
- [ ] Prediction history tracking
- [ ] Confidence interval ranges
- [ ] Feature importance display
- [ ] Model retraining notifications

---

## 📚 Additional Resources

- **ML API Documentation**: `../ml/API_README.md`
- **Technical Details**: `../ml/TECHNICAL_DOCUMENTATION.md`
- **Quick Start Guide**: `../ml/QUICKSTART.md`
- **Backend API**: `../backend/README.md`
- **FastAPI Interactive Docs**: http://localhost:8000/docs

---

## 🤝 Support

For issues or questions:
1. Check troubleshooting section above
2. Review ML API logs: Check terminal running `uvicorn`
3. Check browser console for errors
4. Verify all services are running (frontend, backend, ML API)

---

## 📝 License

This ML integration is part of the Billing Model project and follows the same license terms.

---

**Last Updated**: 2025
**Version**: 1.0.0