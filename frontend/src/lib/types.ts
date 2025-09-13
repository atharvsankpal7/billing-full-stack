export interface Product {
  id: number;
  barcode: string;
  name: string;
  price: number;
  stock: number;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Sale {
  id: number;
  barcode: string;
  name: string;
  price: number;
  timestamp: string;
}

export interface ReceiptItem {
  name: string;
  quantity: number;
  price: number;
  subtotal: number;
}

export interface ReceiptI  {
  id: number;
  receipt_id: string;
  items: ReceiptItem[];
  total: number;  // Maps from total_amount
  payment_method: string;
  payment_status: string;
  customer_name: string;
  customer_phone: string;
  amount_paid: number;
  change: number;  // Maps from change_amount
  created_at: string;  // Maps from timestamp
}

export interface PaymentResult {
  paymentMethod: string;
  amountPaid: number;
  paymentStatus: 'completed' | 'declined';
}

export type PaymentMethod = "cash" | "upi";
export type PaymentStatus = "completed" | "declined";