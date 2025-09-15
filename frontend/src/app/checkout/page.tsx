"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { IndianRupee, CreditCard, Wallet, Landmark } from 'lucide-react';
import { salesApi, receiptsApi } from '@/lib/api';
import type { CartItem } from '@/lib/types';

interface CheckoutForm {
  customerName: string;
  customerPhone: string;
  paymentMethod: 'cash' | 'card' | 'upi';
}

export default function CheckoutPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CheckoutForm>({
    customerName: '',
    customerPhone: '',
    paymentMethod: 'cash',
  });
  const router = useRouter();

  useEffect(() => {
    // Load cart from localStorage
    const savedCart = localStorage.getItem('billingCart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    } else {
      router.push('/');
    }
  }, [router]);

  const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleInputChange = (field: keyof CheckoutForm, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setLoading(true);
    
    try {
      // Create receipt
      await receiptsApi.create({
        items: cart.map(item => ({
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          subtotal: item.price * item.quantity
        })),
        total: totalAmount,
        payment_method: formData.paymentMethod.toUpperCase(),
        payment_status: 'COMPLETED',
        customer_name: formData.customerName,
        customer_phone: formData.customerPhone,
        amount_paid: totalAmount
      });

      // Clear cart
      localStorage.removeItem('billingCart');
      
      alert('Checkout completed successfully!');
      router.push('/previous-checkouts');
    } catch (error) {
      console.error('Error during checkout:', error);
      alert('Error during checkout. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Checkout</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500">Your cart is empty. Please add items before checking out.</p>
            <Button onClick={() => router.push('/')} className="mt-4">
              Continue Shopping
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Checkout</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Order Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Qty</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Subtotal</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cart.map((item) => (
                  <TableRow key={item.barcode}>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell>₹{item.price.toFixed(2)}</TableCell>
                    <TableCell>₹{(item.price * item.quantity).toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            
            <div className="mt-4 pt-4 border-t">
              <div className="flex justify-between text-lg font-semibold">
                <span>Total Amount:</span>
                <span>₹{totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Form */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="customerName">Customer Name</Label>
                <Input
                  id="customerName"
                  value={formData.customerName}
                  onChange={(e) => handleInputChange('customerName', e.target.value)}
                  required
                  placeholder="Enter customer name"
                />
              </div>

              <div>
                <Label htmlFor="customerPhone">Phone Number</Label>
                <Input
                  id="customerPhone"
                  value={formData.customerPhone}
                  onChange={(e) => handleInputChange('customerPhone', e.target.value)}
                  required
                  placeholder="Enter phone number"
                  pattern="[0-9]{10}"
                  maxLength={10}
                />
              </div>

              <div>
                <Label>Payment Method</Label>
                <RadioGroup
                  value={formData.paymentMethod}
                  onValueChange={(value) => handleInputChange('paymentMethod', value as 'cash' | 'card' | 'upi')}
                  className="grid grid-cols-3 gap-4"
                >
                  <div>
                    <RadioGroupItem value="cash" id="cash" className="peer sr-only" />
                    <Label
                      htmlFor="cash"
                      className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                    >
                      <Wallet className="mb-2 h-6 w-6" />
                      Cash
                    </Label>
                  </div>
                  <div>
                    <RadioGroupItem value="card" id="card" className="peer sr-only" />
                    <Label
                      htmlFor="card"
                      className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                    >
                      <CreditCard className="mb-2 h-6 w-6" />
                      Card
                    </Label>
                  </div>
                  <div>
                    <RadioGroupItem value="upi" id="upi" className="peer sr-only" />
                    <Label
                      htmlFor="upi"
                      className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                    >
                      <Landmark className="mb-2 h-6 w-6" />
                      UPI
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/')}
                  className="flex-1"
                >
                  Back to Cart
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1"
                >
                  {loading ? 'Processing...' : 'Complete Checkout'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}