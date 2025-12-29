'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useOrderStore } from '@/lib/store';
import toast from 'react-hot-toast';
import Receipt from '@/components/Receipt';

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
  const { category, amount, setCategory, setAmount, reset } = useOrderStore();
  const [customAmount, setCustomAmount] = useState('');
  const [showReceipt, setShowReceipt] = useState(false);
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedPrice, setSelectedPrice] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const type = params.type as 'bike' | 'car';

  useEffect(() => {
    if (type === 'bike' || type === 'car') {
      setCategory(type);
    } else {
      router.push('/');
    }
    fetchSettings();
    fetchProducts();
  }, [type, setCategory, router]);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      const data = await res.json();
      setSettings(data);
    } catch (error) {
      toast.error('Failed to load settings');
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await fetch(`/api/products?category=${type}&active=true`);
      const data = await res.json();
      setProducts(data);
    } catch (error) {
      console.error('Failed to fetch products');
    }
  };

  const prices = settings ? (type === 'bike' ? settings.bikePrices : settings.carPrices) : [100, 150, 200];

  const handlePriceSelect = (price: number) => {
    setAmount(price);
    setSelectedPrice(price);
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

  const handlePlaceOrder = async () => {
    if (!category || amount <= 0) {
      toast.error('Please select a valid amount');
      return;
    }

    setIsProcessing(true);

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category, amount }),
      });

      if (res.ok) {
        const order = await res.json();
        setOrderDetails(order);
        setShowReceipt(true);
        toast.success('Order placed successfully');
        reset();
        setCustomAmount('');
        setSelectedPrice(null);
      } else {
        toast.error('Failed to place order');
      }
    } catch (error) {
      toast.error('Error placing order');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReceiptClose = () => {
    setShowReceipt(false);
    router.push('/');
  };

  if (!category || !settings) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-pulse flex items-center gap-3">
          <div className="w-3 h-3 bg-slate-400 rounded-full animate-bounce" />
          <div className="w-3 h-3 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
          <div className="w-3 h-3 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.push('/')}
            className="w-10 h-10 bg-white rounded-xl shadow-sm border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors"
          >
            <svg className="w-5 h-5 text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
          </button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 uppercase">{category} Service</h1>
            <p className="text-slate-500 text-sm">Select service amount</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Quick Select</h2>
              <div className="grid grid-cols-3 gap-3">
                {prices.map((price) => (
                  <button
                    key={price}
                    onClick={() => handlePriceSelect(price)}
                    className={`relative p-6 rounded-xl border-2 transition-all duration-200 ${
                      selectedPrice === price
                        ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-500/20'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <span className={`text-2xl md:text-3xl font-bold ${
                      selectedPrice === price ? 'text-blue-600' : 'text-slate-900'
                    }`}>
                      ${price}
                    </span>
                    {selectedPrice === price && (
                      <div className="absolute top-2 right-2 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {products.length > 0 && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Available Services</h2>
                <div className="space-y-2">
                  {products.map((product) => (
                    <button
                      key={product._id}
                      onClick={() => handlePriceSelect(product.price)}
                      className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                        selectedPrice === product.price
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="text-left">
                        <p className="font-medium text-slate-900">{product.name}</p>
                        {product.description && (
                          <p className="text-sm text-slate-500">{product.description}</p>
                        )}
                      </div>
                      <span className="text-xl font-bold text-slate-900">${product.price}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Custom Amount</h2>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-slate-400">$</span>
                <input
                  type="number"
                  value={customAmount}
                  onChange={(e) => handleCustomAmountChange(e.target.value)}
                  placeholder="0.00"
                  className="w-full pl-10 pr-4 py-4 text-2xl font-bold border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                />
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 sticky top-8">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Order Summary</h2>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-slate-600">
                  <span>Service Type</span>
                  <span className="font-medium text-slate-900 capitalize">{category}</span>
                </div>
                <div className="border-t border-dashed border-slate-200 pt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-slate-900">Total</span>
                    <span className="text-3xl font-bold text-slate-900">${amount.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={handlePlaceOrder}
                disabled={amount <= 0 || isProcessing}
                className={`w-full py-4 rounded-xl font-semibold text-white transition-all duration-200 flex items-center justify-center gap-2 ${
                  amount > 0 && !isProcessing
                    ? 'bg-slate-900 hover:bg-slate-800 active:scale-[0.98]'
                    : 'bg-slate-300 cursor-not-allowed'
                }`}
              >
                {isProcessing ? (
                  <>
                    <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Processing...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    Place Order
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {showReceipt && orderDetails && (
        <Receipt 
          order={orderDetails} 
          onClose={handleReceiptClose}
          onPrintComplete={handleReceiptClose}
        />
      )}
    </div>
  );
}