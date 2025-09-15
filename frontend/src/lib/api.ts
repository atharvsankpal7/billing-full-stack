const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Generic API request function
async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, { ...defaultOptions, ...options });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`API request failed for ${endpoint}:`, error);
    throw error;
  }
}

// Products API
export const productsApi = {
  getAll: () => apiRequest('/products'),
  getByBarcode: (barcode: string) => apiRequest(`/products/${barcode}`),
  create: (product: { barcode: string; name: string; price: number; stock: number }) =>
    apiRequest('/products', { method: 'POST', body: JSON.stringify(product) }),
  update: (barcode: string, updates: Partial<{ name: string; price: number; stock: number }>) =>
    apiRequest(`/products/${barcode}`, { method: 'PUT', body: JSON.stringify(updates) }),
  delete: (barcode: string) => apiRequest(`/products/${barcode}`, { method: 'DELETE' }),
};

// Sales API
export const salesApi = {
  getAll: () => apiRequest('/sales'),
  create: (sale: {
    barcode: string;
    name: string;
    price: number;
  }) => apiRequest('/sales', { method: 'POST', body: JSON.stringify(sale) }),
  getForecast: () => apiRequest('/forecast'),
};

// Receipts API
export const receiptsApi = {
  getAll: () => apiRequest('/receipts'),
  getById: (receiptId: string) => apiRequest(`/receipts/${receiptId}`),
  create: (receipt: {
    items: Array<{ name: string; quantity: number; price: number; subtotal: number }>;
    total: number;
    payment_method: string;
    payment_status: string;
    customer_name: string;
    customer_phone: string;
    amount_paid?: number;
  }) => apiRequest('/receipts', { method: 'POST', body: JSON.stringify(receipt) }),
  delete: (receiptId: string) => apiRequest(`/receipts/${receiptId}`, { method: 'DELETE' }),
};

// Barcode API
export const barcodeApi = {
  scanFromImage: (imageData: string) =>
    apiRequest('/barcode/scan', { 
      method: 'POST', 
      body: JSON.stringify({ image: imageData }) 
    }),
  validateBarcode: (barcode: string) => apiRequest(`/barcode/validate/${barcode}`),
};

// Types
export interface Product {
  id: number;
  barcode: string;
  name: string;
  price: number;
  stock: number;
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
  items: Array<{ id: number; name: string; price: number; quantity: number }>;
  total_amount: number;
  payment_method: string;
  payment_status: string;
  timestamp: string;
}

export interface ForecastResult {
  top_seller: {
    barcode: string;
    name: string;
    sales_count: number;
    current_stock: number;
  };
  alert: boolean;
  message: string;
  recommendation: string;
}