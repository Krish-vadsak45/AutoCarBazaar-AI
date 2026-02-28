"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSession, signIn } from "next-auth/react";

// --- Schemas ---

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6, { message: "Min 6 chars" }),
  role: z.enum(["admin", "vendor"]),
});

const vendorSchema = z.object({
  // Step 1: Business & Contact Info
  businessName: z.string().min(2),
  ownerName: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  phone: z.string().min(10),
  website: z.union([z.string().url(), z.literal("")]).optional(),
  description: z.string().optional(),

  // Step 2: Address & Legal
  businessType: z.enum(["INDIVIDUAL", "COMPANY", "AGENCY"]),
  vendorType: z.enum(["SINGLE_OWNER", "FLEET_OWNER"]),
  gstNumber: z.string().optional(),

  street: z.string().min(5),
  city: z.string().min(2),
  state: z.string().min(2),
  pincode: z.string().regex(/^\d{6}$/),

  // Step 3: Identity & Bank
  idType: z.enum(["AADHAAR", "PAN", "PASSPORT", "DRIVING_LICENSE"]),
  idNumber: z.string().min(5),
  documentUrl: z.string().url(),

  bankName: z.string().min(2),
  accountHolderName: z.string().min(2),
  accountNumber: z.string().min(8),
  ifscCode: z.string().regex(/^[A-Z]{4}0[A-Z0-9]{6}$/),
});

type LoginData = z.infer<typeof loginSchema>;
type VendorData = z.infer<typeof vendorSchema>;

export default function AdminAuthPage() {
  const router = useRouter();
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [step, setStep] = useState(1);
  const totalSteps = 3; // Increased to 3
  const [isLoading, setIsLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const loginForm = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { role: "admin", email: "", password: "" },
  });

  const vendorForm = useForm<VendorData>({
    resolver: zodResolver(vendorSchema),
    defaultValues: {
      businessName: "",
      ownerName: "",
      email: "",
      password: "",
      phone: "",
      website: "",
      description: "",
      gstNumber: "",
      street: "",
      city: "",
      state: "",
      pincode: "",
      idNumber: "",
      documentUrl: "",
      bankName: "",
      accountHolderName: "",
      accountNumber: "",
      ifscCode: "",
      businessType: "INDIVIDUAL",
      vendorType: "SINGLE_OWNER",
      idType: "AADHAAR",
    },
  });

  // Login Handler
  const handleLogin = async (data: LoginData) => {
    setIsLoading(true);
    setErrorMsg("");
    try {
      const result = await signIn("credentials", {
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
        toast.success("Welcome back!");
        // We call the custom login API to get the user's data (role, vendorId) for redirection
        const res = await axios.post("/api/auth/admin/login", data);
        if (res.status === 200) {
          const { role, vendorId, id } = res.data.user;
          const targetId = role === "admin" ? id : vendorId;

          if (!targetId) {
            console.error("No target ID found for redirection", res.data.user);
            router.push("/");
            return;
          }

          // Use window.location.href to ensure a full reload and avoid middleware issues
          // with stale client-side session state
          globalThis.window.location.href = `/admin/${targetId}/dashboard`;
        }
      }
    } catch (e: any) {
      setErrorMsg("An unexpected error occurred");
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  // Updated handler
  const handleVendorReg = async (data: VendorData) => {
    setIsLoading(true);
    setErrorMsg("");

    const payload = {
      businessName: data.businessName,
      ownerName: data.ownerName,
      password: data.password,
      contactDetails: {
        email: data.email,
        phone: data.phone,
      },
      website: data.website,
      description: data.description,

      // 2. Address & Legal
      businessType: data.businessType,
      vendorType: data.vendorType,
      gstNumber: data.gstNumber,

      address: {
        street: data.street,
        city: data.city,
        state: data.state,
        pincode: data.pincode,
      },

      // 3. Identity
      identityProof: {
        type: data.idType,
        number: data.idNumber,
        documentUrl: data.documentUrl,
      },

      // 4. Bank (Must match Schema in API)
      bankDetails: {
        bankName: data.bankName,
        accountHolderName: data.accountHolderName,
        accountNumber: data.accountNumber,
        ifscCode: data.ifscCode,
      },
    };

    try {
      const res = await axios.post("/api/auth/vendor", payload);
      if (res.status === 201 || res.status === 200) {
        const message = res.data.message || "Vendor registration successful.";
        toast.success(message);
        const { vendorId } = res.data;
        
        // Auto-login after successful registration
        const loginResult = await signIn("credentials", {
          redirect: false,
          email: data.email,
          password: data.password,
          role: "vendor",
        });

        if (loginResult?.ok) {
           // Use window.location.href to ensure a full reload and avoid middleware issues
           globalThis.window.location.href = `/vendor/${vendorId || "dashboard"}/dashboard`;
        } else {
           // Fallback if auto-login fails
           setIsLoginMode(true);
           setStep(1);
           vendorForm.reset();
           toast.info("Please log in with your new credentials.");
        }
      }
    } catch (e: any) {
      setErrorMsg(e.response?.data?.error || "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  const nextStep = async () => {
    let fieldsToValidate: (keyof VendorData)[] = [];

    if (step === 1) {
      fieldsToValidate = [
        "businessName",
        "ownerName",
        "email",
        "password",
        "phone",
        "website",
      ];
    } else if (step === 2) {
      fieldsToValidate = [
        "street",
        "city",
        "state",
        "pincode",
        "businessType",
        "vendorType",
      ];
      // Access values via getValues() or similar if needed,
      // but simplistic array is safer for now.
      // Ideally we check if businessType != INDIVIDUAL to require GST,
      // but Zod schema handles optionality. Use explicit trigger.
      fieldsToValidate.push("gstNumber");
    }

    const isValid = await vendorForm.trigger(fieldsToValidate);
    if (isValid) setStep((s) => s + 1);
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
                "inline-flex items-center justify-center w-14 h-14 rounded-2xl shadow-lg mb-4 text-white",
                isLoginMode
                  ? "bg-gradient-to-br from-blue-600 to-indigo-600"
                  : "bg-gradient-to-br from-emerald-500 to-teal-500",
              )}
            >
              {isLoginMode ? (
                <ShieldCheck className="w-7 h-7" />
              ) : (
                <Building2 className="w-7 h-7" />
              )}
            </motion.div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
              {isLoginMode ? "Admin Portal" : "Partners Program"}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 font-medium">
              {isLoginMode
                ? "Secure access for staff"
                : "Join our vendor network"}
            </p>
          </div>

          {/* Toggle Tabs */}
          <div className="px-8 mb-6">
            <div className="bg-zinc-100 dark:bg-slate-800 p-1 rounded-xl flex relative">
              <motion.div
                className="absolute top-1 bottom-1 bg-white dark:bg-slate-700 rounded-lg shadow-sm w-[48%]"
                animate={{ x: isLoginMode ? "2%" : "106%" }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
              <button
                onClick={() => {
                  setIsLoginMode(true);
                  setErrorMsg("");
                }}
                className={cn(
                  "flex-1 py-2 text-sm font-semibold rounded-lg z-10 relative transition-colors",
                  isLoginMode
                    ? "text-blue-600 dark:text-blue-400"
                    : "text-gray-500",
                )}
              >
                Login
              </button>
              <button
                onClick={() => {
                  setIsLoginMode(false);
                  setErrorMsg("");
                }}
                className={cn(
                  "flex-1 py-2 text-sm font-semibold rounded-lg z-10 relative transition-colors",
                  !isLoginMode
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-gray-500",
                )}
              >
                Register Vendor
              </button>
            </div>
          </div>

          <div className="px-8 pb-8">
            <AnimatePresence mode="popLayout">
              {errorMsg && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex items-center gap-2 text-sm text-red-600 dark:text-red-400 font-medium"
                >
                  <AlertCircle className="w-4 h-4" />
                  {errorMsg}
                </motion.div>
              )}
            </AnimatePresence>

            {isLoginMode ? (
              // --- LOGIN FORM ---
              <Form {...loginForm}>
                <motion.form
                  key="login"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  onSubmit={loginForm.handleSubmit(handleLogin)}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-2 gap-2 p-1 bg-zinc-50 dark:bg-slate-800/50 border border-zinc-200 dark:border-slate-700 rounded-xl">
                    <FormField
                      control={loginForm.control}
                      name="role"
                      render={({ field }) => (
                        <FormItem className="col-span-2">
                          <FormControl>
                            <div className="flex w-full gap-2">
                              {["admin", "vendor"].map((r) => (
                                <button
                                  key={r}
                                  type="button"
                                  onClick={() => field.onChange(r)}
                                  className={cn(
                                    "flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-2",
                                    field.value === r
                                      ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm border border-zinc-200 dark:border-slate-600"
                                      : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300",
                                  )}
                                >
                                  {r === "admin" ? (
                                    <ShieldCheck className="w-3.5 h-3.5" />
                                  ) : (
                                    <UserCog className="w-3.5 h-3.5" />
                                  )}
                                  {r}
                                </button>
                              ))}
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="space-y-3">
                    <FormField
                      control={loginForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <div className="relative group">
                              <Mail className="absolute left-3 top-3.5 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors z-10" />
                              <Input
                                {...field}
                                placeholder="Email Address"
                                className="pl-10 pr-4 py-5 bg-zinc-50 dark:bg-slate-800/50 border-zinc-200 dark:border-slate-700 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-blue-500/20 focus-visible:border-blue-500 transition-all text-sm"
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={loginForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <div className="relative group">
                              <Lock className="absolute left-3 top-3.5 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors z-10" />
                              <Input
                                type={showPass ? "text" : "password"}
                                {...field}
                                placeholder="Password"
                                className="pl-10 pr-10 py-5 bg-zinc-50 dark:bg-slate-800/50 border-zinc-200 dark:border-slate-700 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-blue-500/20 focus-visible:border-blue-500 transition-all text-sm"
                              />
                              <button
                                type="button"
                                onClick={() => setShowPass(!showPass)}
                                className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600 z-10"
                              >
                                {showPass ? (
                                  <EyeOff className="w-4 h-4" />
                                ) : (
                                  <Eye className="w-4 h-4" />
                                )}
                              </button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-6 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-lg shadow-blue-500/30 transition-all active:scale-[0.98] disabled:opacity-70 flex justify-center text-md"
                  >
                    {isLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      "Sign In"
                    )}
                  </Button>
                </motion.form>
              </Form>
            ) : (
              // --- VENDOR MULTI-STEP FORM ---
              <Form {...vendorForm}>
                <motion.form
                  key="vendor"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  onSubmit={vendorForm.handleSubmit(handleVendorReg)}
                  className="flex flex-col h-[340px]" // Fixed height container
                >
                {/* Step Indicator */}
                <div className="flex justify-between mb-6 px-2 relative">
                  {[1, 2, 3].map((s) => (
                    <div
                      key={s}
                      className="flex flex-col items-center gap-1 z-10"
                    >
                      <div
                        className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors",
                          step >= s
                            ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/30"
                            : "bg-zinc-100 dark:bg-slate-800 text-gray-400",
                        )}
                      >
                        {s}
                      </div>
                      <span className="text-[10px] uppercase font-bold text-gray-400">
                        {s === 1 ? "Info" : s === 2 ? "Legal" : "Bank"}
                      </span>
                    </div>
                  ))}
                  {/* Progress Line */}
                  <div className="absolute top-4 left-6 right-6 h-[2px] bg-zinc-100 dark:bg-slate-800 -z-0">
                    <motion.div
                      className="h-full bg-emerald-500"
                      animate={{
                        width: `${((step - 1) / 2) * 100}%`,
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
                      <FormField
                        control={vendorForm.control}
                        name="businessName"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="Business/Shop Name"
                                className="w-full px-4 py-5 bg-zinc-50 dark:bg-slate-800 border rounded-xl text-sm outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500"
                              />
                            </FormControl>
                            <FormMessage className="text-xs px-1" />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={vendorForm.control}
                        name="ownerName"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="Owner Full Name"
                                className="w-full px-4 py-5 bg-zinc-50 dark:bg-slate-800 border rounded-xl text-sm outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500"
                              />
                            </FormControl>
                            <FormMessage className="text-xs px-1" />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-2 gap-2">
                        <FormField
                          control={vendorForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input
                                  {...field}
                                  placeholder="Business Email"
                                  className="w-full px-4 py-5 bg-zinc-50 dark:bg-slate-800 border rounded-xl text-sm outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500"
                                />
                              </FormControl>
                              <FormMessage className="text-xs px-1" />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={vendorForm.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <div className="relative">
                                  <Input
                                    {...field}
                                    type={showPass ? "text" : "password"}
                                    placeholder="Password"
                                    className="w-full px-4 py-5 bg-zinc-50 dark:bg-slate-800 border rounded-xl text-sm outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => setShowPass(!showPass)}
                                    className="absolute right-3 top-3 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                                  >
                                    {showPass ? (
                                      <EyeOff className="w-4 h-4" />
                                    ) : (
                                      <Eye className="w-4 h-4" />
                                    )}
                                  </button>
                                </div>
                              </FormControl>
                              <FormMessage className="text-xs px-1" />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={vendorForm.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="Contact Phone"
                                className="w-full px-4 py-5 bg-zinc-50 dark:bg-slate-800 border rounded-xl text-sm outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500"
                              />
                            </FormControl>
                            <FormMessage className="text-xs px-1" />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={vendorForm.control}
                        name="website"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="Website (Optional)"
                                className="w-full px-4 py-5 bg-zinc-50 dark:bg-slate-800 border rounded-xl text-sm outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500"
                              />
                            </FormControl>
                            <FormMessage className="text-xs px-1" />
                          </FormItem>
                        )}
                      />
                    </motion.div>
                  )}

                  {step === 2 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="space-y-3 p-1"
                    >
                      <div className="grid grid-cols-2 gap-2">
                        <FormField
                          control={vendorForm.control}
                          name="businessType"
                          render={({ field }) => (
                            <FormItem>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger className="w-full px-4 py-5 bg-zinc-50 dark:bg-slate-800 border-zinc-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500">
                                    <SelectValue placeholder="Business Type" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="INDIVIDUAL">Individual</SelectItem>
                                  <SelectItem value="COMPANY">Company</SelectItem>
                                  <SelectItem value="AGENCY">Agency</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage className="text-xs px-1" />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={vendorForm.control}
                          name="vendorType"
                          render={({ field }) => (
                            <FormItem>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger className="w-full px-4 py-5 bg-zinc-50 dark:bg-slate-800 border-zinc-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500">
                                    <SelectValue placeholder="Vendor Type" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="SINGLE_OWNER">Single Owner</SelectItem>
                                  <SelectItem value="FLEET_OWNER">Fleet Owner</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage className="text-xs px-1" />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={vendorForm.control}
                        name="gstNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="GST Number (Optional)"
                                className="w-full px-4 py-5 bg-zinc-50 dark:bg-slate-800 border rounded-xl text-sm outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500"
                              />
                            </FormControl>
                            <FormMessage className="text-xs px-1" />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={vendorForm.control}
                        name="street"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="Street Address, Area"
                                className="w-full px-4 py-5 bg-zinc-50 dark:bg-slate-800 border rounded-xl text-sm outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500"
                              />
                            </FormControl>
                            <FormMessage className="text-xs px-1" />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-2 gap-2">
                        <FormField
                          control={vendorForm.control}
                          name="city"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input
                                  {...field}
                                  placeholder="City"
                                  className="w-full px-4 py-5 bg-zinc-50 dark:bg-slate-800 border rounded-xl text-sm outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500"
                                />
                              </FormControl>
                              <FormMessage className="text-xs px-1" />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={vendorForm.control}
                          name="state"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input
                                  {...field}
                                  placeholder="State"
                                  className="w-full px-4 py-5 bg-zinc-50 dark:bg-slate-800 border rounded-xl text-sm outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500"
                                />
                              </FormControl>
                              <FormMessage className="text-xs px-1" />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={vendorForm.control}
                        name="pincode"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="Pincode (6 digits)"
                                maxLength={6}
                                className="w-full px-4 py-5 bg-zinc-50 dark:bg-slate-800 border rounded-xl text-sm outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500"
                              />
                            </FormControl>
                            <FormMessage className="text-xs px-1" />
                          </FormItem>
                        )}
                      />
                    </motion.div>
                  )}

                  {step === 3 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="space-y-3 p-1"
                    >
                      {/* Identity */}
                      <FormField
                        control={vendorForm.control}
                        name="idType"
                        render={({ field }) => (
                          <FormItem>
                            <div className="relative">
                              <FileBadge className="absolute left-3 top-5 w-5 h-5 text-gray-400 z-10" />
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger className="w-full pl-10 pr-4 py-5 bg-zinc-50 dark:bg-slate-800 border-zinc-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500">
                                    <SelectValue placeholder="ID Type" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="AADHAAR">Aadhaar Card</SelectItem>
                                  <SelectItem value="PAN">PAN Card</SelectItem>
                                  <SelectItem value="PASSPORT">Passport</SelectItem>
                                  <SelectItem value="DRIVING_LICENSE">Driving License</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <FormMessage className="text-xs px-1" />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={vendorForm.control}
                        name="idNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="Enter ID Number"
                                className="w-full px-4 py-5 bg-zinc-50 dark:bg-slate-800 border rounded-xl text-sm outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500"
                              />
                            </FormControl>
                            <FormMessage className="text-xs px-1" />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={vendorForm.control}
                        name="documentUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="ID Document URL"
                                className="w-full px-4 py-5 bg-zinc-50 dark:bg-slate-800 border rounded-xl text-sm outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500"
                              />
                            </FormControl>
                            <FormMessage className="text-xs px-1" />
                          </FormItem>
                        )}
                      />

                      {/* Bank */}
                      <p className="text-xs font-bold text-gray-400 uppercase mt-4">
                        Bank Details
                      </p>

                      <FormField
                        control={vendorForm.control}
                        name="bankName"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="Bank Name"
                                className="w-full px-4 py-5 bg-zinc-50 dark:bg-slate-800 border rounded-xl text-sm outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500"
                              />
                            </FormControl>
                            <FormMessage className="text-xs px-1" />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-2 gap-2">
                        <FormField
                          control={vendorForm.control}
                          name="accountHolderName"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input
                                  {...field}
                                  placeholder="Account Holder"
                                  className="w-full px-4 py-5 bg-zinc-50 dark:bg-slate-800 border rounded-xl text-sm outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500"
                                />
                              </FormControl>
                              <FormMessage className="text-xs px-1" />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={vendorForm.control}
                          name="accountNumber"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input
                                  {...field}
                                  placeholder="Account #"
                                  className="w-full px-4 py-5 bg-zinc-50 dark:bg-slate-800 border rounded-xl text-sm outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500"
                                />
                              </FormControl>
                              <FormMessage className="text-xs px-1" />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={vendorForm.control}
                        name="ifscCode"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="IFSC Code"
                                className="w-full px-4 py-5 bg-zinc-50 dark:bg-slate-800 border rounded-xl text-sm outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500"
                              />
                            </FormControl>
                            <FormMessage className="text-xs px-1" />
                          </FormItem>
                        )}
                      />
                    </motion.div>
                  )}
                </div>

                {/* Wizard Controls */}
                <div className="pt-4 mt-auto grid grid-cols-2 gap-3 border-t border-gray-100 dark:border-slate-800">
                  {step > 1 ? (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={prevStep}
                      className="py-5 px-4 rounded-xl border-zinc-200 dark:border-slate-700 text-gray-600 dark:text-gray-300 text-sm font-semibold hover:bg-zinc-50 dark:hover:bg-slate-800 flex items-center justify-center gap-2"
                    >
                      <ArrowLeft className="w-4 h-4" /> Back
                    </Button>
                  ) : (
                    <div /> // Spacer
                  )}

                  {step < totalSteps ? (
                    <Button
                      type="button"
                      onClick={nextStep}
                      className="py-5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 ml-auto w-full"
                    >
                      Next <ArrowRight className="w-4 h-4" />
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="py-5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 ml-auto w-full"
                    >
                      {isLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        "Complete Registration"
                      )}
                    </Button>
                  )}
                </div>
              </motion.form>
            </Form>
          )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
