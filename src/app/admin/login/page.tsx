"use client";

import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import * as z from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ShieldCheck,
  Mail,
  Lock,
  UserCog,
  ChevronRight,
  Loader2,
  AlertCircle,
  Eye,
  EyeOff,
  Building2,
  Phone,
  Globe,
  MapPin,
  FileText,
  User as UserIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

// --- Schemas ---

// Standard Login Schema
const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(6, { message: "Password must be 6+ chars" }),
  role: z.enum(["admin", "vendor"], { message: "Select a valid role" }),
});

// Vendor Registration Schema
const vendorRegisterSchema = z.object({
  name: z.string().min(2, "Name required"),
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be 6+ chars"),
  businessName: z.string().min(2, "Business Name required"),
  businessAddress: z.string().min(5, "Address required"),
  taxId: z.string().optional(),
  phoneNumber: z.string().min(10, "Valid phone number required"),
  website: z.string().url("Invalid URL").optional().or(z.literal("")),
});

type LoginData = z.infer<typeof loginSchema>;
type VendorData = z.infer<typeof vendorRegisterSchema>;

export default function AdminAuthPage() {
  const router = useRouter();
  const [isLoginMode, setIsLoginMode] = useState(true); // Toggle between Login / Register
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState("");

  // Login Form
  const {
    register: registerLogin,
    control: controlLogin,
    handleSubmit: handleSubmitLogin,
    formState: { errors: loginErrors },
  } = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "", role: "admin" },
  });

  // Vendor Register Form
  const {
    register: registerVendor,
    handleSubmit: handleSubmitVendor,
    formState: { errors: vendorErrors },
  } = useForm<VendorData>({
    resolver: zodResolver(vendorRegisterSchema),
  });

  // Handle Login
  const onLoginSubmit = async (data: LoginData) => {
    setIsLoading(true);
    setServerError("");
    try {
      const response = await axios.post("/api/auth/admin/login", data);
      if (response.status === 200) {
        toast.success(`Welcome back, ${response.data.user.name || "Admin"}!`);
        setTimeout(() => router.push("/admin/dashboard"), 1000);
      }
    } catch (error: any) {
      setServerError(error.response?.data?.error || "Login failed.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Vendor Registration
  const onVendorRegisterSubmit = async (data: VendorData) => {
    setIsLoading(true);
    setServerError("");
    try {
      // We will create a new API route for vendor registration
      // Payload structure matches our new User Model
      const payload = {
        name: data.name,
        email: data.email,
        password: data.password,
        role: "vendor",
        vendorDetails: {
          businessName: data.businessName,
          businessAddress: data.businessAddress,
          phoneNumber: data.phoneNumber,
          taxId: data.taxId,
          website: data.website,
        },
      };

      const response = await axios.post("/api/auth/vendor/register", payload); // New Route needed

      if (response.status === 201) {
        toast.success("Vendor account created! Please login.");
        setIsLoginMode(true); // Switch back to login
      }
    } catch (error: any) {
      setServerError(error.response?.data?.error || "Registration failed.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-slate-950 p-4 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-purple-500/20 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-blue-500/20 rounded-full blur-[100px]" />
      </div>

      <motion.div
        layout
        className="w-full max-w-[480px] relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-gray-200 dark:border-slate-800 shadow-2xl rounded-3xl overflow-hidden flex flex-col">
          {/* Header */}
          <div className="px-8 pt-8 pb-4 text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 shadow-lg mb-4">
              {isLoginMode ? (
                <ShieldCheck className="w-7 h-7 text-white" />
              ) : (
                <Building2 className="w-7 h-7 text-white" />
              )}
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {isLoginMode ? "Portal Access" : "Vendor Registration"}
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
              {isLoginMode
                ? "Secure login for staff & partners"
                : "Join our network as a verified vendor"}
            </p>
          </div>

          {/* Toggle Switch */}
          <div className="px-8 mb-6">
            <div className="bg-gray-100 dark:bg-slate-800 p-1 rounded-xl flex">
              <button
                onClick={() => {
                  setIsLoginMode(true);
                  setServerError("");
                }}
                className={cn(
                  "flex-1 py-2 text-sm font-medium rounded-lg transition-all",
                  isLoginMode
                    ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700"
                )}
              >
                Login
              </button>
              <button
                onClick={() => {
                  setIsLoginMode(false);
                  setServerError("");
                }}
                className={cn(
                  "flex-1 py-2 text-sm font-medium rounded-lg transition-all",
                  !isLoginMode
                    ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700"
                )}
              >
                Create Vendor
              </button>
            </div>
          </div>

          <div className="px-8 pb-8">
            <AnimatePresence mode="wait">
              {serverError && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-4 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 p-3 flex items-center gap-2 text-sm text-red-600 dark:text-red-400"
                >
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {serverError}
                </motion.div>
              )}
            </AnimatePresence>

            {isLoginMode ? (
              /* LOGIN FORM */
              <motion.form
                key="login-form"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onSubmit={handleSubmitLogin(onLoginSubmit)}
                className="space-y-4"
              >
                {/* Role Switcher */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-500 uppercase ml-1">
                    Access Level
                  </label>
                  <Controller
                    name="role"
                    control={controlLogin}
                    render={({ field }) => (
                      <div className="grid grid-cols-2 gap-2">
                        {["admin", "vendor"].map((role) => (
                          <button
                            key={role}
                            type="button"
                            onClick={() => field.onChange(role)}
                            className={cn(
                              "flex items-center justify-center gap-2 py-2.5 text-sm font-medium border rounded-xl transition-all",
                              field.value === role
                                ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
                                : "border-gray-200 dark:border-slate-700 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800"
                            )}
                          >
                            {role === "admin" ? (
                              <ShieldCheck className="w-4 h-4" />
                            ) : (
                              <UserCog className="w-4 h-4" />
                            )}
                            <span className="capitalize">{role}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  />
                </div>

                <div className="relative">
                  <Mail className="absolute left-3 top-3.5 text-gray-400 w-5 h-5" />
                  <input
                    {...registerLogin("email")}
                    placeholder="Email Address"
                    className="w-full bg-gray-50 dark:bg-slate-800 pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                <div className="relative">
                  <Lock className="absolute left-3 top-3.5 text-gray-400 w-5 h-5" />
                  <input
                    type={showPassword ? "text" : "password"}
                    {...registerLogin("password")}
                    placeholder="Password"
                    className="w-full bg-gray-50 dark:bg-slate-800 pl-10 pr-10 py-3 rounded-xl border border-gray-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-3 rounded-xl shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 mt-4 hover:opacity-90 transition-opacity disabled:opacity-70"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    "Authenticate"
                  )}
                </button>
              </motion.form>
            ) : (
              /* VENDOR REGISTRATION FORM */
              <motion.form
                key="vendor-form"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onSubmit={handleSubmitVendor(onVendorRegisterSubmit)}
                className="space-y-3 max-h-[400px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-slate-700"
              >
                <div className="grid grid-cols-2 gap-3">
                  <input
                    {...registerVendor("name")}
                    placeholder="Owner Name"
                    className="col-span-2 bg-gray-50 dark:bg-slate-800 px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 outline-none focus:border-blue-500"
                  />
                  <input
                    {...registerVendor("email")}
                    placeholder="Email"
                    className="col-span-2 bg-gray-50 dark:bg-slate-800 px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 outline-none focus:border-blue-500"
                  />
                  <input
                    type="password"
                    {...registerVendor("password")}
                    placeholder="Set Password"
                    className="col-span-2 bg-gray-50 dark:bg-slate-800 px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 outline-none focus:border-blue-500"
                  />
                </div>

                <div className="pt-2 pb-1 border-t border-gray-100 dark:border-slate-800">
                  <p className="text-xs font-semibold text-gray-500 uppercase">
                    Business Details
                  </p>
                </div>

                <input
                  {...registerVendor("businessName")}
                  placeholder="Business Name"
                  className="w-full bg-gray-50 dark:bg-slate-800 px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 outline-none focus:border-blue-500"
                />

                <input
                  {...registerVendor("businessAddress")}
                  placeholder="Business Address"
                  className="w-full bg-gray-50 dark:bg-slate-800 px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 outline-none focus:border-blue-500"
                />

                <div className="grid grid-cols-2 gap-3">
                  <input
                    {...registerVendor("phoneNumber")}
                    placeholder="Phone Number"
                    className="bg-gray-50 dark:bg-slate-800 px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 outline-none focus:border-blue-500"
                  />
                  <input
                    {...registerVendor("taxId")}
                    placeholder="Tax ID (Optional)"
                    className="bg-gray-50 dark:bg-slate-800 px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 outline-none focus:border-blue-500"
                  />
                </div>

                <input
                  {...registerVendor("website")}
                  placeholder="Website URL (Optional)"
                  className="w-full bg-gray-50 dark:bg-slate-800 px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 outline-none focus:border-blue-500"
                />

                {Object.keys(vendorErrors).length > 0 && (
                  <p className="text-xs text-red-500 text-center">
                    Please fix the highlighted errors above.
                  </p>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold py-3 rounded-xl shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 mt-4 hover:opacity-90 transition-opacity disabled:opacity-70"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    "Register Business"
                  )}
                </button>
              </motion.form>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
