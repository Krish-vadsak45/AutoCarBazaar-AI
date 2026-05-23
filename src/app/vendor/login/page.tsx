'use client';

import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import axios from 'axios';
import * as z from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import {
  ShieldCheck,
  Mail,
  Lock,
  UserCog,
  Loader2,
  AlertCircle,
  Eye,
  EyeOff,
  Building2,
  FileBadge,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react';
import { useSession, signIn } from 'next-auth/react';

import { cn } from '@/lib/utils';
import { getAxiosErrorMessage, getErrorMessage } from '@/lib/errors';

// --- Schemas ---

const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string(),
  role: z.enum(['admin', 'vendor']),
});

const vendorSchema = z.object({
  // Step 1: Business Info
  businessName: z.string().min(2, 'Business name required'),
  businessType: z.enum(['INDIVIDUAL', 'COMPANY', 'AGENCY']),
  vendorType: z.enum(['SINGLE_OWNER', 'FLEET_OWNER']),

  // Step 2: Address
  city: z.string().min(2, 'City required'),
  state: z.string().min(2, 'State required'),
  pincode: z.string().regex(/^\d{6}$/, 'Invalid pincode'),

  // Step 3: Identity
  idType: z.enum(['AADHAAR', 'PAN', 'PASSPORT', 'DRIVING_LICENSE']),
  idNumber: z.string().min(5, 'ID Number required'),
  // Simulating document upload with a URL field for now
  documentUrl: z.string().url('Valid URL required (e.g. cloud link)'),
});

type LoginData = z.infer<typeof loginSchema>;
type VendorData = z.infer<typeof vendorSchema>;

export default function AdminAuthPage() {
  const router = useRouter();
  const session = useSession();
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [step, setStep] = useState(1);
  const totalSteps = 2; // Reduced from 3
  const [isLoading, setIsLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const {
    register: regLogin,
    control: ctrlLogin,
    handleSubmit: subLogin,
  } = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { role: 'admin' },
  });

  const {
    register: regVendor,
    trigger: triggerVendor,
    handleSubmit: subVendor,
  } = useForm<VendorData>({
    resolver: zodResolver(vendorSchema),
    defaultValues: {
      businessType: 'INDIVIDUAL',
      vendorType: 'SINGLE_OWNER',
      idType: 'AADHAAR',
    },
  });

  // Login Handler
  const handleLogin = async (data: LoginData) => {
    window.alert(
      `Login attempt:\nEmail: ${data.email}\nRole: ${data.role}\n\n(Note: This is a demo. No actual login will occur.)`
    );
    setIsLoading(true);
    setErrorMsg('');
    try {
      const result = await signIn('credentials', {
        redirect: false,
        email: data.email,
        password: data.password,
        role: data.role,
      });

      if (result?.error) {
        setErrorMsg(result.error);
        toast.error(result.error);
        return;
      }

      if (result?.ok) {
        toast.success('Welcome back!');
        const res = await axios.post('/api/auth/admin/login', data);
        if (res.status === 200) {
          const { role, vendorId, id } = res.data.user;
          const targetId = role === 'admin' ? id : vendorId;
          if (!targetId) {
            window.location.href = '/';
            return;
          }
          window.location.href = `/vendor/${targetId}/dashboard`;
        }
      }
    } catch (e: unknown) {
      console.error(getErrorMessage(e));
      setErrorMsg('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  // Updated handler
  const handleVendorReg = async (data: VendorData) => {
    setIsLoading(true);
    setErrorMsg('');

    // Only send business details (User details are inferred from session)
    const payload = {
      businessName: data.businessName,
      businessType: data.businessType,
      vendorType: data.vendorType,
      address: {
        city: data.city,
        state: data.state,
        pincode: data.pincode,
      },
      identityProof: {
        type: data.idType,
        number: data.idNumber,
        documentUrl: data.documentUrl,
      },
    };

    try {
      const res = await axios.post('/api/auth/vendor', payload);
      if (res.status === 201 || res.status === 200) {
        const message = res.data.message || 'Vendor registration successful.';
        toast.success(message);
        const { vendorId } = res.data;
        // Force refresh session to pick up new role
        router.push(`/admin/${vendorId || 'dashboard'}/dashboard`);
      }
    } catch (e: unknown) {
      setErrorMsg(getAxiosErrorMessage(e, 'Registration failed'));
    } finally {
      setIsLoading(false);
    }
  };

  const nextStep = async () => {
    let fieldsToValidate: Array<keyof VendorData> = [];

    // Step 1 is screen 1 (Business Info), Step 2 is screen 2 (Verification)
    if (step === 1) {
      fieldsToValidate = ['businessName', 'businessType', 'vendorType', 'city', 'state', 'pincode'];
    }

    const isValid = await triggerVendor(fieldsToValidate);
    if (isValid) {
      setStep((s) => s + 1);
    }
  };

  const prevStep = () => setStep((s) => s - 1);

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-slate-950 p-4 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[120px]" />
      </div>

      <motion.div layout className="w-full max-w-md relative z-10">
        <div className="bg-white/80 dark:bg-slate-900/90 backdrop-blur-xl border border-zinc-200 dark:border-slate-800 shadow-2xl rounded-3xl overflow-hidden">
          {/* Header */}
          <div className="px-8 pt-8 pb-4 text-center">
            <motion.div
              layout
              className={cn(
                'inline-flex items-center justify-center w-14 h-14 rounded-2xl shadow-lg mb-4 text-white',
                isLoginMode
                  ? 'bg-gradient-to-br from-blue-600 to-indigo-600'
                  : 'bg-gradient-to-br from-emerald-500 to-teal-500'
              )}
            >
              {isLoginMode ? (
                <ShieldCheck className="w-7 h-7" />
              ) : (
                <Building2 className="w-7 h-7" />
              )}
            </motion.div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
              {isLoginMode ? 'Admin Portal' : 'Partners Program'}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 font-medium">
              {isLoginMode ? 'Secure access for staff' : 'Join our vendor network'}
            </p>
          </div>

          {/* Toggle Tabs */}
          <div className="px-8 mb-6">
            <div className="bg-zinc-100 dark:bg-slate-800 p-1 rounded-xl flex relative">
              <motion.div
                className="absolute top-1 bottom-1 bg-white dark:bg-slate-700 rounded-lg shadow-sm w-[48%]"
                animate={{ x: isLoginMode ? '2%' : '106%' }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              />
              <button
                onClick={() => {
                  setIsLoginMode(true);
                  setErrorMsg('');
                }}
                className={cn(
                  'flex-1 py-2 text-sm font-semibold rounded-lg z-10 relative transition-colors',
                  isLoginMode ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500'
                )}
              >
                Login
              </button>
              <button
                onClick={() => {
                  setIsLoginMode(false);
                  setErrorMsg('');
                }}
                className={cn(
                  'flex-1 py-2 text-sm font-semibold rounded-lg z-10 relative transition-colors',
                  !isLoginMode ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-500'
                )}
              >
                Register Vendor
              </button>
            </div>
          </div>

          <div className="px-8 pb-8">
            <AnimatePresence mode="popLayout">
              {errorMsg ? (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex items-center gap-2 text-sm text-red-600 dark:text-red-400 font-medium"
                >
                  <AlertCircle className="w-4 h-4" />
                  {errorMsg}
                </motion.div>
              ) : null}
            </AnimatePresence>

            {isLoginMode ? (
              // --- LOGIN FORM ---
              <motion.form
                key="login"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onSubmit={subLogin(handleLogin)}
                className="space-y-4"
              >
                <div className="grid grid-cols-2 gap-2 p-1 bg-zinc-50 dark:bg-slate-800/50 border border-zinc-200 dark:border-slate-700 rounded-xl">
                  <Controller
                    name="role"
                    control={ctrlLogin}
                    render={({ field }) => (
                      <>
                        {['admin', 'vendor'].map((r) => (
                          <button
                            key={r}
                            type="button"
                            onClick={() => field.onChange(r)}
                            className={cn(
                              'py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-2',
                              field.value === r
                                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm border border-zinc-200 dark:border-slate-600'
                                : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                            )}
                          >
                            {r === 'admin' ? (
                              <ShieldCheck className="w-3.5 h-3.5" />
                            ) : (
                              <UserCog className="w-3.5 h-3.5" />
                            )}
                            {r}
                          </button>
                        ))}
                      </>
                    )}
                  />
                </div>

                <div className="space-y-3">
                  <div className="relative group">
                    <Mail className="absolute left-3 top-3.5 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                    <input
                      {...regLogin('email')}
                      placeholder="Email Address"
                      className="w-full pl-10 pr-4 py-3 bg-zinc-50 dark:bg-slate-800/50 border border-zinc-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                    />
                  </div>
                  <div className="relative group">
                    <Lock className="absolute left-3 top-3.5 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                    <input
                      type={showPass ? 'text' : 'password'}
                      {...regLogin('password')}
                      placeholder="Password"
                      className="w-full pl-10 pr-10 py-3 bg-zinc-50 dark:bg-slate-800/50 border border-zinc-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
                    >
                      {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  disabled={isLoading}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-lg shadow-blue-500/30 transition-all active:scale-[0.98] disabled:opacity-70 flex justify-center"
                >
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Sign In'}
                </button>
              </motion.form>
            ) : (
              // --- VENDOR MULTI-STEP FORM ---
              <motion.form
                key="vendor"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onSubmit={subVendor(handleVendorReg)}
                className="flex flex-col h-[340px]" // Fixed height container
              >
                {/* Step Indicator */}
                <div className="flex justify-between mb-6 px-2">
                  {[1, 2].map((s) => (
                    <div key={s} className="flex flex-col items-center gap-1">
                      <div
                        className={cn(
                          'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors',
                          step >= s
                            ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                            : 'bg-zinc-100 dark:bg-slate-800 text-gray-400'
                        )}
                      >
                        {s}
                      </div>
                      <span className="text-[10px] uppercase font-bold text-gray-400">
                        {s === 1 ? 'Biz' : 'Verify'}
                      </span>
                    </div>
                  ))}
                  {/* Progress Line */}
                  <div className="absolute top-4 left-10 right-10 h-[2px] bg-zinc-100 dark:bg-slate-800 -z-10">
                    <motion.div
                      className="h-full bg-emerald-500"
                      animate={{
                        width: step === 1 ? '0%' : '100%',
                      }}
                    />
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-zinc-200 dark:scrollbar-thumb-slate-700 space-y-4">
                  {step === 1 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="space-y-3 p-1"
                    >
                      <p className="text-sm font-medium text-blue-600 mb-2">
                        Registering as: {session.data?.user?.name || 'CurrentUser'}
                      </p>
                      <input
                        {...regVendor('businessName')}
                        placeholder="Company Name"
                        className="w-full px-4 py-3 bg-zinc-50 dark:bg-slate-800 border border-zinc-200 dark:border-slate-700 rounded-xl text-sm focus:border-emerald-500 outline-none"
                      />

                      <div className="grid grid-cols-2 gap-2">
                        <select
                          {...regVendor('businessType')}
                          className="px-3 py-3 bg-zinc-50 dark:bg-slate-800 border border-zinc-200 dark:border-slate-700 rounded-xl text-xs outline-none focus:border-emerald-500 cursor-pointer"
                        >
                          <option value="INDIVIDUAL">Individual</option>
                          <option value="COMPANY">Company</option>
                          <option value="AGENCY">Agency</option>
                        </select>
                        <select
                          {...regVendor('vendorType')}
                          className="px-3 py-3 bg-zinc-50 dark:bg-slate-800 border border-zinc-200 dark:border-slate-700 rounded-xl text-xs outline-none focus:border-emerald-500 cursor-pointer"
                        >
                          <option value="SINGLE_OWNER">Single Owner</option>
                          <option value="FLEET_OWNER">Fleet Owner</option>
                        </select>
                      </div>

                      <p className="text-xs font-bold text-gray-400 uppercase mt-4">
                        Address Details
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          {...regVendor('city')}
                          placeholder="City"
                          className="px-4 py-3 bg-zinc-50 dark:bg-slate-800 border border-zinc-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:border-emerald-500"
                        />
                        <input
                          {...regVendor('state')}
                          placeholder="State"
                          className="px-4 py-3 bg-zinc-50 dark:bg-slate-800 border border-zinc-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:border-emerald-500"
                        />
                      </div>
                      <input
                        {...regVendor('pincode')}
                        placeholder="Pincode (6 digits)"
                        maxLength={6}
                        className="w-full px-4 py-3 bg-zinc-50 dark:bg-slate-800 border border-zinc-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:border-emerald-500"
                      />
                    </motion.div>
                  )}

                  {step === 2 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="space-y-3 p-1"
                    >
                      <p className="text-xs font-semibold text-gray-500">
                        Provide official identity proof to get verified.
                      </p>

                      <div className="relative">
                        <FileBadge className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                        <select
                          {...regVendor('idType')}
                          className="w-full pl-10 pr-4 py-3 bg-zinc-50 dark:bg-slate-800 border border-zinc-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:border-emerald-500 cursor-pointer appearance-none"
                        >
                          <option value="AADHAAR">Aadhaar Card</option>
                          <option value="PAN">PAN Card</option>
                          <option value="PASSPORT">Passport</option>
                          <option value="DRIVING_LICENSE">Driving License</option>
                        </select>
                      </div>

                      <input
                        {...regVendor('idNumber')}
                        placeholder="Enter ID Number"
                        className="w-full px-4 py-3 bg-zinc-50 dark:bg-slate-800 border border-zinc-200 dark:border-slate-700 rounded-xl text-sm focus:border-emerald-500 outline-none"
                      />

                      <div className="p-4 border-2 border-dashed border-zinc-300 dark:border-slate-700 rounded-xl text-center bg-zinc-50/50 dark:bg-slate-800/50">
                        <p className="text-xs text-gray-500 mb-2">Upload Document (Simulated)</p>
                        <input
                          {...regVendor('documentUrl')}
                          placeholder="Paste Document URL here..."
                          className="w-full text-center text-xs bg-transparent border-b border-gray-300 dark:border-gray-600 outline-none pb-1 text-emerald-600"
                        />
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Wizard Controls */}
                <div className="pt-4 mt-auto grid grid-cols-2 gap-3 border-t border-gray-100 dark:border-slate-800">
                  {step > 1 ? (
                    <button
                      type="button"
                      onClick={prevStep}
                      className="py-2.5 px-4 rounded-xl border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-300 text-sm font-semibold hover:bg-gray-50 dark:hover:bg-slate-800 flex items-center justify-center gap-2"
                    >
                      <ArrowLeft className="w-4 h-4" /> Back
                    </button>
                  ) : (
                    <div /> // Spacer
                  )}

                  {step < totalSteps ? (
                    <button
                      type="button"
                      onClick={nextStep}
                      className="py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 ml-auto w-full"
                    >
                      Next <ArrowRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 ml-auto w-full"
                    >
                      {isLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        'Complete Registration'
                      )}
                    </button>
                  )}
                </div>
              </motion.form>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
