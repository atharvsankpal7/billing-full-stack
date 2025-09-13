"""
Project: Smart Stock Prediction System for Retail Stores
Description: A complete Command-Line Interface (CLI) application that simulates
             the entire functionality of the project. It includes an in-memory database,
             full CRUD operations for inventory management, a real-time billing system
             with simulated barcode scanning, and a smart stock forecasting module.
Author: Gemini
Date: 2025-09-01
"""

import time
from datetime import datetime

# --- In-Memory Database ---
# Using a Python dictionary to act as our database.
# Key: Barcode (string)
# Value: Dictionary with product details {name, price, stock}
PRODUCT_DB = {
    "8901234567890": {"name": "Parle-G Biscuit 50g", "price": 10.00, "stock": 100},
    "8901719123456": {"name": "Amul Gold Milk 500ml", "price": 28.00, "stock": 50},
    "8901030721273": {"name": "Tata Salt 1kg", "price": 25.00, "stock": 80},
    "9000000000001": {"name": "Local Loose Sugar 1kg", "price": 45.00, "stock": 40},
    "9000000000002": {"name": "Local Loose Rice 1kg", "price": 60.00, "stock": 60},
    "8904004400018": {"name": "Aashirvaad Atta 5kg", "price": 250.00, "stock": 30},
}

# --- Sales Records for Forecasting ---
# This list will store every transaction to be analyzed later.
SALES_RECORDS = []


def display_main_menu():
    """Prints the main menu for the application."""
    print("\n--- Smart Stock Prediction System ---")
    print("      Annasahab Dange College, Ashta")
    print("---------------------------------------")
    print("1. Start Billing Session (Customer Mode)")
    print("2. Manage Inventory (Admin Mode)")
    print("3. Run Smart Stock Forecast (Admin Mode)")
    print("4. Exit Application")
    print("---------------------------------------")

def display_inventory_menu():
    """Prints the menu for inventory management."""
    print("\n--- Inventory Management ---")
    print("1. Add New Product")
    print("2. View All Products")
    print("3. Update a Product")
    print("4. Delete a Product")
    print("5. Return to Main Menu")
    print("----------------------------")

# --- CRUD Operations for Inventory ---

def add_product():
    """Handles adding a new product to the database."""
    print("\n-- Add New Product --")
    barcode = input("Enter product barcode: ").strip()
    if barcode in PRODUCT_DB:
        print("❌ Error: Product with this barcode already exists.")
        return
    
    try:
        name = input("Enter product name: ")
        price = float(input("Enter product price: "))
        stock = int(input("Enter initial stock quantity: "))
        
        PRODUCT_DB[barcode] = {"name": name, "price": price, "stock": stock}
        print(f"✅ Success: '{name}' has been added to the inventory.")
    except ValueError:
        print("❌ Error: Invalid price or stock. Please enter numeric values.")

def view_inventory():
    """Displays all products in the database."""
    print("\n--- Current Inventory ---")
    if not PRODUCT_DB:
        print("Inventory is empty.")
        return
        
    print(f"{'Barcode':<20} {'Name':<25} {'Price':<10} {'Stock'}")
    print("-" * 70)
    for barcode, details in PRODUCT_DB.items():
        print(f"{barcode:<20} {details['name']:<25} ₹{details['price']:<9.2f} {details['stock']}")
    print("-" * 70)

def update_product():
    """Updates an existing product's details."""
    print("\n-- Update Product --")
    barcode = input("Enter the barcode of the product to update: ").strip()
    if barcode not in PRODUCT_DB:
        print("❌ Error: Product not found.")
        return
        
    product = PRODUCT_DB[barcode]
    print(f"Updating '{product['name']}'. Press Enter to skip a field.")
    
    try:
        new_name = input(f"Enter new name ({product['name']}): ").strip()
        if new_name:
            product['name'] = new_name

        new_price_str = input(f"Enter new price ({product['price']}): ").strip()
        if new_price_str:
            product['price'] = float(new_price_str)

        new_stock_str = input(f"Enter new stock ({product['stock']}): ").strip()
        if new_stock_str:
            product['stock'] = int(new_stock_str)
            
        print("✅ Success: Product updated.")
    except ValueError:
        print("❌ Error: Invalid price or stock. Update failed.")

def delete_product():
    """Deletes a product from the database."""
    print("\n-- Delete Product --")
    barcode = input("Enter the barcode of the product to delete: ").strip()
    if barcode not in PRODUCT_DB:
        print("❌ Error: Product not found.")
        return
        
    product_name = PRODUCT_DB[barcode]['name']
    confirm = input(f"Are you sure you want to delete '{product_name}'? (y/n): ").lower()
    if confirm == 'y':
        del PRODUCT_DB[barcode]
        print(f"✅ Success: '{product_name}' has been deleted.")
    else:
        print("Operation cancelled.")

def manage_inventory():
    """Main loop for the inventory management sub-menu."""
    while True:
        display_inventory_menu()
        choice = input("Enter your choice (1-5): ")
        if choice == '1':
            add_product()
        elif choice == '2':
            view_inventory()
        elif choice == '3':
            update_product()
        elif choice == '4':
            delete_product()
        elif choice == '5':
            print("Returning to main menu...")
            break
        else:
            print("Invalid choice. Please try again.")
        input("\nPress Enter to continue...")

# --- Billing System ---

def simulate_barcode_scan():
    """
    This function simulates the Raspberry Pi camera scanning a barcode.
    In the real project, this would be replaced with the picamera2 and pyzbar code.
    """
    return input("SCAN> Enter barcode (or type 'pay' to finish): ").strip()

def start_billing_session():
    """Manages a customer's shopping and billing session."""
    print("\n--- New Billing Session Started ---")
    print("Welcome! Please 'scan' your items.")
    
    cart = {}
    total_amount = 0.0

    while True:
        barcode = simulate_barcode_scan()
        
        if barcode.lower() == 'pay':
            if not cart:
                print("Cart is empty. Session cancelled.")
                return
            break
            
        if barcode in PRODUCT_DB:
            product = PRODUCT_DB[barcode]
            if product['stock'] > 0:
                # Add item to cart
                cart[barcode] = cart.get(barcode, 0) + 1
                total_amount += product['price']
                
                print(f"  + Added: {product['name']} | Price: ₹{product['price']:.2f}")
                print(f"  > Current Total: ₹{total_amount:.2f}")
            else:
                print(f"❌ Out of Stock: Sorry, {product['name']} is currently unavailable.")
        else:
            print("❌ Invalid Barcode: Product not found in database.")

    # --- Payment and Receipt ---
    print("\n--- Final Bill ---")
    print(f"{'Item Name':<25} {'Qty':<5} {'Price':<10} {'Total'}")
    print("-" * 50)
    for barcode, quantity in cart.items():
        product = PRODUCT_DB[barcode]
        item_total = product['price'] * quantity
        print(f"{product['name']:<25} {quantity:<5} ₹{product['price']:<9.2f} ₹{item_total:<9.2f}")
    
    print("-" * 50)
    print(f"{'GRAND TOTAL':>31}   ₹{total_amount:.2f}")
    print("-" * 50)
    
    # Simulate payment processing
    print("Processing payment via digital wallet...")
    time.sleep(2)
    print("✅ Payment Successful! Thank you for shopping.")
    
    # --- Update Database and Sales Records ---
    # This is a critical step for the forecasting system
    for barcode, quantity in cart.items():
        PRODUCT_DB[barcode]['stock'] -= quantity
        # Record each item sale for future analysis
        for _ in range(quantity):
            SALES_RECORDS.append({
                'barcode': barcode,
                'name': PRODUCT_DB[barcode]['name'],
                'price': PRODUCT_DB[barcode]['price'],
                'timestamp': datetime.now()
            })
            
    input("\nPress Enter to start a new session...")

# --- Smart Stock Forecasting ---

def run_smart_stock_forecast():
    """Analyzes sales data and predicts which items need restocking."""
    print("\n--- 🧠 Running Smart Stock Forecast ---")
    if not SALES_RECORDS:
        print("No sales data available to analyze. Please complete a billing session first.")
        return

    print(f"Analyzing {len(SALES_RECORDS)} total sales records...")
    time.sleep(1)

    # Count sales for each product
    product_sales_count = {}
    for record in SALES_RECORDS:
        barcode = record['barcode']
        product_sales_count[barcode] = product_sales_count.get(barcode, 0) + 1

    # Find the best-selling product
    if not product_sales_count:
        print("Analysis complete. No significant trends found yet.")
        return

    best_seller_barcode = max(product_sales_count, key=product_sales_count.get)
    best_seller_details = PRODUCT_DB[best_seller_barcode]
    best_seller_sales = product_sales_count[best_seller_barcode]

    print(f"\n📈 Top Selling Product: '{best_seller_details['name']}' with {best_seller_sales} units sold.")

    # --- Predictive Logic ---
    # This is a simplified rule-based prediction. A real system would use a time-series model.
    # We generate an alert if the top seller's stock is low compared to its sales velocity.
    
    current_stock = best_seller_details['stock']
    
    # Define a simple "low stock" threshold
    LOW_STOCK_THRESHOLD = 15 

    print(f"Current stock for '{best_seller_details['name']}': {current_stock} units.")
    
    if current_stock < LOW_STOCK_THRESHOLD:
        print("\n🚨 PREDICTIVE ALERT! 🚨")
        print(f"High demand detected for '{best_seller_details['name']}'.")
        print(f"With only {current_stock} units left, a stockout is likely.")
        print(">> Recommendation: Restock this item immediately.")
    else:
        print("\n✅ Stock levels for top seller appear adequate for now.")
        print("Analysis complete.")


# --- Main Application Loop ---

def main():
    """The main function to run the CLI application."""
    while True:
        display_main_menu()
        choice = input("Enter your choice (1-4): ")
        
        if choice == '1':
            start_billing_session()
        elif choice == '2':
            manage_inventory()
        elif choice == '3':
            run_smart_stock_forecast()
        elif choice == '4':
            print("Exiting application. Goodbye!")
            break
        else:
            print("Invalid choice. Please enter a number between 1 and 4.")
        
if __name__ == "__main__":
    main()
