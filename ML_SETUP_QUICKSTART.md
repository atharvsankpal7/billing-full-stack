# 🚀 ML Integration Quick Setup Guide

Get the ML demand forecasting feature up and running in 5 minutes!

---

## ⚡ Quick Start (5 Steps)

### Step 1: Install ML Dependencies

```bash
cd ml
pip install -r requirements.txt
```

**Required packages:**
- pandas
- numpy
- lightgbm
- scikit-learn
- fastapi
- uvicorn
- pydantic

---

### Step 2: Train the ML Model

```bash
# Still in ml directory
python test1.py
```

**What this does:**
- Loads training data from `grocery_chain_data.csv`
- Engineers features (lag values, rolling stats, calendar features)
- Trains LightGBM model
- Saves model to `demand_forecast_model.pkl`
- Shows performance metrics

**Expected output:**
```
✅ Model trained successfully
📊 Model Performance:
   MAE: X.XX
   RMSE: X.XX
   R² Score: 0.XX
💾 Model saved to: demand_forecast_model.pkl
```

---

### Step 3: Start the ML API Server

```bash
# Still in ml directory
uvicorn app:app --reload --port 8000
```

**Verify it's running:**
- Open browser: http://localhost:8000
- Should see: `{"message": "Grocery Demand Forecasting API", "status": "running", ...}`
- Interactive docs: http://localhost:8000/docs

---

### Step 4: Configure Frontend

```bash
cd ../frontend
```

Create or update `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_ML_API_URL=http://localhost:8000
```

---

### Step 5: Start Frontend

```bash
# In frontend directory
npm install  # If not already done
npm run dev
```

**Access the app:**
- Frontend: http://localhost:3000
- Navigate to Products page
- Click the 📈 icon on any product to forecast demand!

---

## ✅ Verification Checklist

Make sure all services are running:

- [ ] **Backend API** (Port 5000)
  ```bash
  cd backend
  python app.py
  ```

- [ ] **ML API** (Port 8000)
  ```bash
  cd ml
  uvicorn app:app --reload
  ```

- [ ] **Frontend** (Port 3000)
  ```bash
  cd frontend
  npm run dev
  ```

- [ ] **Test ML API**: http://localhost:8000/model/info
- [ ] **Test Frontend**: http://localhost:3000/products

---

## 🎯 Testing the Feature

### Test Case 1: Simple Prediction

1. Go to http://localhost:3000/products
2. Click forecast button (📈) on "Apples"
3. Select store: "GreenGrocer Plaza"
4. Enter data:
   - Quantity: 5
   - Unit Price: 22.13
   - Discount: 11.07
   - Day: Friday
   - Month: November
   - Weekend: Yes
5. Click "Get Prediction"
6. View results:
   - Predicted Demand: ~4.87 units
   - Recommended Stock: ~5.84 units
   - Confidence: Medium

### Test Case 2: With Historical Data

1. Click forecast on "Cheese"
2. Select store: "ValuePlus Market"
3. Basic data:
   - Quantity: 3
   - Price: 5.85
   - Discount: 2.41
4. Expand "Advanced: Historical Sales Data"
5. Add historical data:
   - 1 Day Ago: 3.2
   - 3 Days Ago: 2.8
   - 7 Days Ago: 3.5
   - Rolling Mean: 3.1
   - Rolling Std: 0.4
6. Click "Get Prediction"
7. Should see more accurate prediction

---

## 🛠️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        YOUR SYSTEM                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Frontend (Next.js)          Backend (Flask)               │
│  Port: 3000                  Port: 5000                    │
│  ├─ Products Page            ├─ Product CRUD               │
│  ├─ DemandForecastDialog     ├─ Sales API                  │
│  └─ ML API Integration       └─ Receipt Management         │
│         │                                                   │
│         │                                                   │
│         └──────────────┬──────────────────────────────────┐│
│                        │                                   ││
│                        ▼                                   ││
│              ML API (FastAPI)                              ││
│              Port: 8000                                    ││
│              ├─ /predict (Single)                          ││
│              ├─ /predict/batch (Batch)                     ││
│              ├─ /model/info (Metadata)                     ││
│              └─ LightGBM Model                             ││
│                  └─ demand_forecast_model.pkl              ││
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔧 Configuration Details

### ML API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/` | GET | Health check |
| `/model/info` | GET | Get model metadata (stores, products, features) |
| `/predict` | POST | Single product prediction |
| `/predict/batch` | POST | Multiple product predictions |

### Valid Stores (for Predictions)

- City Fresh Store
- Corner Grocery
- FreshMart Downtown
- GreenGrocer Plaza
- MegaMart Westside
- QuickStop Market
- SuperSave Central
- ValuePlus Market

### Valid Products (for Predictions)

- Apples
- Bananas
- Cereal
- Cheese
- Ground Beef
- Milk
- Onions
- Orange Juice
- Pasta
- Rice
- Salmon
- Tomatoes

---

## 🐛 Common Issues & Fixes

### Issue 1: "Model file not found"

**Error**: `❌ Model file 'demand_forecast_model.pkl' not found`

**Fix**:
```bash
cd ml
python test1.py  # Train the model first
```

---

### Issue 2: "Could not connect to ML service"

**Error**: Connection refused / Network error

**Fix**:
```bash
# Make sure ML API is running
cd ml
uvicorn app:app --reload --port 8000

# Check if port 8000 is available
# Windows:
netstat -ano | findstr :8000

# Mac/Linux:
lsof -i :8000
```

---

### Issue 3: "Invalid store_name"

**Error**: 422 Unprocessable Entity

**Fix**: Only use stores from the dropdown list. The dropdown is populated from `/model/info` and only shows valid stores.

---

### Issue 4: CORS Error

**Error**: `Access to fetch at 'http://localhost:8000' from origin 'http://localhost:3000' has been blocked by CORS policy`

**Fix**: The ML API should already have CORS configured, but if not, add to `ml/app.py`:

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

### Issue 5: Port Already in Use

**Error**: `Address already in use`

**Fix**:
```bash
# Use different port
uvicorn app:app --reload --port 8001

# Update .env.local
NEXT_PUBLIC_ML_API_URL=http://localhost:8001
```

---

## 📊 Understanding the Results

### Predicted Quantity
The expected number of units to sell tomorrow based on:
- Historical sales patterns
- Current transaction data
- Day of week / seasonality
- Store and product characteristics

### Recommended Stock
Predicted quantity + 20% safety buffer to prevent stockouts
```
Recommended = Predicted × 1.2
```

### Confidence Levels

| Level | Range | Meaning |
|-------|-------|---------|
| **High** | >10 units | Very reliable, high demand |
| **Medium-High** | 5-10 units | Reliable, moderate demand |
| **Medium** | 2-5 units | Acceptable, typical demand |
| **Medium-Low** | <2 units | Less reliable, low demand |
| **Low** | Negative | Unusual, review inputs |

### Stock Status Indicators

- 🔴 **Low**: Current stock < Recommended → Order more!
- 🟢 **OK**: Stock is optimal → No action needed
- 🟡 **High**: Stock > 150% of recommended → Possible overstock

---

## 🎓 Best Practices

### For Accurate Predictions

1. **Use Historical Data**: Lag values and rolling stats improve accuracy by 15-20%
2. **Match Product Names**: Use exact names from valid products list
3. **Current Sales Data**: Use today's actual sales figures
4. **Realistic Discounts**: Reflect actual pricing strategy
5. **Correct Calendar**: Set day/month to the date you want to predict for

### For Inventory Management

1. **Review Weekly**: Run predictions at start of week
2. **Monitor Trends**: Track predictions over time
3. **Adjust Safety Buffer**: Modify 20% buffer based on your stockout tolerance
4. **Cross-Check**: Compare predictions with actual sales to validate
5. **Seasonal Adjustments**: Be aware of holidays and special events

---

## 📁 File Structure

```
billing-model/
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   └── products/
│   │   │       └── page.tsx              ← Products page with ML integration
│   │   ├── components/
│   │   │   ├── ui/                       ← shadcn/ui components
│   │   │   └── DemandForecastDialog.tsx  ← ML prediction dialog
│   │   └── lib/
│   │       ├── api.ts                    ← API client (includes mlApi)
│   │       └── types.ts                  ← TypeScript types
│   ├── .env.local                        ← Environment config
│   └── ML_INTEGRATION.md                 ← Detailed documentation
├── ml/
│   ├── app.py                            ← FastAPI ML service
│   ├── test1.py                          ← Model training script
│   ├── demand_forecast_model.pkl         ← Trained model (generated)
│   ├── grocery_chain_data.csv            ← Training data
│   ├── requirements.txt                  ← Python dependencies
│   ├── API_README.md                     ← ML API documentation
│   └── TECHNICAL_DOCUMENTATION.md        ← ML technical details
└── ML_SETUP_QUICKSTART.md                ← This file!
```

---

## 🚀 Next Steps

Once everything is working:

1. **Explore the API**: http://localhost:8000/docs (Interactive Swagger UI)
2. **Read Detailed Docs**: `frontend/ML_INTEGRATION.md`
3. **Review ML Details**: `ml/TECHNICAL_DOCUMENTATION.md`
4. **Test Batch Predictions**: Use `/predict/batch` endpoint
5. **Integrate with POS**: Use predictions to automate reordering
6. **Track Accuracy**: Compare predictions vs actual sales

---

## 💡 Tips & Tricks

### Keyboard Shortcuts in Forecast Dialog
- **Tab**: Navigate between fields
- **Enter**: Submit prediction (when button focused)
- **Esc**: Close dialog

### Quick Testing
```bash
# Test ML API directly with curl
curl http://localhost:8000/model/info

# Test prediction
curl -X POST http://localhost:8000/predict \
  -H "Content-Type: application/json" \
  -d '{
    "store_name": "GreenGrocer Plaza",
    "product_name": "Apples",
    "quantity": 5.0,
    "unit_price": 22.13,
    "discount_amount": 11.07,
    "final_amount": 99.58,
    "day_of_week": 5,
    "month": 11,
    "is_weekend": 1
  }'
```

### Development Mode
All services run with auto-reload:
- **Frontend**: Changes trigger hot reload
- **ML API**: `--reload` flag enables auto-restart
- **Backend**: Flask debug mode (if enabled)

---

## 📞 Support

**Need help?**
1. Check [Common Issues](#-common-issues--fixes) above
2. Review logs in terminal running each service
3. Check browser console for frontend errors
4. Verify all services are running on correct ports

**Documentation:**
- ML API: `ml/API_README.md`
- Frontend Integration: `frontend/ML_INTEGRATION.md`
- Technical Details: `ml/TECHNICAL_DOCUMENTATION.md`

---

## ✨ Success!

If you see predictions in the Products page, congratulations! 🎉

You now have:
- ✅ ML model trained and ready
- ✅ FastAPI service running
- ✅ Frontend integrated with ML
- ✅ Real-time demand forecasting
- ✅ Intelligent stock recommendations

**Happy Forecasting!** 📈🛒

---

**Last Updated**: 2025
**Version**: 1.0.0