'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  IndianRupee,
  CreditCard,
  Smartphone,
  Wallet,
} from "lucide-react";
import { CartItem, PaymentResult } from "@/lib/types";

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  total: number;
  onCheckout: (paymentMethod: string, amountPaid: number, paymentStatus: string) => void;
}

export function CheckoutModal({
  isOpen,
  onClose,
  cart,
  total,
  onCheckout,
}: CheckoutModalProps) {
  const [paymentMethod, setPaymentMethod] = useState<string>("cash");

  const handleCheckout = () => {
    // Always complete payment with total amount
    onCheckout(paymentMethod, total, "completed");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Checkout
          </DialogTitle>
          <DialogDescription>
            Complete your purchase with secure payment options
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Order Summary */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">Order Summary</h4>
            {cart.map((item) => (
              <div
                key={item.barcode}
                className="flex justify-between text-sm"
              >
                <span>
                  {item.name} x{item.quantity}
                </span>
                <span className="flex items-center gap-1">
                  <IndianRupee className="h-3 w-3" />
                  {(item.price * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
            <div className="border-t mt-2 pt-2 flex justify-between font-bold">
              <span>Total:</span>
              <span className="flex items-center gap-1">
                <IndianRupee className="h-4 w-4" />
                {total.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Payment Method */}
          <div className="space-y-3">
            <Label>Payment Method</Label>
            <RadioGroup
              value={paymentMethod}
              onValueChange={(val) => setPaymentMethod(val)}
              className="space-y-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="cash" id="cash" />
                <Label
                  htmlFor="cash"
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <Wallet className="h-4 w-4" />
                  Cash
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <RadioGroupItem value="upi" id="upi" />
                <Label
                  htmlFor="upi"
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <Smartphone className="h-4 w-4" />
                  UPI
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button
              onClick={handleCheckout}
              className="flex-1"
            >
              Complete Payment
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
