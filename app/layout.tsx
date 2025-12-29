import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from 'react-hot-toast';
import { SessionProvider } from '@/components/SessionProvider';
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Service Center - Your Trusted Partner",
  description: "Professional vehicle maintenance and repair services",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen`}
        suppressHydrationWarning={true}
      >
        <SessionProvider>
          {children}
          <Toaster 
            position="top-right" 
            toastOptions={{
              className: 'glass-card font-bold text-slate-800',
              style: {
                background: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(15px)',
                border: '1px solid rgba(255, 255, 255, 0.25)',
                color: '#1e293b',
                fontWeight: '600'
              }
            }} 
          />
        </SessionProvider>
      </body>
    </html>
  );
}
