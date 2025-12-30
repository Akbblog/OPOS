'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useOrderStore } from '@/lib/store';
import toast from 'react-hot-toast';

interface Settings {
  bikePrices: number[];
  carPrices: number[];
}

interface Product {
  _id: string;
  name: string;
  category: string;
  price: number;
  description: string;
  isActive: boolean;
}

export default function ServicePage() {
  const params = useParams();
  const router = useRouter();
  const { category, amount, vehicleNo, setCategory, setAmount, setVehicleNo } = useOrderStore();
  const [customAmount, setCustomAmount] = useState('');
  const [settings, setSettings] = useState<Settings | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedPrice, setSelectedPrice] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const type = params.type as string;

  useEffect(() => {
    if (type === 'bike' || type === 'car') {
      setCategory(type);
    }
    fetchSettings();
    fetchProducts();
  }, [type, setCategory]);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      if (!res.ok) throw new Error('Failed to fetch settings');
      const data = await res.json();
      if (data && typeof data === 'object' && data.bikePrices && data.carPrices) {
        setSettings(data);
      } else {
        console.error('Invalid settings data:', data);
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await fetch(`/api/products?category=${type}&active=true`);
      if (!res.ok) throw new Error('Failed to fetch products');
      const data = await res.json();
      if (Array.isArray(data)) {
        setProducts(data);
      } else {
        console.error('Invalid products data:', data);
        setProducts([]);
      }
    } catch (error) {
      console.error('Failed to fetch products:', error);
      setProducts([]);
    }
  };

  const prices = category === 'bike' ? settings?.bikePrices || [] : settings?.carPrices || [];

  const handlePriceSelect = (price: number) => {
    setSelectedPrice(price);
    setAmount(price);
    setCustomAmount('');
  };

  const handleCustomAmountChange = (value: string) => {
    setCustomAmount(value);
    setSelectedPrice(null);
    const num = parseFloat(value);
    if (!isNaN(num) && num > 0) {
      setAmount(num);
    } else {
      setAmount(0);
    }
  };

  const handleClear = () => {
    setSelectedPrice(null);
    setCustomAmount('');
    setAmount(0);
  };

  const handlePlaceOrder = async () => {
    if (!category || amount <= 0) {
      toast.error('Please select an amount');
      return;
    }

    setIsProcessing(true);

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category, amount, vehicleNo }),
      });

      if (res.ok) {
        const order = await res.json();
        toast.success(`Order #${order.tokenNumber} placed!`);
        router.push(`/receipt/${order._id}`);
      } else {
        const errorData = await res.json();
        console.error('Order error:', errorData);
        toast.error(errorData.error || 'Failed to place order');
      }
    } catch (error) {
      console.error('Network error:', error);
      toast.error('Connection error. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!category || !settings) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="spinner w-10 h-10"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Top Bar */}
      <div className="bg-white border-b border-slate-200 px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/')}
              className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
            >
              <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-xl font-bold text-slate-900 uppercase">SERVICE</h1>
          </div>
          <div className={`badge ${category === 'bike' ? 'badge-bike' : 'badge-car'}`}>
            {category}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto p-4">
        <div className="space-y-4">
          
          {/* Quick Selection */}
          <div className="card p-4">
            <h2 className="text-base font-bold text-slate-900 mb-3">Quick Selection</h2>
            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-3">
              {prices.map((price) => (
                <button
                  key={price}
                  onClick={() => handlePriceSelect(price)}
                  className={`price-card p-4 text-center ${selectedPrice === price ? 'selected' : ''}`}
                >
                  <span className="text-2xl font-black text-slate-900">{price}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Amount and Vehicle Number - Side by Side */}
          <div className="grid grid-cols-2 gap-4">
            <div className="card p-4">
              <h2 className="text-base font-bold text-slate-900 mb-3">Custom Amount</h2>
              <input
                type="number"
                value={customAmount}
                onChange={(e) => handleCustomAmountChange(e.target.value)}
                placeholder="Enter amount..."
                className="w-full px-4 py-3 text-xl font-bold rounded-lg"
              />
            </div>

            <div className="card p-4">
              <h2 className="text-base font-bold text-slate-900 mb-3">Vehicle Number</h2>
              <input
                type="text"
                value={vehicleNo}
                onChange={(e) => setVehicleNo(e.target.value)}
                placeholder="Enter vehicle number..."
                className="w-full px-4 py-3 text-lg font-medium rounded-lg"
              />
            </div>
          </div>

          {/* Order Summary */}
          <div className="summary-panel p-4">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
              <div className="lg:col-span-1">
                <h2 className="text-lg font-bold text-slate-900 mb-4">Order Summary</h2>
                
                {/* Selected Amount Display */}
                <div className="bg-slate-50 rounded-lg p-4 mb-4">
                  <div className="text-center">
                    <p className="text-sm text-slate-500 mb-1 uppercase tracking-wide font-medium">Total Amount</p>
                    <p className="text-4xl font-black text-slate-900">
                      {amount > 0 ? amount.toFixed(0) : '0'}
                    </p>
                    <p className="text-sm text-slate-500 mt-1">PKR</p>
                  </div>
                </div>

                {/* Service Type */}
                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="text-slate-500 text-sm font-medium">Service Type</span>
                  <span className="text-slate-900 font-bold uppercase text-sm">{category}</span>
                </div>

                {/* Status */}
                <div className="flex justify-between items-center py-2 mb-4">
                  <span className="text-slate-500 text-sm font-medium">Status</span>
                  <span className={`font-bold text-sm ${amount > 0 ? 'text-green-600' : 'text-slate-400'}`}>
                    {amount > 0 ? 'Ready' : 'Select Amount'}
                  </span>
                </div>
              </div>

              {/* Action Buttons - Moved to right */}
              <div className="lg:col-span-3 flex items-end justify-end">
                <div className="flex gap-3">
                  <button
                    onClick={handleClear}
                    className="btn-secondary px-6 py-3 text-sm"
                  >
                    Clear
                  </button>
                  <button
                    onClick={handlePlaceOrder}
                    disabled={amount <= 0 || isProcessing}
                    className="btn-primary px-8 py-3 text-base flex items-center justify-center gap-2"
                  >
                    {isProcessing ? (
                      <>
                        <div className="spinner w-5 h-5 border-2 border-white/30 border-t-white"></div>
                        Processing...
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        PLACE ORDER
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Products */}
          {products.length > 0 && (
            <div className="card p-4">
              <h2 className="text-base font-bold text-slate-900 mb-3">Services</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {products.map((product) => (
                  <button
                    key={product._id}
                    onClick={() => handlePriceSelect(product.price)}
                    className={`price-card p-3 text-left ${selectedPrice === product.price ? 'selected' : ''}`}
                  >
                    <h3 className="font-bold text-slate-900 mb-1 text-sm truncate">{product.name}</h3>
                    <p className="text-xl font-black text-slate-700">{product.price}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}