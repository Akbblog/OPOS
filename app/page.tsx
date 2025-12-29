import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4 md:p-8">
      <div className="max-w-5xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold text-slate-900 tracking-tight mb-3">OPOS</h1>
          <p className="text-slate-500 text-lg">Point of Sale System</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <Link href="/service/bike" className="group">
            <div className="relative bg-white rounded-2xl p-8 md:p-12 shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-200 hover:border-blue-500 overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-blue-100 transition-colors" />
              <div className="relative">
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-500 transition-colors">
                  <svg className="w-8 h-8 text-blue-600 group-hover:text-white transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="5" cy="17" r="3" />
                    <circle cx="19" cy="17" r="3" />
                    <path d="M12 17V5l-4 4" />
                    <path d="M5 17l7-5 7 5" />
                  </svg>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">BIKE</h2>
                <p className="text-slate-500">Bicycle repairs and maintenance services</p>
              </div>
            </div>
          </Link>
          
          <Link href="/service/car" className="group">
            <div className="relative bg-white rounded-2xl p-8 md:p-12 shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-200 hover:border-emerald-500 overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-emerald-100 transition-colors" />
              <div className="relative">
                <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-emerald-500 transition-colors">
                  <svg className="w-8 h-8 text-emerald-600 group-hover:text-white transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 16H9m10 0h3v-3.15a1 1 0 0 0-.84-.99L16 11l-2.7-3.6a1 1 0 0 0-.8-.4H5.24a2 2 0 0 0-1.8 1.1l-.8 1.63A6 6 0 0 0 2 12.42V16h2" />
                    <circle cx="6.5" cy="16.5" r="2.5" />
                    <circle cx="16.5" cy="16.5" r="2.5" />
                  </svg>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">CAR</h2>
                <p className="text-slate-500">Automobile repairs and maintenance services</p>
              </div>
            </div>
          </Link>
        </div>
        
        <div className="flex justify-center">
          <Link 
            href="/login" 
            className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors text-sm font-medium"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
              <polyline points="10 17 15 12 10 7" />
              <line x1="15" y1="12" x2="3" y2="12" />
            </svg>
            Admin Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
