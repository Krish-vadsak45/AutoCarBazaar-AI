"use client";
import React, { useRef, useState } from "react";
import { ChevronDown, Minus, Plus } from "lucide-react";

type Item = {
  q: string;
  a: string;
};

const items: Item[] = [
  {
    q: "How do you verify listed cars?",
    a: "Our team runs multi-point inspections, checks vehicle history reports, and verifies ownership documents before listing.",
  },
  {
    q: "Can I get financing through the platform?",
    a: "Yes — we partner with trusted lenders to surface financing options during checkout. Rates depend on your credit profile.",
  },
  {
    q: "What protection do buyers have?",
    a: "We offer buyer protection, including escrowed payments and a returns policy for eligible issues discovered within the inspection window.",
  },
  {
    q: "How do AI-powered matches work?",
    a: "Our models combine your preferences, past searches, and vehicle attributes to surface cars that fit your needs.",
  },
  {
    q: "Can I schedule a test drive?",
    a: "Yes — most sellers allow scheduling through the platform. After selecting a listing, choose a convenient time slot to request a test drive.",
  },
];

export default function Faq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const contentRefs = useRef<Array<HTMLDivElement | null>>([]);

  const toggle = (i: number) => {
    setOpenIndex((prev) => (prev === i ? null : i));
  };

  return (
    <section className="py-12 md:py-16">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="flex flex-col gap-6">
          <div className="text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100">
              Frequently Asked Questions
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              Quick answers about buying, payments, and how our AI helps.
            </p>
          </div>

          <div className="flex flex-col gap-4">
            {items.map((it, idx) => {
              const isOpen = openIndex === idx;
              const maxHeight = isOpen
                ? `${contentRefs.current[idx]?.scrollHeight ?? 0}px`
                : "0px";

              return (
                <div
                  key={it.q}
                  className="bg-white dark:bg-slate-900 rounded-lg border border-gray-100 dark:border-slate-700 shadow-sm"
                >
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={`faq-content-${idx}`}
                    onClick={() => toggle(idx)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        toggle(idx);
                      }
                    }}
                    className="w-full flex items-center justify-between gap-4 text-left px-5 py-1.5 md:py-3 focus:outline-none focus:ring-2 focus:ring-primary hover:bg-gray-50 dark:hover:bg-slate-800 rounded-lg transition-colors duration-150"
                  >
                    <span className="text-base md:text-lg font-medium text-gray-900 dark:text-gray-100">
                      {it.q}
                    </span>
                    {!isOpen ? (
                      <Plus
                        className={`w-5 h-5 text-gray-500 dark:text-gray-300 transform transition-transform duration-300 ${isOpen ? "rotate-180 text-primary" : ""}`}
                      />
                    ) : (
                      <Minus
                        className={`w-5 h-5 text-gray-500 dark:text-gray-300 transform transition-transform duration-300 ${isOpen ? "rotate-180 text-primary" : ""}`}
                      />
                    )}
                  </button>

                  <div
                    id={`faq-content-${idx}`}
                    ref={(el) => {
                      contentRefs.current[idx] = el;
                    }}
                    style={{ maxHeight }}
                    className="px-5 overflow-hidden transition-[max-height] duration-300 ease-out"
                  >
                    <div className="py-3 md:py-4 text-sm text-gray-600 dark:text-gray-300">
                      {it.a}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
