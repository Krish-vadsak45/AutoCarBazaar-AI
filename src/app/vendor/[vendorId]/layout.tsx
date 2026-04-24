'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';

import ThemeToggle from '@/components/ThemeToggle';
import { AdminSidebar } from '@/components/admin-sidebar';
import Loading from '@/components/Loading';

export default function VendorLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, status } = useSession();

  const isVerified = session?.user?.isVerified;
  const isActive = session?.user?.isActive;

  const isPaymentPage = pathname.includes('/payment');

  useEffect(() => {
    if (status === 'loading') {
      return;
    }

    if (session?.user && session.user.role === 'vendor') {
      if (!isVerified) {
        toast.error('Your application is under process, reach out to admin to make it faster');
      } else if (isVerified && !isActive) {
        toast.error('Please make initial payment to move forward');
        if (!isPaymentPage) {
          router.push(`/vendor/${session.user.vendorId}/payment`);
        }
      }
    }
  }, [pathname, isVerified, isActive, status, session, isPaymentPage, router]);

  if (status === 'loading') {
    return <Loading />;
  }

  let content = children;

  if (session?.user && session.user.role === 'vendor') {
    if (!isVerified) {
      content = (
        <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-4">
          <h2 className="text-2xl font-bold text-destructive">Application Pending</h2>
          <p className="text-muted-foreground">
            Your application is under process. Please reach out to the admin to make it faster.
          </p>
        </div>
      );
    } else if (isVerified && !isActive && !isPaymentPage) {
      content = (
        <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-4">
          <h2 className="text-2xl font-bold text-destructive">Payment Required</h2>
          <p className="text-muted-foreground">Please make the initial payment to move forward.</p>
        </div>
      );
    }
  }

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />

      <main className="md:ml-64 flex-1 min-w-0 flex flex-col">
        {/* Header */}
        <header className="sticky top-0 z-30 border-b border-border bg-card">
          <div className="flex items-center justify-between px-8 py-4 max-md:pr-4 max-md:pl-14">
            <h2 className="text-xl font-semibold text-foreground">Vendor Panel</h2>
            <div className="flex items-center gap-4">
              <ThemeToggle />
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-8 max-md:p-4">{content}</div>
      </main>
    </div>
  );
}
