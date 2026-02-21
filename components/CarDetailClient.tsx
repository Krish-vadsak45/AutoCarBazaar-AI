"use client";
import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { EmiCalculatorModal } from "./emi-calculator-modal"; // Import the modal
import { PDFButton } from "./pdf-button";
import { PDFModal } from "./pdf-modal";
import Image from "next/image";
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
import { Badge } from "./ui/badge";

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

const workingHours = [
  { day: "Monday", hours: "Closed" },
  { day: "Tuesday", hours: "09:00 - 18:00" },
  { day: "Wednesday", hours: "09:00 - 18:00" },
  { day: "Thursday", hours: "09:00 - 18:00" },
  { day: "Friday", hours: "09:00 - 18:00" },
  { day: "Saturday", hours: "10:00 - 17:00" },
  { day: "Sunday", hours: "Closed" },
];

export default function CarDetailClient({ car }: { car: any }) {
  const images =
    car.images && car.images.length > 0
      ? car.images
      : car.image
      ? [car.image]
      : [];
  const [isEmiModalOpen, setIsEmiModalOpen] = useState(false); // State for EMI modal
  const [isPDFModalOpen, setIsPDFModalOpen] = useState(false); // State for PDF modal
  const [mainImage, setMainImage] = useState(images[0] || "/placeholder.svg");
  const [isSaved, setIsSaved] = useState(false);
  const router = useRouter();
  const [shareStatus, setShareStatus] = useState<
    "idle" | "shared" | "copied" | "error"
  >("idle");

  const { data: session } = useSession();

  // Check if car is already saved
  useEffect(() => {
    const checkSavedStatus = async () => {
      if (!session) return;
      try {
        const { data } = await axios.get("/api/saved-cars");
        const currentCarId = (car.id || car._id)?.toString();
        const isCurrentlySaved = Array.isArray(data) && data.some((savedCar: any) => 
          (savedCar?._id?.toString() === currentCarId)
        );
        setIsSaved(isCurrentlySaved);
      } catch (error) {
        console.error("Error checking saved status:", error);
      }
    };
    checkSavedStatus();
  }, [session, car.id, car._id]);

  useEffect(() => {
    const interval = setInterval(() => {
      setMainImage((prev: string) => {
        const currentIndex = images.indexOf(prev);
        return images[(currentIndex + 1) % images.length];
      });
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleToggleSave = async () => {
    if (!session) {
      toast.error("Please login to save cars");
      router.push("/login");
      return;
    }

    try {
      const carId = (car.id || car._id)?.toString();
      const { data } = await axios.post("/api/saved-cars", { carId });
      setIsSaved(data.action === "saved");
      toast.success(data.message);
    } catch (error) {
      console.error("Error saving car:", error);
      toast.error("Failed to save car");
    }
  };

  const handleShare = async () => {
    if (typeof window === "undefined") return;
    const shareUrl = window.location.href;
    try {
      if (typeof navigator !== "undefined" && (navigator as any).share) {
        await (navigator as any).share({
          title: car.title || "Car listing",
          text: `Check out this vehicle: ${car.title}`,
          url: shareUrl,
        });
        setShareStatus("shared");
      } else if (
        typeof navigator !== "undefined" &&
        (navigator as any).clipboard
      ) {
        await (navigator as any).clipboard.writeText(shareUrl);
        setShareStatus("copied");
      } else {
        // Last resort: fallback to selecting the URL (very old browsers)
        setShareStatus("error");
      }
    } catch (err) {
      console.error("Share failed", err);
      setShareStatus("error");
    }
    setTimeout(() => setShareStatus("idle"), 3000);
  };

  const nextImage = () => {
    const currentIndex = images.indexOf(mainImage);
    setMainImage(images[(currentIndex + 1) % images.length]);
  };

  const prevImage = () => {
    const currentIndex = images.indexOf(mainImage);
    setMainImage(images[(currentIndex - 1 + images.length) % images.length]);
  };

  const carSpecs = [
    {
      label: "Make",
      value: car.specs?.make || "N/A",
      value2: "Model",
      value2Content: car.specs?.model || "N/A",
    },
    {
      label: "Year",
      value: car.specs?.year || car.year || "N/A",
      value2: "Body Type",
      value2Content: car.bodyType || "N/A",
    },
    {
      label: "Fuel Type",
      value: car.specs?.fuelType || car.fuelType || "N/A",
      value2: "Transmission",
      value2Content: car.transmission || "N/A",
    },
    {
      label: "Mileage",
      value: car.specs?.mileage || car.mileage || "N/A",
      value2: "Color",
      value2Content: car.specs?.color || car.color || "N/A",
    },
  ];

  // Handler to open EMI modal
  const handleOpenEmiModal = () => {
    setIsEmiModalOpen(true);
  };

  // Handler to close EMI modal
  const handleCloseEmiModal = () => {
    setIsEmiModalOpen(false);
  };

  return (
    <div className="min-h-screen mt-20 bg-gray-50 dark:bg-slate-950">
      {/* PDF Modal */}
      <PDFModal
        isOpen={isPDFModalOpen}
        onClose={() => setIsPDFModalOpen(false)}
        carData={car}
        // images={images} // Removed as it is not part of PDFModalProps
      />

      {/* Main Content Container */}
      <div className="max-w-7xl mx-auto  px-6 py-20">
        {/* Two Column Layout: Image Left, Info Right */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* LEFT COLUMN - IMAGE GALLERY */}
          <div>
            <div
              className={`rounded-xl overflow-hidden shadow-lg mb-4 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800`}
            >
              <div className="relative h-96 bg-gray-100 group">
                <Image
                  src={mainImage || "/placeholder.svg"}
                  alt={car.title || "Car main view"}
                  width={800}
                  height={600}
                  className="w-full h-full object-cover"
                />

                {/* Navigation Arrows */}
                {images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/90 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
                    >
                      <ChevronLeft className="w-5 h-5 text-gray-900" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/90 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
                    >
                      <ChevronRight className="w-5 h-5 text-gray-900" />
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Thumbnail Gallery */}
            {images.length > 1 && (
              <div className="flex gap-3">
                {images.map((img: string, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => setMainImage(img)}
                    className={`relative w-20 h-16 rounded-lg overflow-hidden border-2 transition-all hover:border-blue-600 ${
                      mainImage === img
                        ? "border-blue-600 ring-2 ring-blue-300"
                        : "dark:border-slate-700 border-gray-200"
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
            )}
          </div>

          {/* RIGHT COLUMN - CAR INFO */}
          <div className="space-y-6">
            {/* Title and Price */}
            <div>
              <div className="max-w-7xl mx-auto">
                <span className="inline-block bg-gray-900 text-white text-xs font-semibold px-3 py-1 rounded mb-2">
                  {car.bodyType}
                </span>
              </div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">
                  {car.title}
                </h1>
                {car.status === "unavailable" && (
                  <Badge variant="destructive" className="h-fit">
                    Unavailable
                  </Badge>
                )}
              </div>
              <p className="text-4xl font-bold text-blue-600 dark:text-blue-400">
                {formatCurrency(car.price)}
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
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {car.specs?.mileage || car.mileage || "N/A"}
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
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {car.specs?.fuelType || car.fuelType || "N/A"}
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
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {car.transmission || "N/A"}
                </span>
              </div>
            </div>

            {/* EMI Calculator Card */}
            <div
              onClick={handleOpenEmiModal}
              className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4"
            >
              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-600 dark:bg-blue-500 rounded text-white flex-shrink-0">
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                    EMI Calculator
                  </h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    Estimated Monthly Payment:{" "}
                    <span className="font-bold text-gray-900 dark:text-gray-100">
                      {formatCurrency(Math.round(car.price / 60))}
                    </span>{" "}
                    for 60 months
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    *Based on $0 down payment and 4.5% interest rate
                  </p>
                </div>
              </div>
            </div>

            {/* Have Questions Card */}
            <div className="bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded text-blue-600 dark:text-blue-400 flex-shrink-0">
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                    Have Questions?
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Our representatives are available to answer all your queries
                    about this vehicle.
                  </p>
                  <button className="mt-3 w-full text-center py-2 px-4 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded hover:bg-gray-50 dark:hover:bg-slate-700 font-medium text-gray-900 dark:text-gray-100 transition-colors">
                    Request Info
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FOUR ACTION BUTTONS */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12">
          <button
            onClick={handleToggleSave}
            className={`py-3 px-6 rounded-lg font-medium transition-all hover:shadow-lg flex items-center justify-center gap-2 ${
              isSaved
                ? "bg-red-50 text-red-600 border border-red-200"
                : "bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-slate-700 hover:border-gray-400 dark:hover:border-slate-600"
            }`}
          >
            <Heart className={`w-5 h-5 ${isSaved ? "fill-red-600" : ""}`} />
            {isSaved ? "Saved" : "Save"}
          </button>
          <button
            onClick={handleShare}
            className="py-3 px-6 rounded-lg font-medium transition-all hover:shadow-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-slate-700 hover:border-gray-400 dark:hover:border-slate-600 flex items-center justify-center gap-2"
          >
            {shareStatus === "shared" ? (
              <Check className="w-5 h-5 text-green-600" />
            ) : (
              <Share2 className="w-5 h-5" />
            )}
            {shareStatus === "copied"
              ? "Link copied"
              : shareStatus === "shared"
              ? "Shared"
              : shareStatus === "error"
              ? "Unable to share"
              : "Share"}
          </button>
          <PDFButton onClick={() => setIsPDFModalOpen(true)} />
          <button
            onClick={() => router.push(`/test-drive/${car.id}`)}
            className="py-3 px-6 rounded-lg font-medium transition-all hover:shadow-lg bg-gray-900 dark:bg-slate-800 text-white hover:bg-gray-800 dark:hover:bg-slate-700 flex items-center justify-center gap-2"
          >
            <Calendar className="w-5 h-5" />
            Book Test Drive
          </button>
        </div>

        {/* DESCRIPTION & FEATURES */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <div className="bg-white dark:bg-slate-900 rounded-lg p-8 shadow-sm border border-gray-200 dark:border-slate-800">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Description
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-justify">
              {car.description || "No description available for this vehicle."}
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-lg p-8 shadow-sm border border-gray-200 dark:border-slate-800">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Features
            </h2>
            <ul className="space-y-3">
              {(car.features && car.features.length > 0
                ? car.features
                : [
                    "Transmission: " + car.transmission,
                    "Fuel: " + (car.specs?.fuelType || car.fuelType || "N/A"),
                    "Body: " + (car.bodyType || "N/A"),
                  ]
              ).map((feature: string, idx: number) => (
                <li
                  key={idx}
                  className="flex items-center gap-3 text-gray-700 dark:text-gray-300"
                >
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
        <div className="bg-white dark:bg-slate-900 rounded-lg p-8 shadow-sm border border-gray-200 dark:border-slate-800 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-8">
            Specifications
          </h2>
          <div className="grid grid-cols-2 gap-8">
            {carSpecs.map((spec, idx) => (
              <div
                key={idx}
                className="flex justify-between items-start py-4 border-b border-gray-100 dark:border-slate-800 last:border-b-0"
              >
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    {spec.label}
                  </p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {spec.value}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    {spec.value2}
                  </p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {spec.value2Content}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* DEALERSHIP LOCATION */}
        <div className="bg-white dark:bg-slate-900 rounded-lg p-8 shadow-sm border border-gray-200 dark:border-slate-800">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-8">
            Dealership Location
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Left - Contact Info */}
            <div>
              <div className="space-y-4">
                {/* Address */}
                <div className="flex items-start gap-3">
                  <div className="p-2 dark:bg-blue-900 bg-blue-100 rounded dark:text-blue-400 text-blue-600 flex-shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>

                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-gray-100">
                      Vehicl Motors
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300 text-sm mt-1">
                      69 Car Street, Autoville, CA 69420
                    </p>
                  </div>
                </div>

                {/* Phone */}
                <div className="flex items-center gap-3">
                  <div className="p-2 dark:bg-blue-900 bg-blue-100 rounded dark:text-blue-400 text-blue-600 flex-shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>

                  <p className="text-gray-700 dark:text-gray-300 text-sm">
                    +1 (555) 123-4567
                  </p>
                </div>

                {/* Email */}
                <div className="flex items-center gap-3">
                  <div className="p-2 dark:bg-blue-900 bg-blue-100 rounded dark:text-blue-400 text-blue-600 flex-shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>

                  <p className="text-gray-700 dark:text-gray-300 text-sm">
                    contact@vehicl.com
                  </p>
                </div>
              </div>
            </div>

            {/* Right - Working Hours */}
            <div>
              <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-4">
                Working Hours
              </h3>
              <div className="grid grid-cols-1 gap-4">
                {workingHours.map((hour, idx) => (
                  <div key={idx} className="flex justify-between">
                    <p className="text-gray-700 dark:text-gray-300 text-sm">
                      {hour.day}
                    </p>
                    <p
                      className={`font-medium text-sm text-gray-900 dark:text-gray-100 ${
                        hour.hours === "Closed"
                          ? "text-gray-500 dark:text-gray-600"
                          : ""
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

      {/* EMI Calculator Modal - Conditionally render based on state */}
      {isEmiModalOpen && (
        <EmiCalculatorModal
          isOpen={isEmiModalOpen}
          setIsEmiModalOpen={setIsEmiModalOpen}
          onClose={handleCloseEmiModal}
          carPrice={car.price}
        />
      )}
    </div>
  );
}
