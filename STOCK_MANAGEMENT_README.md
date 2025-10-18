# Stock Management Implementation

This document describes the stock management features implemented in the billing system to prevent overselling and ensure accurate inventory tracking.

## Overview

The system now includes comprehensive stock validation and management features across both backend and frontend to ensure:

1. **No overselling**: Items cannot be added to cart beyond available stock
2. **Real-time stock validation**: Stock is checked before checkout completion
3. **Automatic stock deduction**: Inventory is automatically updated during checkout
4. **Visual feedback**: Users see stock levels and warnings for low/out-of-stock items

---

## Backend Changes

### 1. Enhanced Receipt Creation (`backend/routes/receipts.py`)

#### Stock Validation Before Checkout
```python
# Validates stock availability for all items before processing
for item in data["items"]:
    cursor.execute(
        "SELECT barcode, stock FROM products WHERE name = ?", (item["name"],)
    )
    product = cursor.fetchone()
    
    if current_stock < required_quantity:
        stock_errors.append(
            f"Insufficient stock for '{item['name']}'. Available: {current_stock}, Required: {required_quantity}"
        )

# Returns 400 error if validation fails
if stock_errors:
    return jsonify(
        {"error": "Stock validation failed", "details": stock_errors}
    ), 400
```

#### Automatic Stock Deduction
```python
# Deduct stock for each item after validation passes
for item in data["items"]:
    cursor.execute(
        "UPDATE products SET stock = stock - ? WHERE barcode = ?",
        (quantity, barcode),
    )
    
    # Record individual sales for analytics
    for _ in range(quantity):
        cursor.execute(
            "INSERT INTO sales (barcode, name, price) VALUES (?, ?, ?)",
            (barcode, item["name"], price),
        )
```

#### Transaction Safety
- Uses database transactions with rollback on errors
- Validates all items before making any changes
- Ensures atomic operations (all or nothing)

### 2. Stock Validation Endpoint (`/api/receipts/validate-stock`)

New POST endpoint for pre-checkout validation:

```python
@receipts_bp.route("/receipts/validate-stock", methods=["POST"])
def validate_stock():
    """Validate stock availability for cart items before checkout"""
    # Returns detailed stock information
    # Returns 400 with error details if insufficient stock
    # Returns 200 with validated items if stock is available
```

**Request Format:**
```json
{
  "items": [
    {
      "name": "Product Name",
      "quantity": 2,
      "price": 10.00,
      "subtotal": 20.00
    }
  ]
}
```

**Response (Success):**
```json
{
  "valid": true,
  "items": [
    {
      "name": "Product Name",
      "barcode": "1234567890",
      "stock": 50,
      "price": 10.00,
      "quantity": 2
    }
  ]
}
```

**Response (Failure):**
```json
{
  "valid": false,
  "errors": [
    {
      "name": "Product Name",
      "available": 1,
      "requested": 2,
      "message": "Insufficient stock for 'Product Name'. Available: 1, Requested: 2"
    }
  ]
}
```

---

## Frontend Changes

### 1. Cart Context (`frontend/src/context/cart-context.tsx`)

New context provider for cart management with built-in stock validation.

#### Key Features:

**Add to Cart with Stock Validation**
```typescript
const addToCart = (product: Product) => {
  // Checks if quantity would exceed stock
  if (existingItem.quantity >= product.stock) {
    alert(`Cannot add more ${product.name}. Only ${product.stock} units available in stock.`);
    return prevCart;
  }
  
  // Checks if product is out of stock
  if (product.stock <= 0) {
    alert(`${product.name} is out of stock.`);
    return prevCart;
  }
};
```

**Update Quantity with Validation**
```typescript
const updateCartItemQuantity = (barcode: string, quantity: number) => {
  // Prevents exceeding available stock
  if (quantity > item.stock) {
    alert(`Cannot add more than ${item.stock} units...`);
    return { ...item, quantity: item.stock };
  }
};
```

**Sync Cart with Current Stock**
```typescript
const syncCartWithProducts = (products: Product[]) => {
  // Updates cart items with current stock levels
  // Removes items that are out of stock
  // Adjusts quantities that exceed available stock
};
```

#### Context Functions:
- `addToCart(product)`: Add product with stock validation
- `removeFromCart(barcode)`: Remove item from cart
- `updateCartItemQuantity(barcode, quantity)`: Update quantity with validation
- `clearCart()`: Empty the cart
- `getCartTotal()`: Calculate total price
- `getCartItemCount()`: Get total item count
- `syncCartWithProducts(products)`: Sync cart with current inventory

### 2. Main Billing Page (`frontend/src/app/page.tsx`)

#### Enhanced Product Display

**Visual Stock Indicators:**
- 🔴 Red: Out of stock (card dimmed, disabled)
- 🟠 Orange: Low stock (< 10 units)
- ⚪ Gray: Normal stock levels

**Product Card Features:**
```typescript
// Disables clicking on out-of-stock items
className={`cursor-pointer hover:shadow-md transition-shadow ${
  isOutOfStock ? "opacity-50 cursor-not-allowed" : ""
}`}

// Shows stock status with color coding
<div className={`text-sm mt-2 font-semibold ${
  isOutOfStock ? "text-red-500" :
  isLowStock ? "text-orange-500" :
  "text-gray-500"
}`}>
  Stock: {product.stock}
  {isOutOfStock && " (Out of Stock)"}
  {isLowStock && " (Low Stock)"}
</div>

// Shows items in cart and remaining stock
{cartItem && cartItem.quantity > 0 && (
  <div className="text-xs mt-1 text-blue-600">
    {cartItem.quantity} in cart • {remainingStock} remaining
  </div>
)}
```

#### Cart Quantity Input
- Maximum value limited to available stock
- Shows "Max" indicator when limit reached
- Real-time validation on quantity change

#### Auto-Sync with Products
```typescript
useEffect(() => {
  if (products.length > 0) {
    syncCartWithProducts(products);
  }
}, [products, syncCartWithProducts]);
```

### 3. Checkout Page (`frontend/src/app/checkout/page.tsx`)

#### Pre-Checkout Validation
```typescript
const handleSubmit = async (e: React.FormEvent) => {
  // Validate stock before submitting
  const validationResult = await receiptsApi.validateStock(
    cart.map((item) => ({
      name: item.name,
      quantity: item.quantity,
      price: item.price,
      subtotal: item.price * item.quantity,
    }))
  );

  if (!validationResult.valid) {
    // Show detailed error messages
    alert(
      "Stock validation failed:\n" +
      validationResult.errors
        .map((err: any) => err.message || err)
        .join("\n")
    );
    return;
  }

  // Proceed with checkout...
};
```

#### Enhanced Error Handling
- Detects stock validation failures
- Shows specific error messages for each item
- Prevents checkout completion if stock is insufficient

### 4. API Layer (`frontend/src/lib/api.ts`)

Added new API method:
```typescript
receiptsApi.validateStock(items: Array<{
  name: string;
  quantity: number;
  price: number;
  subtotal: number;
}>)
```

---

## User Experience Flow

### Adding Items to Cart

1. **Product Display**:
   - User sees all products with stock levels
   - Out-of-stock items are visually disabled
   - Low-stock items show orange warning

2. **Adding to Cart**:
   - Clicking product adds 1 unit to cart
   - Alert shown if trying to add beyond available stock
   - Alert shown if product is out of stock

3. **Cart Updates**:
   - Cart shows current quantity and item in cart
   - Product cards show remaining available stock
   - Quantity input limited to available stock

### Checkout Process

1. **Cart Review**:
   - User reviews items and quantities
   - Can adjust quantities (up to stock limit)
   - Can remove items

2. **Navigate to Checkout**:
   - Cart syncs with latest stock levels
   - Items adjusted if stock changed

3. **Pre-Checkout Validation**:
   - System validates stock availability
   - Shows detailed errors if validation fails
   - User must update cart if items unavailable

4. **Complete Checkout**:
   - Payment details collected
   - Stock deducted from inventory
   - Sales records created
   - Receipt generated

---

## Stock Validation Rules

### Frontend Validations (Immediate Feedback)

1. **Cannot add to cart if stock is 0**
2. **Cannot increment quantity beyond available stock**
3. **Quantity input max attribute set to stock level**
4. **Visual indicators for stock status**
5. **Cart syncs when products are refreshed**

### Backend Validations (Data Integrity)

1. **Pre-checkout stock validation endpoint**
2. **Stock validation before receipt creation**
3. **Atomic stock deduction in transaction**
4. **Rollback on any error during checkout**
5. **Sales records created for each unit sold**

---

## Error Messages

### Frontend Alerts

**When adding out-of-stock item:**
```
[Product Name] is out of stock.
```

**When exceeding stock limit:**
```
Cannot add more [Product Name]. Only [X] units available in stock.
```

**When updating quantity beyond stock:**
```
Cannot add more than [X] units of [Product Name]. Only [X] units available in stock.
```

**When checkout validation fails:**
```
Stock validation failed:
Insufficient stock for '[Product Name]'. Available: [X], Requested: [Y]
```

### Backend Error Responses

**400 Bad Request - Stock Validation Failed:**
```json
{
  "error": "Stock validation failed",
  "details": [
    "Insufficient stock for 'Product Name'. Available: 5, Required: 10"
  ]
}
```

---

## Database Schema

### Products Table
```sql
CREATE TABLE products (
    barcode TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    price REAL NOT NULL,
    stock INTEGER NOT NULL  -- Automatically updated on checkout
)
```

### Sales Table
```sql
CREATE TABLE sales (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    barcode TEXT NOT NULL,
    name TEXT NOT NULL,
    price REAL NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (barcode) REFERENCES products (barcode)
)
```

**Note:** One sales record is created for each unit sold, enabling accurate sales analytics.

---

## Testing the Implementation

### Test Case 1: Add Item to Cart
1. Navigate to billing page
2. Click on a product with stock > 0
3. Verify item appears in cart
4. Click same product multiple times
5. Verify alert when reaching stock limit

### Test Case 2: Stock Limit in Cart
1. Add item to cart
2. Change quantity in cart input
3. Try entering value > stock
4. Verify quantity adjusts to max stock
5. Verify "Max" indicator appears

### Test Case 3: Out of Stock Item
1. Find product with stock = 0
2. Verify card is dimmed
3. Try clicking on card
4. Verify alert: "[Product] is out of stock"

### Test Case 4: Checkout Validation
1. Add items to cart
2. Manually reduce stock in database (simulate concurrent purchase)
3. Proceed to checkout
4. Verify validation error with details
5. Verify checkout doesn't complete

### Test Case 5: Successful Checkout
1. Add items to cart within stock limits
2. Complete checkout form
3. Verify success message
4. Check products table - verify stock reduced
5. Check sales table - verify records created
6. Check receipts table - verify receipt stored

---

## Benefits

### For Business
- **Prevent overselling**: No more selling items you don't have
- **Accurate inventory**: Real-time stock tracking
- **Better analytics**: Detailed sales records per unit
- **Customer satisfaction**: No order cancellations due to stock issues

### For Users
- **Clear visibility**: Always know what's available
- **Instant feedback**: Immediate validation at every step
- **Better experience**: No surprises at checkout
- **Helpful indicators**: Visual cues for stock status

### For Developers
- **Data integrity**: Validated at multiple levels
- **Type safety**: Full TypeScript support
- **Reusable**: Cart context can be used anywhere
- **Maintainable**: Clear separation of concerns
- **Testable**: Easy to test validation logic

---

## Future Enhancements

### Potential Improvements

1. **Reserved Stock**:
   - Reserve stock when added to cart
   - Release after timeout or checkout
   - Prevent concurrent checkout issues

2. **Stock Alerts**:
   - Email notifications for low stock
   - Dashboard for inventory management
   - Automated reorder suggestions

3. **Bulk Operations**:
   - Import/export stock levels
   - Bulk stock adjustments
   - Stock audit logs

4. **Advanced Features**:
   - Stock history tracking
   - Restock notifications to customers
   - Wishlist for out-of-stock items
   - Backorder support

---

## Troubleshooting

### Issue: Cart shows different stock than product list
**Solution**: Cart syncs automatically when products load. Refresh the page to get latest stock levels.

### Issue: Checkout fails with stock error
**Solution**: Another user may have purchased items simultaneously. Update cart quantities and try again.

### Issue: Stock deducted incorrectly
**Solution**: Check sales table for records. Each unit sold creates one sales record. Stock deduction matches total quantity in receipt.

### Issue: Can't add item to cart
**Solution**: 
- Check if item is out of stock (stock = 0)
- Check if you already have max quantity in cart
- Refresh page to get latest stock levels

---

## Code Locations

### Backend Files
- `backend/routes/receipts.py` - Receipt creation and stock validation
- `backend/routes/products.py` - Product CRUD operations
- `backend/database.py` - Database schema and initialization

### Frontend Files
- `frontend/src/context/cart-context.tsx` - Cart management with stock validation
- `frontend/src/app/page.tsx` - Main billing page with stock indicators
- `frontend/src/app/checkout/page.tsx` - Checkout with validation
- `frontend/src/lib/api.ts` - API client methods
- `frontend/src/lib/types.ts` - TypeScript interfaces
- `frontend/src/components/product-card-skeleton.tsx` - Loading state component

---

## API Endpoints Summary

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/receipts/validate-stock` | Validate stock before checkout |
| POST | `/api/receipts` | Create receipt and deduct stock |
| GET | `/api/products` | Get all products with stock |
| GET | `/api/products/:barcode` | Get single product |
| PUT | `/api/products/:barcode` | Update product (including stock) |

---

## Conclusion

The stock management implementation provides comprehensive protection against overselling while maintaining a smooth user experience. With validation at multiple levels (frontend immediate feedback, pre-checkout validation, and backend transaction validation), the system ensures data integrity while providing helpful feedback to users.

The implementation is production-ready and includes proper error handling, transaction safety, and user-friendly messages throughout the entire purchase flow.