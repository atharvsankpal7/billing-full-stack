"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { IndianRupee, Calendar, User, Phone, Receipt } from 'lucide-react';
import { receiptsApi } from '@/lib/api';
import type { ReceiptI } from '@/lib/types';

export default function PreviousCheckoutsPage() {
  const [receipts, setReceipts] = useState<ReceiptI[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReceipts();
  }, []);

  const fetchReceipts = async () => {
    try {
      const data = await receiptsApi.getAll();
      setReceipts(data);
    } catch (error) {
      console.error('Error fetching receipts:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPaymentMethodColor = (method: string) => {
    switch (method.toLowerCase()) {
      case 'cash':
        return 'bg-green-100 text-green-800';
      case 'card':
        return 'bg-blue-100 text-blue-800';
      case 'upi':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Previous Checkouts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Previous Checkouts</h1>
        <Button onClick={fetchReceipts} variant="outline">
          Refresh
        </Button>
      </div>

      {receipts.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No Previous Checkouts</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500">No checkout history found. Start by creating a new sale.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {receipts.map((receipt) => (
            <Card key={receipt.id} className="overflow-hidden">
              <CardHeader className="bg-gray-50 dark:bg-gray-800">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg flex items-center">
                      <Receipt className="h-5 w-5 mr-2" />
                      {receipt.receipt_id}
                    </CardTitle>
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mt-2">
                      <Calendar className="h-4 w-4 mr-1" />
                      {formatDate(receipt.created_at)}
                    </div>
                  </div>
                  <Badge className={getPaymentMethodColor(receipt.payment_method)}>
                    {receipt.payment_method}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-2 text-gray-500" />
                    <span className="text-sm font-medium">{receipt.customer_name}</span>
                  </div>
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 mr-2 text-gray-500" />
                    <span className="text-sm">{receipt.customer_phone}</span>
                  </div>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead className="text-center">Qty</TableHead>
                      <TableHead className="text-right">Price</TableHead>
                      <TableHead className="text-right">Subtotal</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {receipt.items.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>{item.name}</TableCell>
                        <TableCell className="text-center">{item.quantity}</TableCell>
                        <TableCell className="text-right">₹{item.price.toFixed(2)}</TableCell>
                        <TableCell className="text-right">₹{item.subtotal.toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                <div className="mt-4 pt-4 border-t">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold">Total Amount:</span>
                    <span className="text-lg font-bold flex items-center">
                      <IndianRupee className="h-4 w-4 mr-1" />
                      {receipt.total.toFixed(2)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center mt-2 text-sm text-gray-600">
                    <span>Amount Paid:</span>
                    <span>₹{receipt.amount_paid?.toFixed(2) || receipt.total.toFixed(2)}</span>
                  </div>
                  
                  {receipt.change > 0 && (
                    <div className="flex justify-between items-center mt-2 text-sm text-gray-600">
                      <span>Change:</span>
                      <span>₹{receipt.change.toFixed(2)}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}