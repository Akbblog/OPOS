'use client';

import { useRef, useState, useCallback } from 'react';
import toast from 'react-hot-toast';

interface ReceiptData {
  _id: string;
  tokenNumber?: number;
  category: string;
  amount: number;
  timestamp: string;
  items?: { name: string; price: number }[];
}

interface ReceiptProps {
  order: ReceiptData;
  onClose: () => void;
  onPrintComplete?: () => void;
}

export function generateReceiptHTML(order: ReceiptData): string {
  const styles = `
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { 
        font-family: 'Courier New', monospace; 
        width: 80mm; 
        padding: 5mm;
        font-size: 12px;
        line-height: 1.4;
      }
      .receipt-header { text-align: center; border-bottom: 1px dashed #000; padding-bottom: 10px; margin-bottom: 10px; }
      .receipt-header h1 { font-size: 20px; font-weight: bold; margin-bottom: 5px; }
      .receipt-header p { font-size: 10px; color: #666; }
      .token-number { text-align: center; font-size: 32px; font-weight: bold; margin: 15px 0; padding: 10px; border: 2px solid #000; }
      .token-label { text-align: center; font-size: 14px; font-weight: bold; margin-bottom: 5px; }
      .receipt-body { margin-bottom: 10px; }
      .receipt-row { display: flex; justify-content: space-between; padding: 3px 0; }
      .receipt-row.total { border-top: 1px dashed #000; margin-top: 10px; padding-top: 10px; font-weight: bold; font-size: 14px; }
      .receipt-footer { text-align: center; border-top: 1px dashed #000; padding-top: 10px; margin-top: 10px; }
      .receipt-footer p { font-size: 10px; color: #666; }
      .service-type { text-align: center; font-size: 16px; font-weight: bold; text-transform: uppercase; margin: 10px 0; padding: 8px; background: #f0f0f0; }
      @media print { body { width: 80mm; } }
    </style>
  `;

  const tokenDisplay = order.tokenNumber ? String(order.tokenNumber).padStart(3, '0') : order._id.slice(-6).toUpperCase();

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Receipt - Token #${tokenDisplay}</title>
        ${styles}
      </head>
      <body>
        <div class="receipt-header">
          <h1>OPOS</h1>
          <p>Point of Sale System</p>
        </div>
        <div class="token-label">TOKEN NUMBER</div>
        <div class="token-number">${tokenDisplay}</div>
        <div class="service-type">${order.category.toUpperCase()} SERVICE</div>
        <div class="receipt-body">
          <div class="receipt-row">
            <span>Receipt ID:</span>
            <span>#${order._id.slice(-8).toUpperCase()}</span>
          </div>
          <div class="receipt-row">
            <span>Date:</span>
            <span>${new Date(order.timestamp).toLocaleDateString()}</span>
          </div>
          <div class="receipt-row">
            <span>Time:</span>
            <span>${new Date(order.timestamp).toLocaleTimeString()}</span>
          </div>
          <div class="receipt-row">
            <span>Service:</span>
            <span>${order.category.charAt(0).toUpperCase() + order.category.slice(1)} Service</span>
          </div>
          <div class="receipt-row total">
            <span>TOTAL:</span>
            <span>{order.amount.toFixed(2)}</span>
          </div>
        </div>
        <div class="receipt-footer">
          <p>Thank you for your business!</p>
          <p>Visit again soon</p>
        </div>
      </body>
    </html>
  `;
}

export default function Receipt({ order, onClose, onPrintComplete }: ReceiptProps) {
  console.log('Receipt component called with props:', { order, onClose: !!onClose, onPrintComplete: !!onPrintComplete });
  
  console.log('Receipt component rendering started');
  const receiptRef = useRef<HTMLDivElement>(null);
  const [email, setEmail] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);

  console.log('Receipt component state initialized');

    const handlePrint = useCallback(() => {
      console.log('handlePrint called');
      const printWindow = window.open('', '_blank', 'width=300,height=600');
      if (!printWindow) {
        console.log('Print window failed to open, using window.print');
        window.print();
        return;
      }

      const htmlContent = generateReceiptHTML(order);
      console.log('Generated HTML content length:', htmlContent.length);

      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.focus();
      
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
        onPrintComplete?.();
      }, 250);
    }, [order, onPrintComplete]);

  console.log('Receipt component about to return JSX');

  const handleSendEmail = async () => {
    if (!email) {
      toast.error('Please enter an email address');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    setSendingEmail(true);
    try {
      const res = await fetch('/api/send-receipt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, order }),
      });

      const data = await res.json();
      
      if (res.ok) {
        toast.success(`Receipt sent to ${email}`);
        setEmail('');
      } else {
        toast.error(data.error || 'Failed to send email');
      }
    } catch (error) {
      toast.error('Error sending email');
    } finally {
      setSendingEmail(false);
    }
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', zIndex: 10000 }}>
        <div style={{ backgroundColor: 'white', border: '2px solid red', borderRadius: '1rem', maxWidth: '40rem', width: '100%', maxHeight: '80vh', overflow: 'auto' }}>
        <div ref={receiptRef} style={{ padding: '2rem' }}>
          <div className="text-center border-b border-gray-200 pb-4 mb-4">
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">OPOS</h1>
            <p className="text-xs text-gray-500 mt-1">Point of Sale System</p>
          </div>
          
          {/* Token Number Display */}
          <div className="text-center mb-4">
            <p className="text-sm font-medium text-gray-600 mb-1">TOKEN NUMBER</p>
            <div className="inline-block bg-slate-900 text-white text-4xl font-bold px-8 py-4 rounded-xl">
              {order.tokenNumber ? String(order.tokenNumber).padStart(3, '0') : order._id.slice(-6).toUpperCase()}
            </div>
          </div>
          
          <div className="bg-gray-100 rounded-lg py-3 px-4 text-center mb-4">
            <span className="text-lg font-bold text-gray-800 uppercase tracking-wide">
              {order.category} Service
            </span>
          </div>
          
          <div className="space-y-2 text-sm mb-4">
            <div className="flex justify-between py-1">
              <span className="text-gray-600">Receipt ID:</span>
              <span className="font-mono font-medium">#{order._id.slice(-8).toUpperCase()}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-gray-600">Date:</span>
              <span className="font-medium">{new Date(order.timestamp).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-gray-600">Time:</span>
              <span className="font-medium">{new Date(order.timestamp).toLocaleTimeString()}</span>
            </div>
          </div>
          
          <div className="border-t border-dashed border-gray-300 pt-4 mt-4">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold text-gray-900">Total Amount</span>
              <span className="text-2xl font-bold text-gray-900">{order.amount.toFixed(2)}</span>
            </div>
          </div>
          
          <div className="text-center mt-6 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">Thank you for your business!</p>
            <p className="text-xs text-gray-400 mt-1">Visit again soon</p>
          </div>
        </div>
        
        {/* Email Section */}
        <div className="px-6 pb-4">
          <div className="flex gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email for receipt"
              className="flex-1 px-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-slate-500 focus:border-transparent"
            />
            <button
              onClick={handleSendEmail}
              disabled={sendingEmail}
              className="bg-blue-600 text-white px-4 py-2 rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {sendingEmail ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
              )}
              Send
            </button>
          </div>
        </div>
        
        <div className="bg-gray-50 px-6 py-4 flex gap-3">
          <button
            onClick={handlePrint}
            className="flex-1 bg-gray-900 text-white py-3 px-4 rounded-xl font-medium hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 9V2h12v7" />
              <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
              <rect x="6" y="14" width="12" height="8" />
            </svg>
            Print Receipt
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-gray-200 text-gray-700 py-3 px-4 rounded-xl font-medium hover:bg-gray-300 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
