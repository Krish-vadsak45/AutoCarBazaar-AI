'use client';

import { usePathname } from 'next/navigation';
import { ToastContainer } from 'react-toastify';

import '@/src/app/globals.css';
import 'react-toastify/dist/ReactToastify.css';

import { CompareBanner } from '@/components/CompareBanner';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import ThemeProvider from '@/components/ThemeProvider';

import AuthProvider from './providers';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();

  const isAdminTab = pathname.includes('/admin') || pathname.includes('/vendor');
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        <AuthProvider>
          <ThemeProvider>
            {!isAdminTab && <Header />}
            {children}
            <ToastContainer
              position="top-right"
              autoClose={3000}
              hideProgressBar={false}
              newestOnTop={false}
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
              theme="dark"
            />
            {!isAdminTab && <CompareBanner />}
            {!isAdminTab && <Footer />}
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
