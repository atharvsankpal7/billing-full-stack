"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Loader2,
  TrendingUp,
  Package,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import { mlApi } from "@/lib/api";
import type { Product } from "@/lib/types";

interface DemandForecastDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product;
  onPredictionComplete?: (prediction: any) => void;
}

export function DemandForecastDialog({
  open,
  onOpenChange,
  product,
  onPredictionComplete,
}: DemandForecastDialogProps) {
  const [loading, setLoading] = useState(false);
  const [modelInfo, setModelInfo] = useState<any>(null);
  const [prediction, setPrediction] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    store_name: "Store 1",
    quantity: 5,
    discount_amount: 0,
    final_amount: product.price * 5,
  });

  // Load model info on mount
  useEffect(() => {
    if (open) {
      loadModelInfo();
      resetForm();
    }
  }, [open, product]);

  const resetForm = () => {
    setFormData({
      store_name: "Store 1",
      quantity: 5,
      discount_amount: 0,
      final_amount: product.price * 5,
    });
    setPrediction(null);
    setError(null);
  };

  const loadModelInfo = async () => {
    try {
      const info = await mlApi.getModelInfo();
      setModelInfo(info);
    } catch (err: any) {
      console.error("Failed to load model info:", err);
      setError(
        "Could not connect to ML service. Please ensure the ML API is running.",
      );
    }
  };

  const handleInputChange = (name: string, value: string | number) => {
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };

      // Recalculate final_amount when quantity or discount changes
      if (name === "quantity" || name === "discount_amount") {
        const qty = name === "quantity" ? Number(value) : updated.quantity;
        const discount =
          name === "discount_amount" ? Number(value) : updated.discount_amount;
        updated.final_amount = product.price * qty - discount;
      }

      return updated;
    });
  };

  const handlePredict = async () => {
    setLoading(true);
    setError(null);
    setPrediction(null);

    try {
      // Validate required fields
      if (!formData.store_name) {
        throw new Error("Please select a store");
      }

      const result = await mlApi.predict(product.barcode, {
        store_name: formData.store_name,
        quantity: Number(formData.quantity),
        discount_amount: Number(formData.discount_amount),
        final_amount: Number(formData.final_amount),
      });

      setPrediction(result.prediction);
      if (onPredictionComplete) {
        onPredictionComplete(result.prediction);
      }
    } catch (err: any) {
      setError(err.message || "Failed to get prediction");
    } finally {
      setLoading(false);
    }
  };

  const getConfidenceBadgeVariant = (confidence: string) => {
    switch (confidence.toLowerCase()) {
      case "high":
        return "default";
      case "medium-high":
        return "default";
      case "medium":
        return "secondary";
      case "medium-low":
        return "secondary";
      case "low":
        return "destructive";
      default:
        return "outline";
    }
  };

  const getStockStatus = () => {
    if (!prediction) return null;

    const stockDiff = product.stock - prediction.recommended_stock;
    const percentDiff = (stockDiff / prediction.recommended_stock) * 100;

    if (stockDiff < 0) {
      return {
        icon: <AlertTriangle className="h-5 w-5 text-red-600" />,
        message: `Stock is ${Math.abs(stockDiff).toFixed(1)} units below recommended`,
        color: "text-red-600",
        bgColor: "bg-red-50",
      };
    } else if (stockDiff > prediction.recommended_stock * 0.5) {
      return {
        icon: <Package className="h-5 w-5 text-yellow-600" />,
        message: `Stock is ${Math.abs(percentDiff).toFixed(0)}% above recommended (possible overstock)`,
        color: "text-yellow-600",
        bgColor: "bg-yellow-50",
      };
    } else {
      return {
        icon: <CheckCircle className="h-5 w-5 text-green-600" />,
        message: "Stock level is optimal",
        color: "text-green-600",
        bgColor: "bg-green-50",
      };
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Demand Forecast for {product.name}
          </DialogTitle>
          <DialogDescription>
            Predict next-day demand using ML model to optimize inventory levels
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Input Form */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="store_name">Store Name</Label>
                <Input
                  id="store_name"
                  value="Store 1"
                  disabled
                  className="bg-gray-50"
                />
              </div>

              <div>
                <Label htmlFor="product_name">Product Name</Label>
                <Input
                  id="product_name"
                  value={product.name}
                  disabled
                  className="bg-gray-50"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="quantity">Current Quantity Sold</Label>
                <Input
                  id="quantity"
                  type="number"
                  value={formData.quantity}
                  onChange={(e) =>
                    handleInputChange("quantity", e.target.value)
                  }
                  min="0.1"
                  step="0.1"
                />
              </div>

              <div>
                <Label htmlFor="unit_price">Unit Price (₹)</Label>
                <Input
                  id="unit_price"
                  type="number"
                  value={product.price}
                  disabled
                  className="bg-gray-50"
                />
              </div>

              <div>
                <Label htmlFor="discount_amount">Discount (₹)</Label>
                <Input
                  id="discount_amount"
                  type="number"
                  value={formData.discount_amount}
                  onChange={(e) =>
                    handleInputChange("discount_amount", e.target.value)
                  }
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="final_amount">Final Amount (₹)</Label>
              <Input
                id="final_amount"
                type="number"
                value={formData.final_amount.toFixed(2)}
                disabled
                className="bg-gray-50"
              />
            </div>

            <Alert className="bg-blue-50 border-blue-200">
              <AlertDescription className="text-blue-900 text-sm">
                <strong>Note:</strong> Historical sales data (lag values,
                rolling statistics) is automatically calculated from your sales
                database.
              </AlertDescription>
            </Alert>
          </div>

          {/* Prediction Results */}
          {prediction && (
            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
              <CardContent className="pt-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                  Prediction Results
                </h3>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <p className="text-sm text-gray-600 mb-1">
                      Predicted Demand
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {prediction.predicted_quantity.toFixed(2)} units
                    </p>
                  </div>

                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <p className="text-sm text-gray-600 mb-1">
                      Recommended Stock
                    </p>
                    <p className="text-2xl font-bold text-blue-600">
                      {prediction.recommended_stock.toFixed(2)} units
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      +20% safety buffer
                    </p>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-4 shadow-sm mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      Confidence Level
                    </span>
                    <Badge
                      variant={getConfidenceBadgeVariant(prediction.confidence)}
                    >
                      {prediction.confidence}
                    </Badge>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Current Stock</span>
                    <span className="text-lg font-semibold">
                      {product.stock} units
                    </span>
                  </div>

                  {getStockStatus() && (
                    <div
                      className={`flex items-center gap-2 mt-2 p-2 rounded-lg ${getStockStatus()!.bgColor}`}
                    >
                      {getStockStatus()!.icon}
                      <span
                        className={`text-sm font-medium ${getStockStatus()!.color}`}
                      >
                        {getStockStatus()!.message}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
            <Button onClick={handlePredict} disabled={loading || !modelInfo}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Predicting...
                </>
              ) : (
                "Get Prediction"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
