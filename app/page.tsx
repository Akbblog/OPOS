'use client';

import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-100 p-6 md:p-12" suppressHydrationWarning={true}>
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-7xl font-black text-slate-900 mb-4 tracking-tight">
            Service Center
          </h1>
          <p className="text-xl md:text-2xl text-slate-500 font-medium">
            Select your service type to continue
          </p>
        </div>

        {/* Service Selection Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-16">
          {/* Bike Service */}
          <Link href="/service/bike" className="group">
            <div className="card p-10 md:p-14 text-center hover:border-slate-300 transition-all duration-300 hover:-translate-y-1">
              
              <h2 className="text-4xl font-bold text-slate-900 mb-3">BIKE</h2>
              <p className="text-lg text-slate-500">Motorcycle services</p>
            </div>
          </Link>

          {/* Car Service */}
          <Link href="/service/car" className="group">
            <div className="card p-10 md:p-14 text-center hover:border-slate-300 transition-all duration-300 hover:-translate-y-1">
              
              <h2 className="text-4xl font-bold text-slate-900 mb-3">CAR</h2>
              <p className="text-lg text-slate-500">Automobile services</p>
            </div>
          </Link>
        </div>

        {/* Admin Link */}
        <div className="text-center">
          <Link 
            href="/login" 
            className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-600 transition-colors text-sm font-medium"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4M10 17l5-5-5-5M15 12H3" />
            </svg>
            Admin Access
          </Link>
        </div>
      </div>
    </div>
  );
}
