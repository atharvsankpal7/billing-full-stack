"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Pencil,
  Plus,
  Trash2,
  TrendingUp,
  Package,
  AlertCircle,
  Activity,
} from "lucide-react";
import { productsApi } from "@/lib/api";
import type { Product } from "@/lib/types";
import { DemandForecastDialog } from "@/components/DemandForecastDialog";

interface ProductWithForecast extends Product {
  predicted_demand?: number;
  recommended_stock?: number;
  confidence?: string;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<ProductWithForecast[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [forecastingProduct, setForecastingProduct] = useState<Product | null>(
    null,
  );
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isForecastDialogOpen, setIsForecastDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    barcode: "",
    name: "",
    price: 0,
    stock: 0,
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const data = await productsApi.getAll();
      setProducts(data);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      barcode: product.barcode,
      name: product.name,
      price: product.price,
      stock: product.stock,
    });
    setIsEditDialogOpen(true);
  };

  const handleAdd = () => {
    setEditingProduct(null);
    setFormData({
      barcode: "",
      name: "",
      price: 0,
      stock: 0,
    });
    setIsAddDialogOpen(true);
  };

  const handleForecast = (product: Product) => {
    setForecastingProduct(product);
    setIsForecastDialogOpen(true);
  };

  const handlePredictionComplete = (prediction: any) => {
    // Update the product with prediction data
    setProducts((prev) =>
      prev.map((p) =>
        p.barcode === forecastingProduct?.barcode
          ? {
              ...p,
              predicted_demand: prediction.predicted_quantity,
              recommended_stock: prediction.recommended_stock,
              confidence: prediction.confidence,
            }
          : p,
      ),
    );
  };

  const handleSubmit = async () => {
    try {
      if (editingProduct) {
        await productsApi.update(editingProduct.barcode, formData);
      } else {
        await productsApi.create(formData);
      }
      await fetchProducts();
      setIsEditDialogOpen(false);
      setIsAddDialogOpen(false);
    } catch (error) {
      console.error("Error saving product:", error);
    }
  };

  const handleDelete = async (barcode: string) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await productsApi.delete(barcode);
        await fetchProducts();
      } catch (error) {
        console.error("Error deleting product:", error);
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "price" || name === "stock" ? Number(value) : value,
    }));
  };

  const getStockStatusBadge = (product: ProductWithForecast) => {
    if (product.recommended_stock) {
      const stockDiff = product.stock - product.recommended_stock;
      if (stockDiff < 0) {
        return (
          <Badge variant="destructive" className="ml-2 text-xs">
            <AlertCircle className="h-3 w-3 mr-1" />
            Low
          </Badge>
        );
      } else if (stockDiff > product.recommended_stock * 0.5) {
        return (
          <Badge variant="secondary" className="ml-2 text-xs">
            <Package className="h-3 w-3 mr-1" />
            High
          </Badge>
        );
      } else {
        return (
          <Badge variant="default" className="ml-2 text-xs bg-green-600">
            <Activity className="h-3 w-3 mr-1" />
            OK
          </Badge>
        );
      }
    }
    return null;
  };

  const getConfidenceBadgeVariant = (
    confidence?: string,
  ): "default" | "secondary" | "destructive" | "outline" => {
    if (!confidence) return "outline";
    switch (confidence.toLowerCase()) {
      case "high":
      case "medium-high":
        return "default";
      case "medium":
      case "medium-low":
        return "secondary";
      case "low":
        return "destructive";
      default:
        return "outline";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-lg">Loading products...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Product Management
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Manage inventory with AI-powered demand forecasting
            </p>
          </div>
          <Button onClick={handleAdd}>
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        </div>

        {/* ML Integration Info */}
        <Alert className="mb-6 bg-blue-50 border-blue-200">
          <TrendingUp className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-900">
            <strong>ML Demand Forecasting Available:</strong> Click the forecast
            button on any product to predict next-day demand and get stock
            recommendations.
          </AlertDescription>
        </Alert>

        <Card>
          <CardHeader>
            <CardTitle>Products Stock</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Barcode</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Current Stock</TableHead>
                    <TableHead>ML Forecast</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center text-gray-500 py-8"
                      >
                        No products found. Add your first product to get
                        started.
                      </TableCell>
                    </TableRow>
                  ) : (
                    products.map((product) => (
                      <TableRow key={product.barcode}>
                        <TableCell className="font-mono">
                          {product.barcode}
                        </TableCell>
                        <TableCell className="font-medium">
                          {product.name}
                        </TableCell>
                        <TableCell>₹{product.price.toFixed(2)}</TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <span
                              className={`px-2 py-1 rounded text-sm font-semibold ${
                                product.stock < 10
                                  ? "bg-red-100 text-red-800"
                                  : product.stock < 20
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-green-100 text-green-800"
                              }`}
                            >
                              {product.stock}
                            </span>
                            {getStockStatusBadge(product)}
                          </div>
                        </TableCell>
                        <TableCell>
                          {product.predicted_demand ? (
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-600">
                                  Demand:
                                </span>
                                <span className="text-sm font-semibold text-blue-600">
                                  {product.predicted_demand.toFixed(1)}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-600">
                                  Recommended:
                                </span>
                                <span className="text-sm font-semibold text-green-600">
                                  {product.recommended_stock?.toFixed(1)}
                                </span>
                              </div>
                              {product.confidence && (
                                <Badge
                                  variant={getConfidenceBadgeVariant(
                                    product.confidence,
                                  )}
                                  className="text-xs"
                                >
                                  {product.confidence}
                                </Badge>
                              )}
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400 italic">
                              Not forecasted
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleForecast(product)}
                              title="Demand Forecast"
                            >
                              <TrendingUp className="h-4 w-4 text-blue-600" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(product)}
                              title="Edit Product"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(product.barcode)}
                              title="Delete Product"
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Add/Edit Dialog */}
        <Dialog
          open={isEditDialogOpen || isAddDialogOpen}
          onOpenChange={
            isEditDialogOpen ? setIsEditDialogOpen : setIsAddDialogOpen
          }
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingProduct ? "Edit Product" : "Add New Product"}
              </DialogTitle>
              <DialogDescription>
                {editingProduct
                  ? "Update the product details below."
                  : "Enter the product details below."}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="barcode">Barcode</Label>
                <Input
                  id="barcode"
                  name="barcode"
                  value={formData.barcode}
                  onChange={handleInputChange}
                  placeholder="123456789"
                  disabled={!!editingProduct}
                />
              </div>
              <div>
                <Label htmlFor="name">Product Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Product Name"
                />
              </div>
              <div>
                <Label htmlFor="price">Price (₹)</Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  value={formData.price}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />
              </div>
              <div>
                <Label htmlFor="stock">Stock</Label>
                <Input
                  id="stock"
                  name="stock"
                  type="number"
                  value={formData.stock}
                  onChange={handleInputChange}
                  placeholder="0"
                  min="0"
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsEditDialogOpen(false);
                    setIsAddDialogOpen(false);
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={handleSubmit}>
                  {editingProduct ? "Update" : "Add"} Product
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Demand Forecast Dialog */}
        {forecastingProduct && (
          <DemandForecastDialog
            open={isForecastDialogOpen}
            onOpenChange={setIsForecastDialogOpen}
            product={forecastingProduct}
            onPredictionComplete={handlePredictionComplete}
          />
        )}
      </div>
    </div>
  );
}
