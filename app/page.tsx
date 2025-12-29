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
              <div className="w-24 h-24 mx-auto mb-8 bg-blue-50 rounded-2xl flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                <svg className="w-14 h-14 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="5.5" cy="17.5" r="3.5" />
                  <circle cx="18.5" cy="17.5" r="3.5" />
                  <path d="M15 6h-1.5l-3 5.5H7l-1.5 2.5" />
                  <path d="M12 17.5l3-6h3l1.5 6" />
                </svg>
              </div>
              <h2 className="text-4xl font-bold text-slate-900 mb-3">BIKE</h2>
              <p className="text-lg text-slate-500">Motorcycle services</p>
            </div>
          </Link>

          {/* Car Service */}
          <Link href="/service/car" className="group">
            <div className="card p-10 md:p-14 text-center hover:border-slate-300 transition-all duration-300 hover:-translate-y-1">
              <div className="w-24 h-24 mx-auto mb-8 bg-emerald-50 rounded-2xl flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
                <svg className="w-14 h-14 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M7 17a2 2 0 100-4 2 2 0 000 4zM17 17a2 2 0 100-4 2 2 0 000 4z" />
                  <path d="M5 17H3v-4.5a.5.5 0 01.5-.5h1l1.5-3.5a1 1 0 01.9-.5h10.2a1 1 0 01.9.5l1.5 3.5h1a.5.5 0 01.5.5V17h-2" />
                  <path d="M9 17h6" />
                </svg>
              </div>
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
