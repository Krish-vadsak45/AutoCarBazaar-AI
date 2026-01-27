"use client";
import React, { useMemo, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { useRouter } from "next/navigation";
import Image from "next/image";
import * as z from "zod";
import {
  Car as CarIcon,
  Fuel,
  Gauge,
  Settings,
  Palette,
  Calendar,
  MapPin,
  Phone,
  Mail,
  Calculator,
  Heart,
  Share2,
  ChevronLeft,
  ChevronRight,
  Check,
  X,
  CalendarCheck,
  CarFront,
  Clock,
} from "lucide-react";
import { Button } from "./ui/button";
import { Dialog, DialogTrigger, DialogContent } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardHeader, CardContent } from "./ui/card";
import { Separator } from "./ui/separator";
import { Textarea } from "./ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import TestDriveForm from "./test-drive-form";
import { id } from "date-fns/locale";

type Car = {
  id: string;
  title: string;
  price: number;
  mileage?: string;
  fuelType?: string;
  transmission?: string;
  bodyType?: string;
  color?: string;
  images?: string[];
  description?: string;
  year?: number;
  condition?: string;
  location?: string;
  features?: string[];
  dealershipName?: string;
  dealershipAddress?: string;
  dealershipPhone?: string;
  dealershipEmail?: string;
  workingHours?: { day: string; hours: string }[];
};

type FormValues = {
  vehiclePrice: number;
  downPayment: number;
  interestRate: number;
  loanTermYears: number;
};

const schema = z.object({
  vehiclePrice: z.number().min(0, "Price must be positive"),
  downPayment: z.number().min(0, "Down payment must be positive"),
  interestRate: z.number().min(0).max(100, "Rate must be between 0-100"),
  loanTermYears: z.number().min(1).max(30, "Term must be between 1-30 years"),
});

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

// export default function CarDetailPage({ car }: { car: Car }) {
//   const [currentImageIndex, setCurrentImageIndex] = useState(0);
//   const [isEmiCalculatorOpen, setIsEmiCalculatorOpen] = useState(false);
//   const [isFavorite, setIsFavorite] = useState(false);
//   const [showTestDriveForm, setShowTestDriveForm] = useState(false);
//   const [showSuccessModal, setShowSuccessModal] = useState(false);
//   const [bookingDetails, setBookingDetails] = useState<any>(null);

//   const defaultValues: FormValues = {
//     vehiclePrice: car.price ?? 0,
//     downPayment: Math.round((car.price ?? 0) * 0.2),
//     interestRate: 4.5,
//     loanTermYears: 5,
//   };

//   const { control, watch } = useForm<FormValues>({
//     resolver: zodResolver(schema),
//     defaultValues,
//   });

//   const values = watch();

//   const loanAmount = useMemo(
//     () => Math.max(0, values.vehiclePrice - values.downPayment),
//     [values.vehiclePrice, values.downPayment]
//   );

//   const monthlyPayment = useMemo(() => {
//     if (loanAmount <= 0) return 0;
//     const monthlyRate = values.interestRate / 100 / 12;
//     const totalMonths = values.loanTermYears * 12;
//     if (monthlyRate === 0) return loanAmount / totalMonths;
//     return (
//       (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) /
//       (Math.pow(1 + monthlyRate, totalMonths) - 1)
//     );
//   }, [loanAmount, values.interestRate, values.loanTermYears]);

//   const images =
//     car.images && car.images.length > 0
//       ? car.images
//       : [
//           "https://images.unsplash.com/photo-1552519507-da3effff991c?w=800&q=80",
//         ];

//   const allSpecifications = [
//     { icon: CarIcon, label: "Make", value: "Honda" },
//     { icon: Calendar, label: "Year", value: car.year || "N/A" },
//     { icon: Gauge, label: "Mileage", value: car.mileage || "N/A" },
//     { icon: Fuel, label: "Fuel Type", value: car.fuelType || "N/A" },
//     { icon: Settings, label: "Transmission", value: car.transmission || "N/A" },
//     { icon: CarIcon, label: "Body Type", value: car.bodyType || "N/A" },
//     { icon: Palette, label: "Color", value: car.color || "N/A" },
//     { icon: CarFront, label: "Condition", value: car.condition || "N/A" },
//   ];

//   const nextImage = () => {
//     setCurrentImageIndex((prev) => (prev + 1) % images.length);
//   };

//   const prevImage = () => {
//     setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
//   };

//   const handleTestDriveSuccess = (details: any) => {
//     setBookingDetails(details);
//     setShowTestDriveForm(false);
//     setShowSuccessModal(true);
//   };

//   return (
//     <>
//       <div className="min-h-screen bg-white dark:bg-slate-950">
//         <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
//           {/* Top Section - Image Left, Details Right */}
//           <div className="grid lg:grid-cols-[450px,1fr] gap-8 mb-12">
//             {/* Left - Image Gallery */}
//             <div className="space-y-4">
//               <div className="relative aspect-[4/3] bg-gray-100 dark:bg-slate-800 rounded-2xl overflow-hidden shadow-xl group border-2 border-gray-200 dark:border-slate-700">
//                 <img
//                   src={images[currentImageIndex] || "/placeholder.svg"}
//                   alt={`${car.title} - Image ${currentImageIndex + 1}`}
//                   className="w-full h-full object-cover"
//                 />

//                 {/* Navigation Arrows */}
//                 {images.length > 1 && (
//                   <>
//                     <button
//                       onClick={prevImage}
//                       className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 hover:bg-white dark:hover:bg-slate-800"
//                     >
//                       <ChevronLeft className="w-5 h-5 text-gray-900 dark:text-gray-100" />
//                     </button>
//                     <button
//                       onClick={nextImage}
//                       className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 hover:bg-white dark:hover:bg-slate-800"
//                     >
//                       <ChevronRight className="w-5 h-5 text-gray-900 dark:text-gray-100" />
//                     </button>
//                   </>
//                 )}

//                 {/* Image Counter */}
//                 <div className="absolute bottom-3 right-3 px-3 py-1.5 bg-black/70 text-white rounded-lg text-sm font-medium backdrop-blur-sm">
//                   {currentImageIndex + 1} / {images.length}
//                 </div>
//               </div>

//               {/* Thumbnail Strip */}
//               {images.length > 1 && (
//                 <div className="flex gap-2 overflow-x-auto pb-2">
//                   {images.map((img, idx) => (
//                     <button
//                       key={idx}
//                       onClick={() => setCurrentImageIndex(idx)}
//                       className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all duration-300 ${
//                         idx === currentImageIndex
//                           ? "border-blue-500 ring-2 ring-blue-500/50"
//                           : "border-gray-300 dark:border-slate-700 hover:border-blue-500/50"
//                       }`}
//                     >
//                       <img
//                         src={img || "/placeholder.svg"}
//                         alt={`Thumbnail ${idx + 1}`}
//                         className="w-full h-full object-cover"
//                       />
//                     </button>
//                   ))}
//                 </div>
//               )}
//             </div>

//             {/* Right - Details Section */}
//             <div className="space-y-6">
//               {/* Body Type Badge */}
//               <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900/30 rounded-full border border-blue-300 dark:border-blue-800">
//                 <CarIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
//                 <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
//                   {car.bodyType || "Vehicle"}
//                 </span>
//               </div>

//               {/* Title */}
//               <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-gray-100 leading-tight">
//                 {car.title}
//               </h1>

//               {/* Price */}
//               <div className="flex items-center gap-2">
//                 <span className="text-5xl font-bold text-blue-600 dark:text-blue-400">
//                   {formatCurrency(car.price)}
//                 </span>
//               </div>

//               {/* Three Properties Side by Side */}
//               <div className="grid grid-cols-3 gap-4">
//                 <div className="p-4 bg-gray-50 dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700">
//                   <div className="flex items-center gap-2 mb-2">
//                     <Gauge className="w-4 h-4 text-blue-600 dark:text-blue-400" />
//                     <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">
//                       Mileage
//                     </span>
//                   </div>
//                   <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
//                     {car.mileage || "N/A"}
//                   </p>
//                 </div>

//                 <div className="p-4 bg-gray-50 dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700">
//                   <div className="flex items-center gap-2 mb-2">
//                     <Fuel className="w-4 h-4 text-blue-600 dark:text-blue-400" />
//                     <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">
//                       Fuel Type
//                     </span>
//                   </div>
//                   <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
//                     {car.fuelType || "N/A"}
//                   </p>
//                 </div>

//                 <div className="p-4 bg-gray-50 dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700">
//                   <div className="flex items-center gap-2 mb-2">
//                     <Settings className="w-4 h-4 text-blue-600 dark:text-blue-400" />
//                     <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">
//                       Transmission
//                     </span>
//                   </div>
//                   <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
//                     {car.transmission || "N/A"}
//                   </p>
//                 </div>
//               </div>

//               {/* EMI Calculator Section */}
//               <div className="p-6 bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-800/10 rounded-2xl border-2 border-blue-200 dark:border-blue-800">
//                 <div className="flex items-start gap-4 mb-4">
//                   <div className="p-3 bg-blue-600 rounded-lg">
//                     <Calculator className="w-5 h-5 text-white" />
//                   </div>
//                   <div className="flex-1">
//                     <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-1">
//                       EMI Calculator
//                     </h3>
//                     <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
//                       Estimated Monthly Payment:{" "}
//                       <span className="font-bold text-blue-600 dark:text-blue-400">
//                         {formatCurrency(monthlyPayment)}/month
//                       </span>
//                       {" for 60 months"}
//                     </p>
//                     <p className="text-xs text-gray-500 dark:text-gray-500">
//                       *Based on $0 down payment and 4.5% interest rate
//                     </p>
//                   </div>
//                   <button
//                     onClick={() => setIsEmiCalculatorOpen(true)}
//                     className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-all duration-300 hover:shadow-lg"
//                   >
//                     Open
//                   </button>
//                 </div>
//               </div>

//               {/* Questions Section */}
//               <div className="p-6 bg-white dark:bg-slate-800 rounded-2xl border-2 border-gray-200 dark:border-slate-700">
//                 <div className="flex items-start gap-4">
//                   <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
//                     <MessageIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
//                   </div>
//                   <div className="flex-1">
//                     <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">
//                       Have Questions?
//                     </h3>
//                     <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
//                       Our representatives are available to answer all your
//                       queries about this vehicle.
//                     </p>
//                     <button className="px-6 py-2 bg-white dark:bg-slate-900 border-2 border-gray-300 dark:border-slate-600 text-gray-900 dark:text-gray-100 rounded-lg font-semibold hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-300 hover:shadow-lg">
//                       Request Info
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Three Action Buttons */}
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
//             <button
//               onClick={() => setIsFavorite(!isFavorite)}
//               className={`group p-6 rounded-2xl border-2 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center gap-3 ${
//                 isFavorite
//                   ? "bg-red-50 dark:bg-red-900/20 border-red-500 text-red-500"
//                   : "bg-white dark:bg-slate-900 border-gray-300 dark:border-slate-700 text-gray-700 dark:text-gray-300 hover:border-red-500 hover:text-red-500"
//               }`}
//             >
//               <Heart
//                 className={`w-6 h-6 transition-all duration-300 ${
//                   isFavorite ? "fill-current" : ""
//                 }`}
//               />
//               <span className="text-lg font-bold">
//                 {isFavorite ? "Saved" : "Save"}
//               </span>
//             </button>

//             <button className="group p-6 bg-white dark:bg-slate-900 rounded-2xl border-2 border-gray-300 dark:border-slate-700 text-gray-700 dark:text-gray-300 hover:border-blue-600 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center gap-3">
//               <Share2 className="w-6 h-6" />
//               <span className="text-lg font-bold">Share</span>
//             </button>

//             <button
//               onClick={() => setShowTestDriveForm(true)}
//               className="group p-6 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-2xl border-2 border-blue-600 hover:border-blue-700 hover:shadow-2xl transition-all duration-300 hover:scale-105 shadow-lg flex items-center justify-center gap-3"
//             >
//               <CalendarCheck className="w-6 h-6" />
//               <span className="text-lg font-bold">Book Test Drive</span>
//             </button>
//           </div>

//           {/* Description and Features Side by Side */}
//           <div className="grid md:grid-cols-2 gap-8 mb-12">
//             {/* Description */}
//             <div className="bg-white dark:bg-slate-900 rounded-2xl border-2 border-gray-200 dark:border-slate-800 shadow-xl overflow-hidden">
//               <div className="bg-gradient-to-r from-blue-50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-800/10 px-6 py-4 border-b border-gray-200 dark:border-slate-800">
//                 <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
//                   Description
//                 </h2>
//               </div>
//               <div className="p-6">
//                 <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-justify">
//                   {car.description ||
//                     "Experience the sleek and stylish 2023 Honda City! This stunning blue sedan offers a comfortable ride and impressive fuel efficiency. Enjoy modern features and reliable performance!"}
//                 </p>
//               </div>
//             </div>

//             {/* Features */}
//             <div className="bg-white dark:bg-slate-900 rounded-2xl border-2 border-gray-200 dark:border-slate-800 shadow-xl overflow-hidden">
//               <div className="bg-gradient-to-r from-blue-50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-800/10 px-6 py-4 border-b border-gray-200 dark:border-slate-800">
//                 <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
//                   Features
//                 </h2>
//               </div>
//               <div className="p-6">
//                 {car.features && car.features.length > 0 ? (
//                   <div className="space-y-3">
//                     {car.features.map((feature, idx) => (
//                       <div
//                         key={idx}
//                         className="flex items-center gap-3 p-2 hover:bg-blue-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
//                       >
//                         <div className="flex-shrink-0 p-1 bg-blue-100 dark:bg-blue-900/30 rounded-full">
//                           <Check className="w-4 h-4 text-blue-600 dark:text-blue-400" />
//                         </div>
//                         <span className="text-gray-700 dark:text-gray-300 font-medium">
//                           {feature}
//                         </span>
//                       </div>
//                     ))}
//                   </div>
//                 ) : (
//                   <div className="space-y-3">
//                     {[
//                       "Semi-Automatic Transmission",
//                       "Diesel Engine",
//                       "Sedan Body Style",
//                       "Blue Exterior",
//                     ].map((feature, idx) => (
//                       <div
//                         key={idx}
//                         className="flex items-center gap-3 p-2 hover:bg-blue-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
//                       >
//                         <div className="flex-shrink-0 p-1 bg-blue-100 dark:bg-blue-900/30 rounded-full">
//                           <Check className="w-4 h-4 text-blue-600 dark:text-blue-400" />
//                         </div>
//                         <span className="text-gray-700 dark:text-gray-300 font-medium">
//                           {feature}
//                         </span>
//                       </div>
//                     ))}
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>

//           {/* Full Width Specifications */}
//           <div className="bg-white dark:bg-slate-900 rounded-2xl border-2 border-gray-200 dark:border-slate-800 shadow-xl overflow-hidden mb-12">
//             <div className="bg-gradient-to-r from-blue-50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-800/10 px-6 py-5 border-b border-gray-200 dark:border-slate-800">
//               <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
//                 Specifications
//               </h2>
//             </div>
//             <div className="p-8">
//               <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
//                 {allSpecifications.map((spec, idx) => {
//                   const Icon = spec.icon;
//                   return (
//                     <div
//                       key={idx}
//                       className="group p-6 bg-gray-50 dark:bg-slate-800/50 rounded-xl border border-gray-200 dark:border-slate-700 hover:border-blue-500 hover:shadow-lg transition-all duration-300 hover:scale-105"
//                     >
//                       <div className="flex items-start gap-4">
//                         <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl group-hover:bg-blue-600 dark:group-hover:bg-blue-600 group-hover:scale-110 transition-all duration-300">
//                           <Icon className="w-6 h-6 text-blue-600 dark:text-blue-400 group-hover:text-white" />
//                         </div>
//                         <div>
//                           <p className="text-sm text-gray-600 dark:text-gray-400 mb-1 font-medium">
//                             {spec.label}
//                           </p>
//                           <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
//                             {spec.value}
//                           </p>
//                         </div>
//                       </div>
//                     </div>
//                   );
//                 })}
//               </div>
//             </div>
//           </div>

//           {/* Dealership Location Section */}
//           <div className="bg-white dark:bg-slate-900 rounded-2xl border-2 border-gray-200 dark:border-slate-800 shadow-xl overflow-hidden">
//             <div className="bg-gradient-to-r from-blue-50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-800/10 px-6 py-5 border-b border-gray-200 dark:border-slate-800">
//               <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
//                 Dealership Location
//               </h2>
//             </div>
//             <div className="p-8">
//               <div className="grid md:grid-cols-[1fr,1fr] gap-8">
//                 {/* Left - Dealership Info */}
//                 <div className="space-y-6">
//                   <div className="flex items-start gap-4">
//                     <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg mt-1">
//                       <MapPin className="w-5 h-5 text-blue-600 dark:text-blue-400" />
//                     </div>
//                     <div>
//                       <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-1">
//                         {car.dealershipName || "Vehicl Motors"}
//                       </h3>
//                       <p className="text-gray-600 dark:text-gray-300">
//                         {car.dealershipAddress ||
//                           "69 Car Street, Autoville, CA 69420"}
//                       </p>
//                     </div>
//                   </div>

//                   <div className="flex items-start gap-4">
//                     <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg mt-1">
//                       <Phone className="w-5 h-5 text-blue-600 dark:text-blue-400" />
//                     </div>
//                     <div>
//                       <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
//                         Phone
//                       </p>
//                       <p className="text-gray-900 dark:text-gray-100 font-semibold">
//                         {car.dealershipPhone || "+1 (555) 123-4567"}
//                       </p>
//                     </div>
//                   </div>

//                   <div className="flex items-start gap-4">
//                     <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg mt-1">
//                       <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400" />
//                     </div>
//                     <div>
//                       <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
//                         Email
//                       </p>
//                       <p className="text-gray-900 dark:text-gray-100 font-semibold">
//                         {car.dealershipEmail || "contact@vehicl.com"}
//                       </p>
//                     </div>
//                   </div>
//                 </div>

//                 {/* Right - Working Hours */}
//                 <div>
//                   <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
//                     <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
//                     Working Hours
//                   </h3>
//                   <div className="space-y-3">
//                     {car.workingHours && car.workingHours.length > 0
//                       ? car.workingHours.map((schedule, idx) => (
//                           <div
//                             key={idx}
//                             className="flex justify-between py-2 border-b border-gray-200 dark:border-slate-700 last:border-0"
//                           >
//                             <span className="text-gray-700 dark:text-gray-300 font-medium">
//                               {schedule.day}
//                             </span>
//                             <span className="text-gray-600 dark:text-gray-400">
//                               {schedule.hours}
//                             </span>
//                           </div>
//                         ))
//                       : [
//                           { day: "Monday", hours: "Closed" },
//                           { day: "Tuesday", hours: "09:00 - 18:00" },
//                           { day: "Wednesday", hours: "09:00 - 18:00" },
//                           { day: "Thursday", hours: "09:00 - 18:00" },
//                           { day: "Friday", hours: "09:00 - 18:00" },
//                           { day: "Saturday", hours: "10:00 - 17:00" },
//                           { day: "Sunday", hours: "Closed" },
//                         ].map((schedule, idx) => (
//                           <div
//                             key={idx}
//                             className="flex justify-between py-2 border-b border-gray-200 dark:border-slate-700 last:border-0"
//                           >
//                             <span className="text-gray-700 dark:text-gray-300 font-medium">
//                               {schedule.day}
//                             </span>
//                             <span className="text-gray-600 dark:text-gray-400">
//                               {schedule.hours}
//                             </span>
//                           </div>
//                         ))}
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* EMI Calculator Modal */}
//         {isEmiCalculatorOpen && (
//           <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
//             <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border-2 border-gray-200 dark:border-slate-800">
//               <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-5 flex items-center justify-between">
//                 <div className="flex items-center gap-3">
//                   <Calculator className="w-6 h-6 text-white" />
//                   <h3 className="text-2xl font-bold text-white">
//                     EMI Calculator
//                   </h3>
//                 </div>
//                 <button
//                   onClick={() => setIsEmiCalculatorOpen(false)}
//                   className="p-2 hover:bg-white/20 rounded-lg transition-colors"
//                 >
//                   <X className="w-6 h-6 text-white" />
//                 </button>
//               </div>

//               <div className="p-8 space-y-6">
//                 <div>
//                   <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block">
//                     Vehicle Price
//                   </label>
//                   <Controller
//                     name="vehiclePrice"
//                     control={control}
//                     render={({ field }) => (
//                       <input
//                         {...field}
//                         type="number"
//                         className="w-full px-4 py-3 text-lg font-semibold border-2 border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-600 transition-all outline-none"
//                         onChange={(e) =>
//                           field.onChange(parseFloat(e.target.value))
//                         }
//                       />
//                     )}
//                   />
//                 </div>

//                 <div>
//                   <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block">
//                     Down Payment
//                   </label>
//                   <Controller
//                     name="downPayment"
//                     control={control}
//                     render={({ field }) => (
//                       <input
//                         {...field}
//                         type="number"
//                         className="w-full px-4 py-3 text-lg font-semibold border-2 border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-600 transition-all outline-none"
//                         onChange={(e) =>
//                           field.onChange(parseFloat(e.target.value))
//                         }
//                       />
//                     )}
//                   />
//                 </div>

//                 <div>
//                   <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block">
//                     Interest Rate (%)
//                   </label>
//                   <Controller
//                     name="interestRate"
//                     control={control}
//                     render={({ field }) => (
//                       <input
//                         {...field}
//                         type="number"
//                         step="0.1"
//                         className="w-full px-4 py-3 text-lg font-semibold border-2 border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-600 transition-all outline-none"
//                         onChange={(e) =>
//                           field.onChange(parseFloat(e.target.value))
//                         }
//                       />
//                     )}
//                   />
//                 </div>

//                 <div>
//                   <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block">
//                     Loan Term (Years)
//                   </label>
//                   <Controller
//                     name="loanTermYears"
//                     control={control}
//                     render={({ field }) => (
//                       <input
//                         {...field}
//                         type="number"
//                         min="1"
//                         max="30"
//                         className="w-full px-4 py-3 text-lg font-semibold border-2 border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-600 transition-all outline-none"
//                         onChange={(e) =>
//                           field.onChange(parseFloat(e.target.value))
//                         }
//                       />
//                     )}
//                   />
//                 </div>

//                 <div className="pt-6 border-t border-gray-200 dark:border-slate-700">
//                   <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-xl border border-blue-200 dark:border-blue-800">
//                     <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
//                       Monthly Payment
//                     </p>
//                     <p className="text-4xl font-bold text-blue-600 dark:text-blue-400">
//                       {formatCurrency(monthlyPayment)}
//                     </p>
//                     <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
//                       For {values.loanTermYears} years (
//                       {values.loanTermYears * 12} months) at{" "}
//                       {values.interestRate}% interest
//                     </p>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>

//       {/* Test Drive Form Modal */}
//       {showTestDriveForm && (
//         <TestDriveForm
//           car={car}
//           onClose={() => setShowTestDriveForm(false)}
//           onSuccess={handleTestDriveSuccess}
//         />
//       )}

//       {/* Success Modal */}
//       {showSuccessModal && bookingDetails && (
//         <SuccessModal
//           bookingDetails={bookingDetails}
//           onClose={() => setShowSuccessModal(false)}
//         />
//       )}
//     </>
//   );
// }

// function MessageIcon(props: any) {
//   return (
//     <svg
//       {...props}
//       xmlns="http://www.w3.org/2000/svg"
//       width="24"
//       height="24"
//       viewBox="0 0 24 24"
//       fill="none"
//       stroke="currentColor"
//       strokeWidth="2"
//       strokeLinecap="round"
//       strokeLinejoin="round"
//     >
//       <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
//     </svg>
//   );
// }

const carImages = ["/1.png", "/2.webp", "/3.jpg"];

const carDetails = {
  name: "2023 Honda City",
  type: "Sedan",
  price: "$18,000.00",
  mileage: "13 miles",
  fuelType: "Diesel",
  transmission: "Semi-Automatic",
  emiMonthly: "$300.00",
  emiMonths: 60,
  emiRate: "4.5%",
};

const workingHours = [
  { day: "Monday", hours: "Closed" },
  { day: "Tuesday", hours: "09:00 - 18:00" },
  { day: "Wednesday", hours: "09:00 - 18:00" },
  { day: "Thursday", hours: "09:00 - 18:00" },
  { day: "Friday", hours: "09:00 - 18:00" },
  { day: "Saturday", hours: "10:00 - 17:00" },
  { day: "Sunday", hours: "Closed" },
];

const specifications = [
  { label: "Make", value: "Honda", value2: "Model", value2Content: "City" },
  { label: "Year", value: "2023", value2: "Body Type", value2Content: "Sedan" },
  {
    label: "Fuel Type",
    value: "Diesel",
    value2: "Transmission",
    value2Content: "Semi-Automatic",
  },
  {
    label: "Mileage",
    value: "13 miles",
    value2: "Color",
    value2Content: "Blue",
  },
];

export default function CarDetailClient() {
  const [mainImage, setMainImage] = useState(carImages[0]);
  const [isSaved, setIsSaved] = useState(false);
  const router = useRouter();

  const nextImage = () => {
    const currentIndex = carImages.indexOf(mainImage);
    setMainImage(carImages[(currentIndex + 1) % carImages.length]);
  };

  const prevImage = () => {
    const currentIndex = carImages.indexOf(mainImage);
    setMainImage(
      carImages[(currentIndex - 1 + carImages.length) % carImages.length]
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className=" py-4 px-6 sticky top-0 mt-10 ">
        <div className="max-w-7xl mx-auto">
          <span className="inline-block bg-gray-900 text-white text-xs font-semibold px-3 py-1 rounded">
            {carDetails.type}
          </span>
        </div>
      </div>

      {/* Main Content Container */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Two Column Layout: Image Left, Info Right */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* LEFT COLUMN - IMAGE GALLERY */}
          <div>
            <div className="rounded-xl overflow-hidden shadow-lg mb-4 bg-white">
              <div className="relative h-96 bg-gray-100 group">
                <Image
                  src={mainImage || "/placeholder.svg"}
                  alt="Car main view"
                  width={800}
                  height={600}
                  className="w-full h-full object-cover"
                />

                {/* Navigation Arrows */}
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/90 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/90 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Thumbnail Gallery */}
            <div className="flex gap-3">
              {carImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setMainImage(img)}
                  className={`relative w-20 h-16 rounded-lg overflow-hidden border-2 transition-all hover:border-blue-600 ${
                    mainImage === img
                      ? "border-blue-600 ring-2 ring-blue-300"
                      : "border-gray-200"
                  }`}
                >
                  <Image
                    src={img || "/placeholder.svg"}
                    alt={`Thumbnail ${idx + 1}`}
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* RIGHT COLUMN - CAR INFO */}
          <div className="space-y-6">
            {/* Title and Price */}
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                {carDetails.name}
              </h1>
              <p className="text-4xl font-bold text-blue-600">
                {carDetails.price}
              </p>
            </div>

            {/* Quick Stats */}
            <div className="flex gap-8">
              <div className="flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span className="text-sm text-gray-600">
                  {carDetails.mileage}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
                <span className="text-sm text-gray-600">
                  {carDetails.fuelType}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span className="text-sm text-gray-600">
                  {carDetails.transmission}
                </span>
              </div>
            </div>

            {/* EMI Calculator Card */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-600 rounded text-white flex-shrink-0">
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    EMI Calculator
                  </h3>
                  <p className="text-sm text-gray-700">
                    Estimated Monthly Payment:{" "}
                    <span className="font-bold text-gray-900">
                      {carDetails.emiMonthly}
                    </span>{" "}
                    for {carDetails.emiMonths} months
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    *Based on $0 down payment and {carDetails.emiRate} interest
                    rate
                  </p>
                </div>
              </div>
            </div>

            {/* Have Questions Card */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-100 rounded text-blue-600 flex-shrink-0">
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    Have Questions?
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Our representatives are available to answer all your queries
                    about this vehicle.
                  </p>
                  <button className="mt-3 w-full text-center py-2 px-4 bg-white border border-gray-300 rounded hover:bg-gray-50 font-medium text-gray-900 transition-colors">
                    Request Info
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* THREE ACTION BUTTONS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          <button
            onClick={() => setIsSaved(!isSaved)}
            className={`py-3 px-6 rounded-lg font-medium transition-all hover:shadow-lg flex items-center justify-center gap-2 ${
              isSaved
                ? "bg-red-50 text-red-600 border border-red-200"
                : "bg-white text-gray-900 border border-gray-300 hover:border-gray-400"
            }`}
          >
            <Heart className={`w-5 h-5 ${isSaved ? "fill-red-600" : ""}`} />
            Save
          </button>
          <button className="py-3 px-6 rounded-lg font-medium transition-all hover:shadow-lg bg-white text-gray-900 border border-gray-300 hover:border-gray-400 flex items-center justify-center gap-2">
            <Share2 className="w-5 h-5" />
            Share
          </button>
          <button
            onClick={() => router.push(`/test-drive/${id}`)}
            className="py-3 px-6 rounded-lg font-medium transition-all hover:shadow-lg bg-gray-900 text-white hover:bg-gray-800 flex items-center justify-center gap-2"
          >
            <Calendar className="w-5 h-5" />
            Book Test Drive
          </button>
        </div>

        {/* DESCRIPTION & FEATURES */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Description
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Experience the sleek and stylish 2023 Honda City! This stunning
              blue sedan offers a comfortable ride and impressive fuel
              efficiency. Enjoy modern features and reliable performance!
            </p>
          </div>

          <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Features</h2>
            <ul className="space-y-3">
              {[
                "Semi-Automatic Transmission",
                "Diesel Engine",
                "Sedan Body Style",
                "Blue Exterior",
              ].map((feature, idx) => (
                <li key={idx} className="flex items-center gap-3 text-gray-700">
                  <span className="flex-shrink-0">
                    <Check className="w-5 h-5 text-blue-600" />
                  </span>
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* SPECIFICATIONS */}
        <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-200 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">
            Specifications
          </h2>
          <div className="grid grid-cols-2 gap-8">
            {specifications.map((spec, idx) => (
              <div
                key={idx}
                className="flex justify-between items-start py-4 border-b border-gray-100 last:border-b-0"
              >
                <div>
                  <p className="text-sm text-gray-600 mb-1">{spec.label}</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {spec.value}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600 mb-1">{spec.value2}</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {spec.value2Content}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* DEALERSHIP LOCATION */}
        <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">
            Dealership Location
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Left - Contact Info */}
            <div>
              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-100 rounded text-blue-600 flex-shrink-0">
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Vehicl Motors</h3>
                  <p className="text-gray-600 text-sm mt-1">
                    69 Car Street, Autoville, CA 69420
                  </p>
                  <p className="text-gray-600 text-sm mt-2">
                    Phone: +1 (555) 123-4567
                  </p>
                  <p className="text-gray-600 text-sm">
                    Email: contact@vehicl.com
                  </p>
                </div>
              </div>
            </div>

            {/* Right - Working Hours */}
            <div>
              <h3 className="font-bold text-gray-900 mb-4">Working Hours</h3>
              <div className="grid grid-cols-2 gap-4">
                {workingHours.map((hour, idx) => (
                  <div key={idx} className="flex justify-between">
                    <p className="text-gray-700 text-sm">{hour.day}</p>
                    <p
                      className={`font-medium text-sm ${
                        hour.hours === "Closed"
                          ? "text-gray-500"
                          : "text-gray-900"
                      }`}
                    >
                      {hour.hours}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
