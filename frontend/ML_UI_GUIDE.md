# 🎨 ML Demand Forecasting - UI Guide

Visual guide to the ML integration user interface and user experience.

---

## 📸 UI Overview

### 1. Products Page - Main View

```
┌─────────────────────────────────────────────────────────────────────────┐
│  Product Management                                    [+ Add Product]   │
│  Manage inventory with AI-powered demand forecasting                    │
├─────────────────────────────────────────────────────────────────────────┤
│  ℹ️ ML Demand Forecasting Available: Click the forecast button on any   │
│     product to predict next-day demand and get stock recommendations.   │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  Products Stock                                                          │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │ Barcode  │ Name    │ Price  │ Current Stock │ ML Forecast │ Actions││
│  ├────────────────────────────────────────────────────────────────────┤ │
│  │ 12345    │ Apples  │ ₹22.13 │ [15] 🟢 OK    │ Demand: 4.9 │ 📈✏️🗑️ ││
│  │          │         │        │               │ Rec: 5.8    │        ││
│  │          │         │        │               │ [Medium]    │        ││
│  ├────────────────────────────────────────────────────────────────────┤ │
│  │ 12346    │ Cheese  │ ₹45.00 │ [8] 🔴 Low    │ Not forecast│ 📈✏️🗑️ ││
│  ├────────────────────────────────────────────────────────────────────┤ │
│  │ 12347    │ Milk    │ ₹55.00 │ [50] 🟡 High  │ Demand: 12.3│ 📈✏️🗑️ ││
│  │          │         │        │               │ Rec: 14.7   │        ││
│  │          │         │        │               │ [High]      │        ││
│  └────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
```

**Key Elements:**
- **📈 Icon**: Demand forecast button (blue, clickable)
- **Stock Indicators**: Color-coded badges (🟢 OK, 🔴 Low, 🟡 High)
- **ML Forecast Column**: Shows predictions or "Not forecasted"
- **Confidence Badges**: Color-coded by reliability

---

### 2. Demand Forecast Dialog - Initial State

```
┌──────────────────────────────────────────────────────────────────┐
│  📈 Demand Forecast for Apples                              [✕]  │
│  Predict next-day demand using ML model to optimize inventory   │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Store Name *                    Product Name                   │
│  [GreenGrocer Plaza ▼]           [Apples              ]         │
│                                  (disabled, auto-filled)         │
│                                                                  │
│  Current Quantity Sold    Unit Price (₹)      Discount (₹)     │
│  [5                ]      [22.13        ]     [0.00      ]     │
│                                                                  │
│  Final Amount (₹)                                               │
│  [110.65                                    ]                   │
│  (auto-calculated, disabled)                                    │
│                                                                  │
│  ▶ Advanced: Historical Sales Data (Optional)                   │
│                                                                  │
│  Day of Week              Month              Is Weekend?        │
│  [Friday      ▼]          [November   ▼]     [Yes       ▼]     │
│                                                                  │
├──────────────────────────────────────────────────────────────────┤
│                                        [Close] [Get Prediction]  │
└──────────────────────────────────────────────────────────────────┘
```

**Features:**
- **Store Dropdown**: Populated from ML API (only valid stores)
- **Auto-calculated Fields**: Final amount updates automatically
- **Collapsible Section**: Historical data is optional
- **Date Defaults**: Current date pre-selected

---

### 3. Demand Forecast Dialog - Advanced Section Expanded

```
┌──────────────────────────────────────────────────────────────────┐
│  📈 Demand Forecast for Apples                              [✕]  │
├──────────────────────────────────────────────────────────────────┤
│  ... (basic fields above) ...                                   │
│                                                                  │
│  ▼ Advanced: Historical Sales Data (Optional)                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                                                            │ │
│  │  1 Day Ago Sales    3 Days Ago Sales    7 Days Ago Sales  │ │
│  │  [4.0          ]    [3.5           ]    [4.2          ]   │ │
│  │                                                            │ │
│  │  3-Day Rolling Mean              7-Day Rolling Std Dev    │ │
│  │  [3.9                      ]     [0.8                 ]   │ │
│  │                                                            │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  Day of Week              Month              Is Weekend?        │
│  [Friday      ▼]          [November   ▼]     [Yes       ▼]     │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

**Historical Data Fields:**
- **Lag Values**: Sales from 1, 3, and 7 days ago
- **Rolling Statistics**: Mean and standard deviation
- **Optional**: Can be left at 0 for basic predictions

---

### 4. Demand Forecast Dialog - Results Display

```
┌──────────────────────────────────────────────────────────────────┐
│  📈 Demand Forecast for Apples                              [✕]  │
├──────────────────────────────────────────────────────────────────┤
│  ... (input fields above) ...                                   │
│                                                                  │
│  ╔════════════════════════════════════════════════════════════╗ │
│  ║  📈 Prediction Results                                     ║ │
│  ╠════════════════════════════════════════════════════════════╣ │
│  ║                                                            ║ │
│  ║  ┌──────────────────────┐  ┌──────────────────────┐      ║ │
│  ║  │ Predicted Demand     │  │ Recommended Stock    │      ║ │
│  ║  │                      │  │                      │      ║ │
│  ║  │      4.87 units      │  │      5.84 units      │      ║ │
│  ║  └──────────────────────┘  └──────────────────────┘      ║ │
│  ║                                +20% safety buffer         ║ │
│  ║                                                            ║ │
│  ║  ┌──────────────────────────────────────────────────────┐ ║ │
│  ║  │ Confidence Level                      [Medium]       │ ║ │
│  ║  └──────────────────────────────────────────────────────┘ ║ │
│  ║                                                            ║ │
│  ║  ┌──────────────────────────────────────────────────────┐ ║ │
│  ║  │ Current Stock                        15 units        │ ║ │
│  ║  │                                                      │ ║ │
│  ║  │ ✅ Stock level is optimal                           │ ║ │
│  ║  └──────────────────────────────────────────────────────┘ ║ │
│  ╚════════════════════════════════════════════════════════════╝ │
│                                                                  │
│                                        [Close] [Get Prediction]  │
└──────────────────────────────────────────────────────────────────┘
```

**Results Card (Blue gradient background):**
- **Predicted Demand**: Tomorrow's expected sales
- **Recommended Stock**: With safety buffer
- **Confidence Badge**: Color-coded reliability
- **Stock Status**: Comparison with current inventory

---

### 5. Stock Status Indicators

#### 🔴 Low Stock (Alert)
```
┌───────────────────────────────────────────────────────────┐
│ Current Stock                               8 units       │
│                                                            │
│ ⚠️  Stock is 6.8 units below recommended                  │
│                                                            │
└───────────────────────────────────────────────────────────┘
```
**Meaning**: Reorder immediately to avoid stockout

#### 🟢 Optimal Stock
```
┌───────────────────────────────────────────────────────────┐
│ Current Stock                               15 units      │
│                                                            │
│ ✅  Stock level is optimal                                │
│                                                            │
└───────────────────────────────────────────────────────────┘
```
**Meaning**: Current inventory is within recommended range

#### 🟡 High Stock (Overstock Warning)
```
┌───────────────────────────────────────────────────────────┐
│ Current Stock                               50 units      │
│                                                            │
│ 📦  Stock is 240% above recommended (possible overstock)  │
│                                                            │
└───────────────────────────────────────────────────────────┘
```
**Meaning**: Consider reducing next order, risk of waste

---

## 🎨 Color Scheme & Visual Design

### Color Palette

**Stock Status:**
- 🟢 **Green** (`bg-green-100 text-green-800`): Healthy stock
- 🟡 **Yellow** (`bg-yellow-100 text-yellow-800`): Warning
- 🔴 **Red** (`bg-red-100 text-red-800`): Critical/Low

**Confidence Levels:**
- **High**: Blue badge (`variant="default"`)
- **Medium**: Gray badge (`variant="secondary"`)
- **Low**: Red badge (`variant="destructive"`)

**Prediction Card:**
- Gradient background: `from-blue-50 to-indigo-50`
- Border: `border-blue-200`
- Accent color: Blue (`text-blue-600`)

**Status Alerts:**
- Low: `bg-red-50` with red icon
- OK: `bg-green-50` with green icon
- High: `bg-yellow-50` with yellow icon

---

## 🖱️ Interactive Elements

### Buttons

#### Primary Actions
```
┌─────────────────────┐
│ [+ Add Product]     │  ← Add new product
└─────────────────────┘

┌─────────────────────┐
│ [Get Prediction]    │  ← Trigger ML forecast
└─────────────────────┘
```

#### Icon Buttons (Ghost variant)
```
[📈]  ← Demand Forecast (blue highlight)
[✏️]  ← Edit Product
[🗑️]  ← Delete Product (red on hover)
```

### Dropdowns (Select components)

**Store Selection:**
```
┌────────────────────────────┐
│ GreenGrocer Plaza      [▼] │
├────────────────────────────┤
│ City Fresh Store           │
│ Corner Grocery             │
│ FreshMart Downtown         │
│ GreenGrocer Plaza      ✓   │
│ MegaMart Westside          │
│ QuickStop Market           │
│ SuperSave Central          │
│ ValuePlus Market           │
└────────────────────────────┘
```

**Day of Week:**
```
┌────────────────────────────┐
│ Friday                 [▼] │
├────────────────────────────┤
│ Monday                     │
│ Tuesday                    │
│ Wednesday                  │
│ Thursday                   │
│ Friday                 ✓   │
│ Saturday                   │
│ Sunday                     │
└────────────────────────────┘
```

---

## 📱 Responsive Design

### Desktop View (>1024px)
- Full table layout with all columns visible
- Dialog: 2xl width (672px)
- Side-by-side form fields (grid-cols-2, grid-cols-3)

### Tablet View (768px - 1024px)
- Table scrolls horizontally if needed
- Dialog: xl width (576px)
- Form fields: 2 columns

### Mobile View (<768px)
- Stacked table rows (card-based layout recommended)
- Dialog: Full width with padding
- Form fields: Single column
- Collapsible sections for space efficiency

---

## 🎭 States & Feedback

### Loading States

**Initial Load:**
```
┌─────────────────────────────────────┐
│                                     │
│       Loading products...           │
│                                     │
└─────────────────────────────────────┘
```

**Prediction in Progress:**
```
┌────────────────────────────┐
│ [⟳ Predicting...]          │  ← Button disabled, spinner
└────────────────────────────┘
```

**Model Info Loading:**
```
Store Name *
[Loading...                  ]  ← Dropdown disabled
```

### Error States

**Connection Error:**
```
┌────────────────────────────────────────────────────────────┐
│ ⚠️  Could not connect to ML service. Please ensure the ML │
│     API is running.                                        │
└────────────────────────────────────────────────────────────┘
```

**Validation Error:**
```
┌────────────────────────────────────────────────────────────┐
│ ⚠️  Invalid store_name. Valid options: ['City Fresh Store',│
│     'Corner Grocery', ...]                                 │
└────────────────────────────────────────────────────────────┘
```

### Success State

**After Prediction:**
- Prediction card appears with gradient background
- Results animate in (smooth transition)
- Product table updates with forecast data
- Success feedback (visual emphasis on updated row)

---

## 🔤 Typography & Spacing

### Headings
- **Page Title**: `text-2xl font-bold` - "Product Management"
- **Card Title**: `text-lg font-semibold` - "Products Stock"
- **Dialog Title**: `text-lg font-semibold` with icon
- **Section Heading**: `text-lg font-semibold` - "Prediction Results"

### Body Text
- **Labels**: `text-sm` - Form field labels
- **Values**: `text-sm` - Table cells, input values
- **Large Numbers**: `text-2xl font-bold` - Prediction results
- **Small Text**: `text-xs` - Helper text, badges
- **Description**: `text-sm text-gray-600` - Subtitles

### Spacing
- **Page Padding**: `p-6` (24px)
- **Card Content**: `pt-6` (24px top)
- **Form Fields**: `space-y-4` (16px vertical gap)
- **Button Groups**: `gap-2` (8px gap)

---

## 🎯 User Flow

### Complete Workflow Diagram

```
START
  │
  ├─> User opens Products page
  │   │
  │   ├─> Views products with stock levels
  │   │
  │   ├─> Sees ML info banner
  │   │
  │   └─> Clicks 📈 forecast button on product
  │
  ├─> Forecast Dialog opens
  │   │
  │   ├─> Loads model info (valid stores/products)
  │   │
  │   ├─> Pre-fills product data
  │   │
  │   ├─> User selects store
  │   │
  │   ├─> User enters/adjusts transaction data
  │   │   ├─> Quantity sold today
  │   │   ├─> Price (from product)
  │   │   └─> Discount (if any)
  │   │
  │   ├─> (Optional) User expands historical section
  │   │   └─> Enters lag values and rolling stats
  │   │
  │   ├─> User sets calendar features
  │   │   ├─> Day of week
  │   │   ├─> Month
  │   │   └─> Weekend flag
  │   │
  │   └─> User clicks "Get Prediction"
  │
  ├─> API Request to ML service
  │   │
  │   ├─> [Loading spinner shown]
  │   │
  │   ├─> ML model processes features
  │   │
  │   └─> Returns prediction
  │
  ├─> Results Display
  │   │
  │   ├─> Shows predicted demand
  │   │
  │   ├─> Shows recommended stock
  │   │
  │   ├─> Shows confidence level
  │   │
  │   └─> Compares with current stock
  │
  ├─> User reviews results
  │   │
  │   ├─> Sees stock status (Low/OK/High)
  │   │
  │   └─> Makes inventory decision
  │
  └─> User closes dialog
      │
      └─> Product table updates with forecast
          │
          └─> Forecast data visible in ML column
```

---

## 📊 Data Visualization

### In Table View

**ML Forecast Column Layout:**
```
┌──────────────────┐
│ Demand: 4.9      │  ← Predicted quantity (blue)
│ Rec: 5.8         │  ← Recommended stock (green)
│ [Medium]         │  ← Confidence badge
└──────────────────┘
```

**Stock Cell with Badge:**
```
┌──────────────────┐
│ [15] 🟢 OK       │  ← Quantity with status
└──────────────────┘
```

### In Prediction Card

**Two-Column Layout:**
```
┌─────────────────┐  ┌─────────────────┐
│ Predicted       │  │ Recommended     │
│ Demand          │  │ Stock           │
│                 │  │                 │
│   4.87 units    │  │   5.84 units    │
└─────────────────┘  └─────────────────┘
        White bg          White bg
```

---

## ♿ Accessibility Features

### Keyboard Navigation
- **Tab**: Move between form fields
- **Enter**: Submit when focused on button
- **Escape**: Close dialog
- **Arrow Keys**: Navigate dropdown options
- **Space**: Toggle dropdown/select

### Screen Reader Support
- All buttons have `title` attributes
- Form labels properly associated with inputs
- Alert messages use semantic HTML
- Status indicators have text alternatives
- Loading states announce to screen readers

### Visual Accessibility
- High contrast ratios (WCAG AA compliant)
- Color is not the only indicator (icons + text)
- Clear focus indicators on interactive elements
- Large touch targets (44x44px minimum)
- Readable font sizes (minimum 12px)

---

## 🎬 Animations & Transitions

### Smooth Transitions
```css
transition-[color,box-shadow]  /* Inputs */
animate-spin                   /* Loading spinner */
smooth transitions             /* Dialog open/close */
```

### Hover Effects
- **Buttons**: Slight background darkening
- **Table Rows**: Light gray background
- **Icon Buttons**: Icon color change
- **Dropdowns**: Highlight on hover

### Focus States
- Blue ring around focused elements
- Increased visibility for keyboard users
- Smooth transition on focus/blur

---

## 🎨 Component Hierarchy

```
ProductsPage
├── Alert (ML Info Banner)
├── Card (Products Table)
│   └── Table
│       ├── TableHeader
│       ├── TableBody
│       │   └── TableRow (for each product)
│       │       ├── TableCell (Barcode)
│       │       ├── TableCell (Name)
│       │       ├── TableCell (Price)
│       │       ├── TableCell (Stock with Badge)
│       │       ├── TableCell (ML Forecast)
│       │       │   ├── Demand display
│       │       │   ├── Recommended display
│       │       │   └── Confidence Badge
│       │       └── TableCell (Actions)
│       │           ├── Forecast Button (📈)
│       │           ├── Edit Button (✏️)
│       │           └── Delete Button (🗑️)
│       └── ...
├── Dialog (Add/Edit Product)
└── DemandForecastDialog
    ├── DialogHeader
    │   ├── DialogTitle
    │   └── DialogDescription
    ├── Alert (Error display if needed)
    ├── Form Inputs
    │   ├── Select (Store)
    │   ├── Input (Product - disabled)
    │   ├── Input (Quantity)
    │   ├── Input (Price)
    │   ├── Input (Discount)
    │   ├── Input (Final Amount - disabled)
    │   ├── Details (Historical Data)
    │   │   ├── Input (Lag 1)
    │   │   ├── Input (Lag 3)
    │   │   ├── Input (Lag 7)
    │   │   ├── Input (Rolling Mean)
    │   │   └── Input (Rolling Std)
    │   ├── Select (Day of Week)
    │   ├── Select (Month)
    │   └── Select (Is Weekend)
    ├── Card (Prediction Results)
    │   ├── Result Grid
    │   │   ├── Predicted Demand
    │   │   └── Recommended Stock
    │   ├── Confidence Badge
    │   └── Stock Status Alert
    └── Action Buttons
        ├── Close
        └── Get Prediction
```

---

## 🌟 Best Practices Implemented

### UX Design
✅ **Progressive Disclosure**: Advanced options hidden by default
✅ **Clear Feedback**: Loading states, errors, and success messages
✅ **Smart Defaults**: Pre-filled values based on context
✅ **Validation**: Client-side validation before API calls
✅ **Consistency**: Same design language throughout

### Visual Design
✅ **Color Coding**: Intuitive status indicators
✅ **Hierarchy**: Clear visual importance of elements
✅ **Whitespace**: Adequate spacing for readability
✅ **Typography**: Consistent font sizes and weights
✅ **Icons**: Meaningful and universally understood

### Interaction Design
✅ **Minimal Clicks**: Quick access to key features
✅ **Reversible Actions**: Easy to close/cancel
✅ **Keyboard Support**: Full keyboard navigation
✅ **Touch Friendly**: Large interactive areas
✅ **Responsive**: Works on all screen sizes

---

## 📖 Usage Scenarios

### Scenario 1: Morning Stock Check
**User**: Store Manager
**Goal**: Check stock levels and forecast demand for the day

1. Opens Products page
2. Reviews current stock levels (color-coded)
3. Clicks forecast on products with low stock
4. Gets predictions for today
5. Places orders based on recommendations

### Scenario 2: Weekly Planning
**User**: Inventory Manager
**Goal**: Plan next week's inventory

1. Opens Products page
2. Forecasts each major product
3. Notes predictions in spreadsheet
4. Compares with historical accuracy
5. Adjusts orders accordingly

### Scenario 3: New Product Analysis
**User**: Category Manager
**Goal**: Determine initial stock level for new product

1. Adds new product
2. Opens forecast dialog
3. Uses similar product's data
4. Reviews recommendation
5. Sets initial stock based on prediction

---

## 🎓 Training Tips for Users

### Quick Tips Display (Could be added)
```
💡 Tips:
• Use historical data for better accuracy
• Forecast at the start of your workday
• Compare predictions with actual sales
• Adjust safety buffer based on your needs
• Green badge means you're stocked well
```

### Tooltips (Hover text)
- **Predicted Demand**: "Expected units to sell tomorrow"
- **Recommended Stock**: "Prediction + 20% safety buffer"
- **Confidence**: "Reliability of this prediction"
- **Lag Values**: "Sales from previous days"

---

**End of UI Guide**

This guide provides a complete visual reference for the ML demand forecasting integration. Use it for development, testing, and user training.

**Version**: 1.0.0
**Last Updated**: 2025