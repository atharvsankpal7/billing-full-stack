'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Camera, Scan, X, CheckCircle, AlertCircle } from 'lucide-react';

interface CameraScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onBarcodeScanned: (barcode: string) => void;
}

export function CameraScanner({ isOpen, onClose, onBarcodeScanned }: CameraScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<{ success: boolean; message: string; barcode?: string } | null>(null);

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
    }
  }, [isOpen]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      
      setIsScanning(true);
      setScanResult(null);
      
      // Start scanning loop
      requestAnimationFrame(scanBarcode);
    } catch (error) {
      console.error('Error accessing camera:', error);
      setScanResult({
        success: false,
        message: 'Camera access denied. Please check permissions.'
      });
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
    setIsScanning(false);
  };

  const scanBarcode = async () => {
    if (!videoRef.current || !canvasRef.current || !isScanning) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (video.readyState === video.HAVE_ENOUGH_DATA) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context?.drawImage(video, 0, 0, canvas.width, canvas.height);

      try {
        // This is where we would integrate with a barcode scanning library
        // For now, we'll simulate scanning with a mock function
        const mockBarcode = simulateBarcodeScan();
        
        if (mockBarcode) {
          setScanResult({
            success: true,
            message: 'Barcode scanned successfully!',
            barcode: mockBarcode
          });
          setIsScanning(false);
          
          // Auto-close after successful scan
          setTimeout(() => {
            onBarcodeScanned(mockBarcode);
            onClose();
          }, 1500);
        }
      } catch (error) {
        console.error('Error scanning barcode:', error);
      }
    }

    if (isScanning) {
      requestAnimationFrame(scanBarcode);
    }
  };

  const simulateBarcodeScan = (): string | null => {
    // Simulate barcode detection with 30% success rate
    if (Math.random() < 0.3) {
      const sampleBarcodes = [
        '8901234567890', // Milk
        '8901234567891', // Bread
        '8901234567892', // Eggs
        '8901234567893', // Butter
        '8901234567894'  // Cheese
      ];
      return sampleBarcodes[Math.floor(Math.random() * sampleBarcodes.length)];
    }
    return null;
  };

  const handleRetry = () => {
    setScanResult(null);
    setIsScanning(true);
    startCamera();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Scan Barcode
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Camera Preview */}
          <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            <canvas ref={canvasRef} className="hidden" />
            
            {/* Scanning overlay */}
            {isScanning && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-48 h-48 border-2 border-green-400 rounded-lg animate-pulse">
                  <div className="w-full h-1 bg-green-400 animate-pulse" />
                </div>
              </div>
            )}
          </div>

          {/* Scan Results */}
          {scanResult && (
            <div className={`p-4 rounded-lg text-center ${
              scanResult.success 
                ? 'bg-green-50 text-green-800 border border-green-200' 
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              <div className="flex items-center justify-center gap-2 mb-2">
                {scanResult.success ? (
                  <CheckCircle className="h-5 w-5" />
                ) : (
                  <AlertCircle className="h-5 w-5" />
                )}
                <span className="font-semibold">{scanResult.message}</span>
              </div>
              {scanResult.barcode && (
                <div className="text-sm">
                  Barcode: <code className="bg-black/10 px-2 py-1 rounded">{scanResult.barcode}</code>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} className="flex-1">
              <X className="h-4 w-4 mr-2" />
              Close
            </Button>
            
            {!scanResult?.success && (
              <Button onClick={handleRetry} className="flex-1">
                <Scan className="h-4 w-4 mr-2" />
                {isScanning ? 'Scanning...' : 'Retry Scan'}
              </Button>
            )}
          </div>

          {/* Instructions */}
          <div className="text-sm text-gray-500 text-center">
            <p>Point the camera at the barcode. Ensure good lighting.</p>
            <p>The barcode should be within the frame.</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}