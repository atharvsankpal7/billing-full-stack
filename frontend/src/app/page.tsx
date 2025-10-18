'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Camera, Scan, ShoppingCart, CreditCard, IndianRupee, X } from 'lucide-react';

import { CameraScanner } from '@/components/camera-scanner';
import { ThemeToggle } from '@/components/theme-toggle';
import { productsApi, salesApi, receiptsApi } from '@/lib/api';
import type { Product, CartItem, PaymentResult } from '@/lib/types';



export default function BillingPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCameraOpen, setIsCameraOpen] = useState(false);

  const [loading, setLoading] = useState(false);

  // Load products from backend
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const data = await productsApi.getAll();
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
      // Fallback to mock data if API fails
      setProducts([
        { id: 1, name: 'Milk', price: 50, barcode: '8901234567890', stock: 20 },
        { id: 2, name: 'Bread', price: 30, barcode: '8901234567891', stock: 15 },
        { id: 3, name: 'Eggs', price: 60, barcode: '8901234567892', stock: 25 },
        { id: 4, name: 'Butter', price: 45, barcode: '8901234567893', stock: 10 },
        { id: 5, name: 'Cheese', price: 80, barcode: '8901234567894', stock: 8 }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (product: Product) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.barcode === product.barcode);
      if (existingItem) {
        // Check if adding one more would exceed stock
        if (existingItem.quantity >= product.stock) {
          alert(`Cannot add more. Only ${product.stock} units available in stock.`);
          return prevCart;
        }
        return prevCart.map(item =>
          item.barcode === product.barcode
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        // Check if product is out of stock
        if (product.stock <= 0) {
          alert(`${product.name} is out of stock.`);
          return prevCart;
        }
        return [...prevCart, { ...product, quantity: 1 }];
      }
    });
  };

  const removeFromCart = (barcode: string) => {
    setCart(prevCart => prevCart.filter(item => item.barcode !== barcode));
  };

  const updateQuantity = (barcode: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(barcode);
    } else {
      setCart(prevCart =>
        prevCart.map(item => {
          if (item.barcode === barcode) {
            // Validate against available stock
            const product = products.find(p => p.barcode === barcode);
            if (product && quantity > product.stock) {
              alert(`Cannot add ${quantity} units. Only ${product.stock} units available in stock.`);
              return item;
            }
            return { ...item, quantity };
          }
          return item;
        })
      );
    }
  };

  const getTotal = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.barcode.includes(searchTerm)
  );

  const handleBarcodeScanned = (barcode: string) => {
    const product = products.find(p => p.barcode === barcode);
    if (product) addToCart(product);
  };

  const handleCheckout = () => {
    if (cart.length > 0) {
      // Save cart to localStorage for checkout page
      localStorage.setItem('billingCart', JSON.stringify(cart));
      window.location.href = '/checkout';
    }
  };



  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">


        {/* Products Section */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Products</CardTitle>
                  <CardDescription>Scan or search for products</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="icon" onClick={() => setIsCameraOpen(true)}>
                    <Camera className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon">
                    <Scan className="h-4 w-4" />
                  </Button>                  <Button
                    onClick={handleCheckout}
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white"
                    disabled={cart.length === 0}
                  >
                    <CreditCard className="h-4 w-4" />
                    Checkout ({cart.length})
                  </Button>
                </div>
              </div>
              <Input
                placeholder="Search products by name or barcode..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="mt-4"
              />
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredProducts.map((product) => {
                  const cartItem = cart.find(item => item.barcode === product.barcode);
                  const cartQuantity = cartItem ? cartItem.quantity : 0;
                  const isOutOfStock = product.stock <= 0;
                  const isMaxedOut = cartQuantity >= product.stock;

                  return (
                    <Card
                      key={product.barcode}
                      className={`transition-shadow ${
                        isOutOfStock || isMaxedOut
                          ? 'opacity-50 cursor-not-allowed'
                          : 'cursor-pointer hover:shadow-md'
                      }`}
                    >
                      <CardContent
                        className="p-4"
                        onClick={() => {
                          if (!isOutOfStock && !isMaxedOut) {
                            addToCart(product);
                          }
                        }}
                      >
                        <div className="text-center">
                          <div className="font-semibold text-lg mb-2">{product.name}</div>
                          <Badge variant="secondary" className="mb-2">
                            {product.barcode}
                          </Badge>
                          <div className="flex items-center justify-center gap-1 text-2xl font-bold text-green-600">
                            <IndianRupee className="h-5 w-5" />
                            {product.price}
                          </div>
                          <div className={`text-sm mt-2 ${
                            isOutOfStock
                              ? 'text-red-600 font-semibold'
                              : product.stock < 10
                              ? 'text-orange-600'
                              : 'text-gray-500'
                          }`}>
                            {isOutOfStock
                              ? 'Out of Stock'
                              : `Stock: ${product.stock}`}
                          </div>
                          {isMaxedOut && !isOutOfStock && (
                            <div className="text-xs text-orange-600 mt-1">
                              Max quantity in cart
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Cart Section */}
        <div className="lg:col-span-1">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Shopping Cart
                <Badge variant="secondary">{cart.length} items</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {cart.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <ShoppingCart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Your cart is empty</p>
                </div>
              ) : (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>Qty</TableHead>
                        <TableHead className="text-right">Price</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                        <TableHead className="w-8"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {cart.map((item) => (
                        <TableRow key={item.barcode}>
                          <TableCell className="font-medium">{item.name}</TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => updateQuantity(item.barcode, parseInt(e.target.value))}
                              className="w-16 h-8"
                            />
                          </TableCell>
                          <TableCell className="text-right">
                            <IndianRupee className="h-4 w-4 inline" />
                            {item.price}
                          </TableCell>
                          <TableCell className="text-right">
                            <IndianRupee className="h-4 w-4 inline" />
                            {(item.price * item.quantity).toFixed(2)}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeFromCart(item.barcode)}
                              className="h-8 w-8"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  <div className="border-t pt-4 mt-4">
                    <div className="flex justify-between items-center text-lg font-bold">
                      <span>Total:</span>
                      <span className="flex items-center gap-1">
                        <IndianRupee className="h-5 w-5" />
                        {getTotal().toFixed(2)}
                      </span>
                    </div>

                    <Button className="w-full mt-4" size="lg" onClick={handleCheckout}>
                      <CreditCard className="h-5 w-5 mr-2" />
                      Checkout
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Camera Scanner Modal */}
      <CameraScanner
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onBarcodeScanned={handleBarcodeScanned}
      />



    </div>
  );
}
