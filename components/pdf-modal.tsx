"use client";

import { useEffect, useState } from "react";
import { X, Download } from "lucide-react";
import { useRouter } from "next/navigation";
import { useGeneratePDF } from "@/hooks/use-generate-pdf";

interface PDFModalProps {
  isOpen: boolean;
  onClose: () => void;
  carData: any;
}

export function PDFModal({ isOpen, onClose, carData }: PDFModalProps) {
  const { generatePDF } = useGeneratePDF();
  const router = useRouter();
  const [isGenerating, setIsGenerating] = useState(false);

  const images = carData?.images?.length
    ? carData.images
    : carData?.image
    ? [carData.image]
    : [];

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const handleDownload = async () => {
    setIsGenerating(true);
    try {
      await generatePDF(carData, images);
      setTimeout(() => {
        onClose();
        router.push(`/car/${carData._id}`);
      }, 1000);
    } catch (error) {
      console.error("Error generating PDF:", error);
      setIsGenerating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl max-w-5xl w-full max-h-[95vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-20 flex items-center justify-between px-10 py-6 bg-white border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center shadow-md">
              <span className="text-white font-bold text-sm">V</span>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Vehicle Profile
              </h2>
              <p className="text-xs text-gray-500">Premium Document</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              disabled={isGenerating}
              className="p-2.5 hover:bg-blue-50 rounded-lg border border-blue-200 text-blue-600 disabled:opacity-50"
            >
              <Download className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2.5 hover:bg-gray-100 rounded-lg border border-gray-200 text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(95vh-70px)] scrollbar-hide">
          {/* Hero Image */}
          <div className="relative w-full h-80 bg-gradient-to-br from-gray-900 to-gray-800 overflow-hidden">
            <img
              src={images[0] || "/placeholder.svg"}
              alt={carData?.title || "Vehicle"}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 via-transparent to-transparent"></div>
          </div>

          {/* Title moved below image ✅ */}
          <div className="px-10 pt-10">
            <h1 className="text-4xl font-bold text-gray-900 mb-1">
              {carData?.title}
            </h1>
            <p className="text-gray-500 text-lg">
              {carData?.specs?.make} {carData?.specs?.model}
            </p>
          </div>

          {/* Main Content */}
          <div className="px-10 py-14 space-y-16">
            {/* Price Section */}
            <div className="flex items-end justify-between pb-8 border-b-2 border-gray-200">
              <div>
                <p className="text-xs uppercase tracking-widest text-gray-500 font-semibold mb-2">
                  Investment Value
                </p>
                <h2 className="text-6xl font-bold text-gray-900">
                  ₹{carData?.price?.toLocaleString() || "N/A"}
                </h2>
              </div>
            </div>

            {/* Key Specifications */}
            <div>
              <p className="text-xs uppercase tracking-widest text-gray-500 font-semibold mb-6">
                Key Specifications
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[
                  { label: "Year", value: carData?.specs?.year },
                  { label: "Mileage", value: carData?.specs?.mileage },
                  { label: "Fuel Type", value: carData?.specs?.fuelType },
                  { label: "Transmission", value: carData?.transmission },
                ].map(
                  (spec, idx) =>
                    spec.value && (
                      <div
                        key={idx}
                        className="bg-gradient-to-br from-blue-50 to-blue-25 p-4 rounded-lg border border-blue-200"
                      >
                        <p className="text-xs text-gray-600 uppercase font-semibold mb-2">
                          {spec.label}
                        </p>
                        <p className="text-lg font-bold text-gray-900">
                          {spec.value}
                        </p>
                      </div>
                    )
                )}
              </div>
            </div>

            {/* Description */}
            {carData?.description && (
              <div>
                <p className="text-xs uppercase tracking-widest text-gray-500 font-semibold mb-4">
                  Overview
                </p>
                <p className="text-gray-700 leading-relaxed text-base">
                  {carData.description}
                </p>
              </div>
            )}

            {/* Complete Details */}
            <div>
              <p className="text-xs uppercase tracking-widest text-gray-500 font-semibold mb-8">
                Complete Details
              </p>
              <div className="grid md:grid-cols-2 gap-8">
                {[
                  { label: "Body Type", value: carData?.bodyType },
                  { label: "Color", value: carData?.specs?.color },
                  { label: "Make", value: carData?.specs?.make },
                  { label: "Model", value: carData?.specs?.model },
                ].map(
                  (item, idx) =>
                    item.value && (
                      <div
                        key={idx}
                        className="border-l-4 border-blue-500 pl-6"
                      >
                        <p className="text-xs uppercase tracking-widest text-gray-500 font-semibold mb-2">
                          {item.label}
                        </p>
                        <p className="text-lg font-semibold text-gray-900">
                          {item.value}
                        </p>
                      </div>
                    )
                )}
              </div>
            </div>

            {/* Features */}
            {carData?.features?.length > 0 && (
              <div>
                <p className="text-xs uppercase tracking-widest text-gray-500 font-semibold mb-6">
                  Premium Features
                </p>
                <div className="grid md:grid-cols-2 gap-3">
                  {carData.features.map((feature: string, idx: number) => (
                    <div
                      key={idx}
                      className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg"
                    >
                      <span className="text-emerald-600 font-bold text-lg">
                        ✓
                      </span>
                      <span className="text-gray-700 font-medium text-sm">
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between pt-6">
              <div className="text-sm text-gray-600">
                Tags: {carData?.tags?.join(", ") || "Premium Vehicle"}
              </div>
              <div className="text-sm text-gray-600">
                {new Date().toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="sticky bottom-0 bg-white px-10 py-4 flex justify-end gap-3 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-6 py-2.5 text-gray-700 border border-gray-300 rounded-lg"
          >
            Close
          </button>
          <button
            onClick={handleDownload}
            disabled={isGenerating}
            className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg flex items-center gap-2 shadow-md"
          >
            <Download className="w-5 h-5" />
            {isGenerating ? "Generating..." : "Download PDF"}
          </button>
        </div>
      </div>
    </div>
  );
}
