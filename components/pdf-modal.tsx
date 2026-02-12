"use client";

import { useEffect, useState, useRef } from "react";
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
  const reportRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [isGenerating, setIsGenerating] = useState(false);

  const PLACEHOLDER =
    "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&q=80&w=800";

  // Fill images with placeholder if they are missing
  const images = [...(carData?.images || [])];
  if (images.length === 0 && carData?.image) images.push(carData.image);
  while (images.length < 3) images.push(PLACEHOLDER);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const handleDownload = async () => {
    if (!reportRef.current) return;
    setIsGenerating(true);
    try {
      await generatePDF(reportRef.current, carData?.title);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 md:p-8"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col border border-white/20"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Scrollable Preview Content */}
        <div className="overflow-y-auto flex-1 bg-slate-200/50 mx-auto w-full shadow-inner scrollbar-hide py-10">
          {/* Main Document Body - THIS IS THE PORTION CAPTURED FOR PDF */}
          <div ref={reportRef} className="flex flex-col gap-10 w-fit mx-auto">
            {/* PAGE 1 */}
            <div className="bg-white w-[210mm] min-h-[297mm] h-fit shadow-2xl relative overflow-hidden flex flex-col">
              {/* Image Report Header */}
              <div className="bg-[#0f172a] p-10 flex justify-between items-center text-white">
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 bg-white/10 rounded-full flex items-center justify-center border border-white/20">
                    <span className="text-3xl">🚗</span>
                  </div>
                  <div>
                    <p className="text-[#fbbf24] text-xs font-bold uppercase tracking-[0.2em] mb-1">
                      Official Vehicle Report
                    </p>
                    <h1 className="text-3xl font-black tracking-tight">
                      {carData?.specs?.year} {carData?.title}
                    </h1>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-white/50 text-[10px] font-bold uppercase tracking-widest mb-1">
                    Certified Valuation
                  </p>
                  <p className="text-[#fbbf24] text-4xl font-black tracking-tighter">
                    ₹{carData?.price?.toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="p-10 space-y-12 flex-1">
                {/* Image Grid */}
                <div className="grid grid-cols-3 gap-5">
                  <div className="col-span-2 relative aspect-[16/10] rounded-2xl overflow-hidden shadow-2xl ring-1 ring-black/5">
                    <img
                      src={images[0]}
                      alt="Primary View"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-5 left-5 bg-black/60 backdrop-blur-xl px-4 py-1.5 rounded-lg text-white text-[10px] font-bold uppercase tracking-widest border border-white/10">
                      Primary External View
                    </div>
                  </div>
                  <div className="flex flex-col gap-5">
                    <div className="flex-1 rounded-2xl overflow-hidden shadow-lg ring-1 ring-black/5">
                      <img
                        src={images[1]}
                        className="w-full h-full object-cover"
                        alt="View 2"
                      />
                    </div>
                    <div className="flex-1 rounded-2xl overflow-hidden shadow-lg ring-1 ring-black/5">
                      <img
                        src={images[2]}
                        className="w-full h-full object-cover"
                        alt="View 3"
                      />
                    </div>
                  </div>
                </div>

                {/* Technical Specifications */}
                <section>
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-2 h-8 bg-[#fbbf24] rounded-full shadow-[0_0_15px_rgba(251,191,36,0.5)]" />
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                      Technical Specifications
                    </h3>
                  </div>
                  <div className="grid grid-cols-3 gap-5">
                    {[
                      {
                        label: "Make & Model",
                        value: `${carData?.specs?.make} ${carData?.specs?.model}`,
                        icon: "🚗",
                      },
                      {
                        label: "Year",
                        value: carData?.specs?.year,
                        icon: "📅",
                      },
                      {
                        label: "Fuel Type",
                        value: carData?.specs?.fuelType,
                        icon: "⛽",
                      },
                      {
                        label: "Mileage",
                        value: carData?.specs?.mileage,
                        icon: "⏲️",
                      },
                      {
                        label: "Transmission",
                        value: carData?.transmission,
                        icon: "⚙️",
                      },
                      {
                        label: "Color",
                        value: carData?.specs?.color,
                        icon: "🎨",
                      },
                      {
                        label: "Body Architecture",
                        value: carData?.bodyType,
                        icon: "🚙",
                      },
                      {
                        label: "Owner Serial",
                        value: "First Owner",
                        icon: "👤",
                      },
                      { label: "Reg. State", value: "Delhi", icon: "📍" },
                    ].map((spec, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-4 p-5 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 transition-all group"
                      >
                        <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
                          {spec.icon}
                        </div>
                        <div>
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.15em] mb-0.5">
                            {spec.label}
                          </p>
                          <p className="text-sm font-bold text-slate-900">
                            {spec.value || "Verifying..."}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </div>

              {/* Page 1 Footer */}
              <div className="px-10 py-6 border-t border-slate-100 flex justify-between items-center bg-slate-50/30">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Page 01 — Overview
                </span>
                <span className="text-[10px] font-bold text-[#fbbf24] uppercase tracking-widest">
                  AutoCarBazaar Official Report
                </span>
              </div>
            </div>

            {/* PAGE 2 */}
            <div className="bg-white w-[210mm] min-h-[297mm] h-fit shadow-2xl relative overflow-hidden flex flex-col">
              <div className="p-12 space-y-12 flex-1">
                {/* Vehicle Description */}
                <section>
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-2 h-8 bg-[#fbbf24] rounded-full shadow-[0_0_15px_rgba(251,191,36,0.5)]" />
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                      Vehicle Narrative
                    </h3>
                  </div>
                  <div className="relative p-10 rounded-3xl bg-slate-50 border border-slate-100 italic text-slate-600 leading-loose text-base shadow-inner">
                    <div className="absolute top-6 right-8 text-slate-200 opacity-50">
                      <svg
                        className="w-16 h-16"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />
                      </svg>
                    </div>
                    <p className="relative z-10">{carData?.description}</p>
                  </div>
                </section>

                {/* Key Features */}
                <section>
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-2 h-8 bg-[#fbbf24] rounded-full shadow-[0_0_15px_rgba(251,191,36,0.5)]" />
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                      Premium Features & Highlights
                    </h3>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {carData?.features?.map((f: string, i: number) => (
                      <div
                        key={i}
                        className="flex items-center gap-4 p-5 rounded-2xl border border-slate-100 bg-white shadow-sm hover:shadow-md transition-shadow"
                      >
                        <div className="w-6 h-6 rounded-full border-[3px] border-[#fbbf24] flex items-center justify-center shrink-0">
                          <div className="w-2 h-2 bg-[#fbbf24] rounded-full" />
                        </div>
                        <span className="text-base font-bold text-slate-700">
                          {f}
                        </span>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Classifications */}
                <div className="pt-8">
                  <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] block mb-4">
                    Vehicle Classifications & Tags
                  </span>
                  <div className="flex flex-wrap gap-3">
                    {carData?.tags?.map((tag: string, i: number) => (
                      <span
                        key={i}
                        className="px-5 py-2 bg-slate-900 text-[#fbbf24] text-xs font-black rounded-xl uppercase tracking-widest shadow-xl shadow-slate-200"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Document Footer */}
              <div className="bg-[#0f172a] p-12 text-white relative mt-auto">
                <div className="flex justify-between items-end mb-10">
                  <div className="space-y-6">
                    <div className="flex items-center gap-3 text-[#fbbf24]">
                      <span className="text-3xl">🛡️</span>
                      <span className="text-lg font-black uppercase tracking-widest">
                        Certified Quality Assured
                      </span>
                    </div>
                    <div className="grid grid-cols-1 gap-3 text-sm text-white/50 font-medium">
                      <div className="flex items-center gap-3">
                        <span className="text-[#fbbf24]">📞</span> +91 XXX XXX
                        XXXX
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[#fbbf24]">✉️</span>{" "}
                        support@autocarbazaar.com
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[#fbbf24]">📍</span> New Delhi -
                        HQ, India
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-white/30 text-[10px] font-bold uppercase tracking-[0.3em] mb-2">
                      Report Valid Until
                    </p>
                    <p className="text-xl font-black mb-4">
                      {new Date(
                        Date.now() + 30 * 24 * 60 * 60 * 1000,
                      ).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                    <div className="bg-white/5 border border-white/10 rounded-xl p-4 inline-block">
                      <p className="text-[#fbbf24] text-xs font-black uppercase tracking-widest">
                        REF ID: {carData?._id?.slice(-8).toUpperCase()}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="pt-10 border-t border-white/5 text-center text-[10px] text-white/20 uppercase tracking-[0.4em] font-medium">
                  © 2026 AutoCarBazaar Digital. Verified Vehicle Intelligence
                  Report.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Bar (Static) */}
        <div className="bg-slate-50 px-8 py-5 border-t border-slate-200 flex justify-end gap-4">
          <button
            onClick={onClose}
            className="px-8 py-3 text-slate-600 font-bold hover:text-slate-900 transition-colors"
          >
            Cancel Preview
          </button>
          <button
            onClick={handleDownload}
            disabled={isGenerating}
            className="px-10 py-3 bg-slate-900 hover:bg-black text-white rounded-xl font-bold transition-all shadow-xl shadow-slate-200 flex items-center gap-3 hover:-translate-y-0.5"
          >
            <Download className="w-5 h-5" />
            {isGenerating ? "Exporting PDF..." : "Export Official PDF"}
          </button>
        </div>
      </div>
    </div>
  );
}
