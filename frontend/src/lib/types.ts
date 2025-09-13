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

export interface Receipt {
  receipt_id: string;
  items: CartItem[];
  total_amount: number;
  payment_method: string;
  payment_status: string;
  timestamp: string;
}

export interface PaymentResult {
  paymentMethod: string;
  amountPaid: number;
  paymentStatus: 'completed' | 'declined';
}

export type PaymentMethod = "cash" | "upi";
export type PaymentStatus = "completed" | "declined";