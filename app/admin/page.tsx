'use client';

import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import Link from 'next/link';
import jsPDF from 'jspdf';
import * as csvWriter from 'csv-writer';

interface Order {
  _id: string;
  tokenNumber?: number;
  category: string;
  amount: number;
  timestamp: string;
  vehicleNo?: string;
}

interface Settings {
  bikePrices: number[];
  carPrices: number[];
  currentTokenNumber: number;
}

interface Product {
  _id: string;
  name: string;
  category: string;
  price: number;
  description: string;
  isActive: boolean;
}

interface Notification {
  _id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

interface ReportData {
  totalRevenue: number;
  totalOrders: number;
  bikeRevenue: number;
  carRevenue: number;
  bikeOrders: number;
  carOrders: number;
  date?: string;
  period?: string;
  month?: string;
}

type TabType = 'overview' | 'products' | 'orders' | 'reports' | 'prices' | 'notifications' | 'settings';

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [dailyReport, setDailyReport] = useState<ReportData | null>(null);
  const [weeklyReport, setWeeklyReport] = useState<ReportData | null>(null);
  const [monthlyReport, setMonthlyReport] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [bikePrices, setBikePrices] = useState('');
  const [carPrices, setCarPrices] = useState('');
  const [resettingTokens, setResettingTokens] = useState(false);
  const [fixingTokens, setFixingTokens] = useState(false);
  
  // Product form state
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState({
    name: '',
    category: 'bike',
    price: '',
    description: '',
  });

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/login');
      return;
    }
    fetchData();
  }, [session, status, router]);

  const fetchData = async () => {
    await Promise.all([
      fetchOrders(),
      fetchSettings(),
      fetchProducts(),
      fetchNotifications(),
      fetchReports(),
    ]);
    setLoading(false);
  };

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/orders');
      if (!res.ok) throw new Error('Failed to fetch orders');
      const data = await res.json();
      if (Array.isArray(data)) {
        setOrders(data);
      } else {
        console.error('Invalid orders data:', data);
        setOrders([]);
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      setOrders([]);
    }
  };

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      if (!res.ok) throw new Error('Failed to fetch settings');
      const data = await res.json();
      if (data && typeof data === 'object' && data.bikePrices && data.carPrices) {
        setSettings(data);
        setBikePrices(data.bikePrices.join(', '));
        setCarPrices(data.carPrices.join(', '));
      } else {
        console.error('Invalid settings data:', data);
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    }
  };

  const handleTokenReset = async () => {
    if (!confirm('Are you sure you want to reset the token counter? This will start token numbering from 1 for new orders.')) {
      return;
    }

    setResettingTokens(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resetTokens: true }),
      });

      if (res.ok) {
        const updatedSettings = await res.json();
        setSettings(updatedSettings);
        toast.success('Token counter reset successfully');
      } else {
        toast.error('Failed to reset token counter');
      }
    } catch (error) {
      console.error('Error resetting tokens:', error);
      toast.error('Failed to reset token counter');
    } finally {
      setResettingTokens(false);
    }
  };

  const handleTokenFix = async () => {
    setFixingTokens(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fixTokens: true }),
      });

      if (res.ok) {
        const updatedSettings = await res.json();
        setSettings(updatedSettings);
        toast.success('Token counter fixed successfully');
      } else {
        toast.error('Failed to fix token counter');
      }
    } catch (error) {
      console.error('Error fixing tokens:', error);
      toast.error('Failed to fix token counter');
    } finally {
      setFixingTokens(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products');
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

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications');
      if (!res.ok) throw new Error('Failed to fetch notifications');
      const data = await res.json();
      if (Array.isArray(data)) {
        setNotifications(data);
      } else {
        console.error('Invalid notifications data:', data);
        setNotifications([]);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      setNotifications([]);
    }
  };

  const fetchReports = async () => {
    try {
      const [dailyRes, weeklyRes, monthlyRes] = await Promise.all([
        fetch('/api/reports/daily'),
        fetch('/api/reports/weekly'),
        fetch('/api/reports/monthly')
      ]);

      if (dailyRes.ok) {
        const dailyData = await dailyRes.json();
        setDailyReport(dailyData);
      }
      if (weeklyRes.ok) {
        const weeklyData = await weeklyRes.json();
        setWeeklyReport(weeklyData);
      }
      if (monthlyRes.ok) {
        const monthlyData = await monthlyRes.json();
        setMonthlyReport(monthlyData);
      }
    } catch (error) {
      console.error('Failed to fetch reports:', error);
    }
  };

  const downloadReport = async (type: 'daily' | 'weekly' | 'monthly', data: ReportData) => {
    try {
      // Generate PDF
      const doc = new jsPDF();
      
      doc.setFontSize(20);
      doc.text(`${type.charAt(0).toUpperCase() + type.slice(1)} Report`, 20, 30);
      
      doc.setFontSize(12);
      doc.text(`Period: ${data.date || data.period || data.month}`, 20, 50);
      
      doc.text(`Total Revenue: PKR ${data.totalRevenue.toFixed(2)}`, 20, 70);
      doc.text(`Total Orders: ${data.totalOrders}`, 20, 85);
      
      doc.text(`Bike Revenue: PKR ${data.bikeRevenue.toFixed(2)} (${data.bikeOrders} orders)`, 20, 105);
      doc.text(`Car Revenue: PKR ${data.carRevenue.toFixed(2)} (${data.carOrders} orders)`, 20, 120);
      
      doc.text(`Generated on: ${new Date().toLocaleString()}`, 20, 150);
      
      doc.save(`${type}-report-${Date.now()}.pdf`);
      
      toast.success('PDF downloaded successfully');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download report');
    }
  };

  const handleUpdateSettings = async () => {
    try {
      const bikePricesArray = bikePrices.split(',').map(p => parseFloat(p.trim())).filter(p => !isNaN(p));
      const carPricesArray = carPrices.split(',').map(p => parseFloat(p.trim())).filter(p => !isNaN(p));

      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bikePrices: bikePricesArray, carPrices: carPricesArray }),
      });

      if (res.ok) {
        toast.success('Settings updated successfully');
        fetchSettings();
      } else {
        toast.error('Failed to update settings');
      }
    } catch (error) {
      toast.error('Error updating settings');
    }
  };

  const handleSaveProduct = async () => {
    try {
      const method = editingProduct ? 'PUT' : 'POST';
      const url = editingProduct ? `/api/products/${editingProduct._id}` : '/api/products';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...productForm,
          price: parseFloat(productForm.price),
        }),
      });

      if (res.ok) {
        toast.success(editingProduct ? 'Product updated' : 'Product created');
        setShowProductForm(false);
        setEditingProduct(null);
        setProductForm({ name: '', category: 'bike', price: '', description: '' });
        fetchProducts();
      } else {
        toast.error('Failed to save product');
      }
    } catch (error) {
      toast.error('Error saving product');
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Product deleted');
        fetchProducts();
      } else {
        toast.error('Failed to delete product');
      }
    } catch (error) {
      toast.error('Error deleting product');
    }
  };

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push('/');
  };

  const markNotificationsRead = async () => {
    await fetch('/api/notifications', { method: 'PUT' });
    fetchNotifications();
  };

  // Analytics calculations
  const totalSales = orders.reduce((sum, order) => sum + order.amount, 0);
  const bikeOrders = orders.filter(o => o.category === 'bike');
  const carOrders = orders.filter(o => o.category === 'car');
  const bikeSales = bikeOrders.reduce((sum, o) => sum + o.amount, 0);
  const carSales = carOrders.reduce((sum, o) => sum + o.amount, 0);

  const dailySales = orders.reduce((acc, order) => {
    const date = new Date(order.timestamp).toLocaleDateString();
    acc[date] = (acc[date] || 0) + order.amount;
    return acc;
  }, {} as Record<string, number>);

  const chartData = Object.entries(dailySales)
    .slice(-7)
    .map(([date, amount]) => ({ date, amount }));

  const pieData = [
    { name: 'Bike', value: bikeSales, color: '#3b82f6' },
    { name: 'Car', value: carSales, color: '#10b981' },
  ];

  const unreadCount = notifications.filter(n => !n.isRead).length;

  if (status === 'loading' || loading) {
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

  if (!session) return null;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-slate-900 text-white p-6 hidden lg:block">
        <div className="mb-10">
          <h1 className="text-2xl font-bold tracking-tight">OPOS</h1>
          <p className="text-slate-400 text-sm">Admin Dashboard</p>
        </div>
        
        <nav className="space-y-2">
          {[
            { id: 'overview', label: 'Overview', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
            { id: 'products', label: 'Products', icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
            { id: 'orders', label: 'Orders', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
            { id: 'prices', label: 'Prices', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1' },
            { id: 'notifications', label: 'Notifications', icon: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9' },
            { id: 'settings', label: 'Settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as TabType)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                activeTab === item.id
                  ? 'bg-white/10 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
              </svg>
              {item.label}
              {item.id === 'notifications' && unreadCount > 0 && (
                <span className="ml-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">{unreadCount}</span>
              )}
            </button>
          ))}
        </nav>
        
        <div className="absolute bottom-6 left-6 right-6">
          <Link href="/" className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Back to POS
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:text-red-300 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="lg:hidden bg-slate-900 text-white p-4 sticky top-0 z-40">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">OPOS Admin</h1>
          <button onClick={handleLogout} className="text-red-400">Logout</button>
        </div>
        <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
          {['overview', 'products', 'orders', 'reports', 'prices', 'notifications', 'settings'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as TabType)}
              className={`px-4 py-2 rounded-lg whitespace-nowrap text-sm ${
                activeTab === tab ? 'bg-white text-slate-900' : 'bg-slate-800 text-slate-300'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </header>

      {/* Main Content */}
      <main className="lg:ml-64 p-4 md:p-8">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-900">Overview</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <p className="text-slate-500 text-sm mb-1">Total Sales</p>
                <p className="text-3xl font-bold text-slate-900">{totalSales.toFixed(2)}</p>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <p className="text-slate-500 text-sm mb-1">Total Orders</p>
                <p className="text-3xl font-bold text-slate-900">{orders.length}</p>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <p className="text-slate-500 text-sm mb-1">Bike Sales</p>
                <p className="text-3xl font-bold text-blue-600">{bikeSales.toFixed(2)}</p>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <p className="text-slate-500 text-sm mb-1">Car Sales</p>
                <p className="text-3xl font-bold text-emerald-600">{carSales.toFixed(2)}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Sales Trend (Last 7 Days)</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#64748b" />
                    <YAxis tick={{ fontSize: 12 }} stroke="#64748b" />
                    <Tooltip />
                    <Bar dataKey="amount" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Sales by Category</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex justify-center gap-6 mt-4">
                  {pieData.map((item) => (
                    <div key={item.name} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-sm text-slate-600">{item.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'products' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-slate-900">Products</h2>
              <button
                onClick={() => {
                  setEditingProduct(null);
                  setProductForm({ name: '', category: 'bike', price: '', description: '' });
                  setShowProductForm(true);
                }}
                className="bg-slate-900 text-white px-4 py-2 rounded-xl hover:bg-slate-800 transition-colors flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                Add Product
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map((product) => (
                <div key={product._id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-slate-900">{product.name}</h3>
                      <p className="text-sm text-slate-500 capitalize">{product.category}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs ${product.isActive ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                      {product.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-slate-900 mb-2">{product.price}</p>
                  {product.description && (
                    <p className="text-sm text-slate-500 mb-4">{product.description}</p>
                  )}
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditingProduct(product);
                        setProductForm({
                          name: product.name,
                          category: product.category,
                          price: product.price.toString(),
                          description: product.description,
                        });
                        setShowProductForm(true);
                      }}
                      className="flex-1 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(product._id)}
                      className="flex-1 py-2 border border-red-200 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {showProductForm && (
              <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-2xl p-6 max-w-md w-full">
                  <h3 className="text-xl font-bold mb-4">{editingProduct ? 'Edit Product' : 'Add Product'}</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                      <input
                        type="text"
                        value={productForm.name}
                        onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                        className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                      <select
                        value={productForm.category}
                        onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                        className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="bike">Bike</option>
                        <option value="car">Car</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Price</label>
                      <input
                        type="number"
                        value={productForm.price}
                        onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                        className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                      <textarea
                        value={productForm.description}
                        onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                        className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        rows={3}
                      />
                    </div>
                  </div>
                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={handleSaveProduct}
                      className="flex-1 bg-slate-900 text-white py-3 rounded-xl hover:bg-slate-800 transition-colors"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setShowProductForm(false)}
                      className="flex-1 bg-slate-100 text-slate-700 py-3 rounded-xl hover:bg-slate-200 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-900">Orders</h2>
            
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-slate-600">Token</th>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-slate-600">Order ID</th>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-slate-600">Category</th>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-slate-600">Amount</th>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-slate-600">Vehicle No</th>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-slate-600">Date</th>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-slate-600">Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order._id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                        <td className="py-4 px-6">
                          <span className="inline-flex items-center justify-center w-12 h-12 bg-slate-900 text-white font-bold rounded-lg">
                            {order.tokenNumber ? String(order.tokenNumber).padStart(3, '0') : '-'}
                          </span>
                        </td>
                        <td className="py-4 px-6 font-mono text-sm">#{order._id.slice(-8).toUpperCase()}</td>
                        <td className="py-4 px-6">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            order.category === 'bike' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'
                          }`}>
                            {order.category.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-4 px-6 font-semibold">{order.amount.toFixed(2)}</td>
                        <td className="py-4 px-6 text-slate-600">{order.vehicleNo || '-'}</td>
                        <td className="py-4 px-6 text-slate-600">{new Date(order.timestamp).toLocaleDateString()}</td>
                        <td className="py-4 px-6 text-slate-600">{new Date(order.timestamp).toLocaleTimeString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-slate-900">Notifications</h2>
              {unreadCount > 0 && (
                <button
                  onClick={markNotificationsRead}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  Mark all as read
                </button>
              )}
            </div>

            <div className="space-y-3">
              {notifications.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
                  <p className="text-slate-500">No notifications yet</p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification._id}
                    className={`bg-white rounded-2xl p-4 border ${notification.isRead ? 'border-slate-200' : 'border-blue-200 bg-blue-50/30'}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-2 h-2 rounded-full mt-2 ${
                        notification.type === 'success' ? 'bg-green-500' :
                        notification.type === 'warning' ? 'bg-yellow-500' :
                        notification.type === 'error' ? 'bg-red-500' : 'bg-blue-500'
                      }`} />
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-900">{notification.title}</h3>
                        <p className="text-slate-600 text-sm">{notification.message}</p>
                        <p className="text-slate-400 text-xs mt-1">{new Date(notification.createdAt).toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-slate-900">Reports</h2>
              <button
                onClick={fetchReports}
                className="bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh Reports
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Daily Report */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Daily Report</h3>
                {dailyReport ? (
                  <div className="space-y-3">
                    <div className="text-sm text-slate-500">{dailyReport.date}</div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-2xl font-bold text-slate-900">{dailyReport.totalRevenue.toFixed(2)}</p>
                        <p className="text-sm text-slate-500">Revenue</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-slate-900">{dailyReport.totalOrders}</p>
                        <p className="text-sm text-slate-500">Orders</p>
                      </div>
                    </div>
                    <div className="pt-3 border-t border-slate-100">
                      <div className="flex justify-between text-sm">
                        <span className="text-blue-600">Bike: {dailyReport.bikeRevenue.toFixed(2)} ({dailyReport.bikeOrders})</span>
                        <span className="text-emerald-600">Car: {dailyReport.carRevenue.toFixed(2)} ({dailyReport.carOrders})</span>
                      </div>
                    </div>
                    <button
                      onClick={() => downloadReport('daily', dailyReport)}
                      className="w-full mt-4 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Download PDF
                    </button>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="spinner w-6 h-6 mx-auto mb-2"></div>
                    <p className="text-slate-500">Loading...</p>
                  </div>
                )}
              </div>

              {/* Weekly Report */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Weekly Report</h3>
                {weeklyReport ? (
                  <div className="space-y-3">
                    <div className="text-sm text-slate-500">{weeklyReport.period}</div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-2xl font-bold text-slate-900">{weeklyReport.totalRevenue.toFixed(2)}</p>
                        <p className="text-sm text-slate-500">Revenue</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-slate-900">{weeklyReport.totalOrders}</p>
                        <p className="text-sm text-slate-500">Orders</p>
                      </div>
                    </div>
                    <div className="pt-3 border-t border-slate-100">
                      <div className="flex justify-between text-sm">
                        <span className="text-blue-600">Bike: {weeklyReport.bikeRevenue.toFixed(2)} ({weeklyReport.bikeOrders})</span>
                        <span className="text-emerald-600">Car: {weeklyReport.carRevenue.toFixed(2)} ({weeklyReport.carOrders})</span>
                      </div>
                    </div>
                    <button
                      onClick={() => downloadReport('weekly', weeklyReport)}
                      className="w-full mt-4 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Download PDF
                    </button>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="spinner w-6 h-6 mx-auto mb-2"></div>
                    <p className="text-slate-500">Loading...</p>
                  </div>
                )}
              </div>

              {/* Monthly Report */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Monthly Report</h3>
                {monthlyReport ? (
                  <div className="space-y-3">
                    <div className="text-sm text-slate-500">{monthlyReport.month}</div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-2xl font-bold text-slate-900">{monthlyReport.totalRevenue.toFixed(2)}</p>
                        <p className="text-sm text-slate-500">Revenue</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-slate-900">{monthlyReport.totalOrders}</p>
                        <p className="text-sm text-slate-500">Orders</p>
                      </div>
                    </div>
                    <div className="pt-3 border-t border-slate-100">
                      <div className="flex justify-between text-sm">
                        <span className="text-blue-600">Bike: {monthlyReport.bikeRevenue.toFixed(2)} ({monthlyReport.bikeOrders})</span>
                        <span className="text-emerald-600">Car: {monthlyReport.carRevenue.toFixed(2)} ({monthlyReport.carOrders})</span>
                      </div>
                    </div>
                    <button
                      onClick={() => downloadReport('monthly', monthlyReport)}
                      className="w-full mt-4 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Download PDF
                    </button>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="spinner w-6 h-6 mx-auto mb-2"></div>
                    <p className="text-slate-500">Loading...</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'prices' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-900">Price Management</h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Bike Prices */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-slate-900">Bike Service Prices</h3>
                  <button
                    onClick={() => {
                      const pricesArray = bikePrices.split(',').map(p => parseFloat(p.trim()) || 0);
                      pricesArray.push(0);
                      setBikePrices(pricesArray.join(', '));
                    }}
                    className="bg-slate-900 text-white px-3 py-1 rounded-lg text-sm hover:bg-slate-800 transition-colors flex items-center gap-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                    </svg>
                    Add
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {bikePrices.split(',').map((price, index) => {
                    const numPrice = parseFloat(price.trim()) || 0;
                    return (
                      <div key={index} className="relative">
                        <div className="p-6 rounded-xl border-2 border-slate-200 bg-white">
                          <input
                            type="number"
                            value={numPrice}
                            onChange={(e) => {
                              const pricesArray = bikePrices.split(',').map(p => parseFloat(p.trim()) || 0);
                              pricesArray[index] = parseFloat(e.target.value) || 0;
                              setBikePrices(pricesArray.join(', '));
                            }}
                            className="w-full text-center text-2xl md:text-3xl font-bold text-slate-900 bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                          />
                        </div>
                        {bikePrices.split(',').length > 1 && (
                          <button
                            onClick={() => {
                              const pricesArray = bikePrices.split(',').map(p => parseFloat(p.trim()) || 0);
                              pricesArray.splice(index, 1);
                              setBikePrices(pricesArray.join(', '));
                            }}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                          >
                            ×
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Car Prices */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-slate-900">Car Service Prices</h3>
                  <button
                    onClick={() => {
                      const pricesArray = carPrices.split(',').map(p => parseFloat(p.trim()) || 0);
                      pricesArray.push(0);
                      setCarPrices(pricesArray.join(', '));
                    }}
                    className="bg-slate-900 text-white px-3 py-1 rounded-lg text-sm hover:bg-slate-800 transition-colors flex items-center gap-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                    </svg>
                    Add
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {carPrices.split(',').map((price, index) => {
                    const numPrice = parseFloat(price.trim()) || 0;
                    return (
                      <div key={index} className="relative">
                        <div className="p-6 rounded-xl border-2 border-slate-200 bg-white">
                          <input
                            type="number"
                            value={numPrice}
                            onChange={(e) => {
                              const pricesArray = carPrices.split(',').map(p => parseFloat(p.trim()) || 0);
                              pricesArray[index] = parseFloat(e.target.value) || 0;
                              setCarPrices(pricesArray.join(', '));
                            }}
                            className="w-full text-center text-2xl md:text-3xl font-bold text-slate-900 bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                          />
                        </div>
                        {carPrices.split(',').length > 1 && (
                          <button
                            onClick={() => {
                              const pricesArray = carPrices.split(',').map(p => parseFloat(p.trim()) || 0);
                              pricesArray.splice(index, 1);
                              setCarPrices(pricesArray.join(', '));
                            }}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                          >
                            ×
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
              <button
                onClick={handleUpdateSettings}
                className="w-full bg-slate-900 text-white px-6 py-3 rounded-xl hover:bg-slate-800 transition-colors"
              >
                Save Price Changes
              </button>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-900">Settings</h2>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Token Management</h3>
              <p className="text-slate-500 text-sm mb-6">Manage order token numbering system</p>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-slate-900">Current Token Number</h4>
                    <p className="text-sm text-slate-500">Next order will receive token #{settings?.currentTokenNumber ? settings.currentTokenNumber + 1 : 1}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-blue-600">#{settings?.currentTokenNumber || 0}</span>
                    <button
                      onClick={fetchSettings}
                      className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                      title="Refresh settings"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    </button>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-4 border border-red-200 bg-red-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-red-900">Reset Token Counter</h4>
                    <p className="text-sm text-red-600">This will reset the token counter to 0. Next order will start from token #1.</p>
                  </div>
                  <button
                    onClick={handleTokenReset}
                    disabled={resettingTokens}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                  >
                    {resettingTokens ? 'Resetting...' : 'Reset Tokens'}
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 border border-blue-200 bg-blue-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-blue-900">Fix Token Counter</h4>
                    <p className="text-sm text-blue-600">If token counter is broken or showing wrong values, this will fix it.</p>
                  </div>
                  <button
                    onClick={handleTokenFix}
                    disabled={fixingTokens}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                  >
                    {fixingTokens ? 'Fixing...' : 'Fix Tokens'}
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">System Configuration</h3>
              <p className="text-slate-500 text-sm mb-6">Additional system settings and configurations</p>
              
              <div className="text-sm text-slate-500">
                Settings panel - Additional configurations can be added here
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}