'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { CheckCircle2, ShieldCheck, CreditCard, Loader2 } from 'lucide-react';
import axios from 'axios';

import { Button } from '@/components/ui/button';
import Loading from '@/components/Loading';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { getAxiosErrorMessage } from '@/lib/errors';

function VendorPaymentContent() {
  const { data: session, update: updateSession } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [statusLoading, setStatusLoading] = useState(true);
  const [vendorStatus, setVendorStatus] = useState({
    isVerified: false,
    isActive: false,
    priority: 5,
    subscriptionStatus: 'INACTIVE',
  });

  useEffect(() => {
    const checkPaymentAndStatus = async () => {
      try {
        const sessionId = searchParams.get('session_id');
        if (sessionId) {
          try {
            await axios.post('/api/vendor/verify-payment', { sessionId });
            toast.success('Payment verified successfully!');
            await updateSession({ isActive: true });

            // Clean up URL
            const url = new URL(window.location.href);
            url.searchParams.delete('session_id');
            url.searchParams.delete('success');
            url.searchParams.delete('vip_success');
            window.history.replaceState({}, '', url);
          } catch (e) {
            console.error('Payment verification failed', e);
          }
        }

        const res = await axios.get('/api/vendor/status');
        console.log('Vendor status response:', res.data); // Debug log
        setVendorStatus({
          isVerified: res.data.isVerified,
          isActive: res.data.isActive,
          priority: res.data.priority,
          subscriptionStatus: res.data.subscriptionStatus,
        });
      } catch (error) {
        console.error('Failed to fetch vendor status', error);
      } finally {
        setStatusLoading(false);
      }
    };
    checkPaymentAndStatus();
  }, [searchParams, updateSession]);

  const handlePayment = async () => {
    try {
      setLoading(true);
      const res = await axios.post('/api/vendor/payment');
      if (res.status === 200 && res.data.url) {
        window.location.href = res.data.url;
      }
    } catch (error: unknown) {
      toast.error(getAxiosErrorMessage(error, 'Payment initialisation failed. Please try again.'));
      setLoading(false);
    }
  };

  const handleVIPCheckout = async () => {
    try {
      setLoading(true);
      const res = await axios.post('/api/vendor/vip-checkout');
      if (res.data.url) {
        window.location.href = res.data.url;
      }
    } catch (error) {
      console.error('VIP Checkout Error:', error);
      toast.error('Failed to initiate VIP checkout');
      setLoading(false);
    }
  };

  if (statusLoading) {
    return <Loading />;
  }

  const { isVerified, isActive, priority, subscriptionStatus } = vendorStatus;

  // VIP Payment Date Logic
  const today = new Date();
  const currentDay = today.getDate();
  const isFirstWeek = currentDay <= 7;

  const dynamicPrices: Record<number, number> = {
    1: 1000,
    2: 1500,
    3: 2000,
    4: 2500,
    5: 3000,
  };
  const dynamicPrice = dynamicPrices[priority || 1] || 1000;

  if (isActive) {
    return (
      <div className="flex justify-center items-center min-h-[80vh] p-4">
        <div className="grid md:grid-cols-2 gap-6 items-start max-w-4xl w-full">
          {/* Active Account Status */}
          <Card className="text-center w-full shadow-lg">
            <CardHeader>
              <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <CardTitle className="text-2xl">Account Active</CardTitle>
              <CardDescription>
                Your registration payment has been received and your account is active.
              </CardDescription>
            </CardHeader>
            <CardFooter className="justify-center">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => router.push(`/vendor/${session?.user?.vendorId}/dashboard`)}
              >
                Go to Dashboard
              </Button>
            </CardFooter>
          </Card>

          {/* VIP Subscription CTA */}
          <Card className="border-2 border-primary/20 shadow-xl overflow-hidden relative w-full">
            <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-3 py-1 text-xs font-bold rounded-bl-lg">
              Priority Tier
            </div>
            <CardHeader className="text-center pb-6 border-b bg-muted/30 pt-8">
              <div className="mx-auto bg-primary/10 p-3 rounded-full w-16 h-16 flex items-center justify-center mb-4 shadow-sm">
                <ShieldCheck className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-2xl font-bold">VIP Subscription</CardTitle>
              <div className="flex items-center justify-center mt-2 gap-4">
                <div className="flex flex-col">
                  <span className="text-sm text-muted-foreground">Current Level</span>
                  <span className="text-3xl font-extrabold text-primary">Level {priority}</span>
                </div>
              </div>
            </CardHeader>

            <CardContent className="pt-6 space-y-4">
              <div className="flex justify-between items-center py-3 text-sm border-b border-border mb-2">
                <span className="text-muted-foreground font-medium">Subscription Status</span>
                <span
                  className={`font-extrabold px-3 py-1 rounded-full ${
                    subscriptionStatus === 'ACTIVE'
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-500'
                      : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-500'
                  }`}
                >
                  {subscriptionStatus || 'INACTIVE'}
                </span>
              </div>

              {/* Dynamic Notification Logic */}
              {subscriptionStatus !== 'ACTIVE' && (
                <>
                  {isFirstWeek ? (
                    <div className="bg-blue-50 text-blue-900 border-l-4 border-blue-500 p-4 rounded-r-lg text-sm shadow-sm">
                      <strong className="block mb-1 text-blue-700">Reminder:</strong>
                      Please complete your VIP payment for this month before the 7th to maintain
                      your Level {priority} priority tier.
                    </div>
                  ) : (
                    <div className="bg-red-50 text-red-900 border-l-4 border-red-500 p-4 rounded-r-lg text-sm shadow-sm">
                      <strong className="block mb-1 text-red-700">Warning:</strong>
                      The VIP payment deadline for this month is over. Your priority credits may be
                      reduced! You can subscribe again next month in the first week.
                    </div>
                  )}
                </>
              )}

              {subscriptionStatus === 'ACTIVE' && (
                <div className="bg-green-50 text-green-900 border-l-4 border-green-500 p-4 rounded-r-lg text-sm shadow-sm text-center">
                  You are fully upgraded and receiving maximum visibility across the platform for
                  this month!
                </div>
              )}

              <div className="bg-orange-50 text-orange-950 p-4 rounded-xl flex justify-between items-center border border-orange-200 mt-4">
                <span className="font-bold text-base">Monthly Fee</span>
                <span className="text-2xl font-extrabold text-orange-600">
                  ₹{dynamicPrice.toLocaleString()}
                </span>
              </div>
            </CardContent>

            <CardFooter className="pb-6 px-6">
              {subscriptionStatus === 'ACTIVE' ? (
                <Button className="w-full text-base h-12" disabled variant="secondary">
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  VIP Active
                </Button>
              ) : (
                <Button
                  className="w-full text-base h-12 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white disabled:opacity-50"
                  onClick={handleVIPCheckout}
                  disabled={loading || !isFirstWeek}
                  title={
                    !isFirstWeek
                      ? 'VIP Payments are only allowed in the first week of the month'
                      : 'Upgrade to VIP'
                  }
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Processing...
                    </span>
                  ) : isFirstWeek ? (
                    'Upgrade to VIP'
                  ) : (
                    'Deadline Passed'
                  )}
                </Button>
              )}
            </CardFooter>
          </Card>
        </div>
      </div>
    );
  }

  if (!isVerified) {
    return (
      <div className="flex justify-center items-center min-h-[80vh]">
        <Card className="max-w-md w-full text-center">
          <CardHeader>
            <ShieldCheck className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <CardTitle className="text-2xl">Verification Pending</CardTitle>
            <CardDescription>
              Your account must be verified by an admin before you can make the initial payment.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto h-[80vh] flex flex-col justify-center p-4">
      <div className="grid md:grid-cols-2 gap-6 items-center">
        {/* Benefits Section */}
        <Card className="border-none shadow-none bg-transparent">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold tracking-tight text-primary mb-2">
              Activate Your Vendor Account
            </h1>
            <p className="text-base text-muted-foreground max-w-2xl mx-auto">
              Join AutoCarBazaar as a verified vendor and start selling to thousands of potential
              buyers. Complete the one-time registration payment to unlock your dashboard.
            </p>
          </div>
          <CardHeader className="pb-4">
            <CardTitle className="text-xl">What you get</CardTitle>
            <CardDescription>Everything you need to grow your car business.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              'Unlimited car listings',
              'Advanced vendor dashboard & analytics',
              'Direct communication with buyers',
              'Priority placement in search results',
              'Verified vendor badge',
              'Dedicated 24/7 support',
            ].map((benefit, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="bg-primary/10 rounded-full p-1">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                </div>
                <span className="font-medium text-sm">{benefit}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Payment Card */}
        <Card className="border-2 border-primary/20 shadow-xl overflow-hidden relative">
          <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-3 py-1 text-xs font-bold rounded-bl-lg">
            One-time Fee
          </div>
          <CardHeader className="text-center pb-6 border-b bg-muted/30 pt-8">
            <div className="mx-auto bg-primary/10 p-3 rounded-full w-16 h-16 flex items-center justify-center mb-4 shadow-sm">
              <CreditCard className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold">Registration Fee</CardTitle>
            <div className="flex items-center justify-center mt-2">
              <span className="text-4xl font-extrabold text-primary">₹1,000</span>
            </div>
          </CardHeader>

          <CardContent className="pt-4 space-y-3">
            <div className="flex justify-between items-center py-1 text-sm text-muted-foreground">
              <span>Registration Fee</span>
              <span className="font-medium text-foreground">₹1000.00</span>
            </div>
            <div className="flex justify-between items-center py-1 text-sm text-muted-foreground">
              <span>Taxes (Included)</span>
              <span className="font-medium text-foreground">₹0.00</span>
            </div>
            <div className="flex justify-between items-center py-3 border-t border-b">
              <span className="font-bold text-base">Total Amount</span>
              <span className="text-xl font-bold text-primary">₹1,000</span>
            </div>

            <div className="bg-green-500/10 p-3 rounded-lg flex items-start gap-2 mt-3 border border-green-500/20">
              <ShieldCheck className="w-5 h-5 text-green-600 shrink-0" />
              <div className="text-xs text-green-800 dark:text-green-400">
                Secure 256-bit SSL encrypted payment. Your activation is instant after successful
                payment.
              </div>
            </div>
          </CardContent>

          <CardFooter className="pb-6 pt-2 px-6">
            <Button
              className="w-full text-base h-12 shadow-lg hover:shadow-xl transition-all duration-300"
              onClick={handlePayment}
              disabled={loading}
              size="lg"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Processing...
                </span>
              ) : (
                <span className="flex items-center gap-2">Pay ₹1,000 Now</span>
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

export default function VendorPaymentPage() {
  return (
    <Suspense fallback={<Loading />}>
      <VendorPaymentContent />
    </Suspense>
  );
}
