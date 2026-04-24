'use client';
import React, { useState } from 'react';
import { Minus, Plus, MessageCircleQuestion } from 'lucide-react';

type Item = {
  q: string;
  a: string;
};

const items: Item[] = [
  {
    q: 'How do you verify listed cars?',
    a: 'Our team runs multi-point inspections, checks vehicle history reports, and verifies ownership documents before listing.',
  },
  {
    q: 'Can I get financing through the platform?',
    a: 'Yes — we partner with trusted lenders to surface financing options during checkout. Rates depend on your credit profile.',
  },
  {
    q: 'What protection do buyers have?',
    a: 'We offer buyer protection, including escrowed payments and a returns policy for eligible issues discovered within the inspection window.',
  },
  {
    q: 'How do AI-powered matches work?',
    a: 'Our models combine your preferences, past searches, and vehicle attributes to surface cars that fit your needs.',
  },
  {
    q: 'Can I schedule a test drive?',
    a: 'Yes — most sellers allow scheduling through the platform. After selecting a listing, choose a convenient time slot to request a test drive.',
  },
];

export default function Faq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (i: number) => {
    setOpenIndex((prev) => (prev === i ? null : i));
  };

  return (
    <section className="py-16 md:py-24 bg-gray-50/50 dark:bg-slate-950/50 relative overflow-hidden">
      {/* Decorative blurred background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-primary/10 dark:bg-primary/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="container mx-auto px-6 max-w-4xl relative z-10">
        <div className="flex flex-col gap-12">
          {/* Top Section: Heading */}
          <div className="flex flex-col items-center text-center pt-2">
            <div className="inline-flex items-center justify-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-6">
              <MessageCircleQuestion className="w-4 h-4" />
              <span>FAQs</span>
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-gray-900 dark:text-white leading-tight mb-4 tracking-tight">
              Got Questions? <span className="text-primary">We have answers.</span>
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed max-w-2xl">
              Everything you need to know about buying, selling, financing, and platform features on
              AutoCarBazaar.
            </p>
          </div>

          {/* Bottom Section: Accordions */}
          <div className="flex flex-col gap-4">
            {items.map((it, idx) => {
              const isOpen = openIndex === idx;

              return (
                <div
                  key={idx}
                  className={`group rounded-2xl border transition-all duration-300 overflow-hidden ${
                    isOpen
                      ? 'bg-white dark:bg-slate-900 border-primary/40 shadow-lg shadow-primary/5'
                      : 'bg-white/60 dark:bg-slate-900/60 border-gray-200 dark:border-slate-800 hover:border-primary/30 hover:bg-white dark:hover:bg-slate-900'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => toggle(idx)}
                    className="w-full flex items-center justify-between gap-4 px-6 pt-6 pb-5 text-left focus:outline-none"
                  >
                    <span
                      className={`text-lg transition-colors duration-300 ${isOpen ? 'text-primary font-bold' : 'text-gray-900 dark:text-gray-100 font-semibold group-hover:text-primary/90'}`}
                    >
                      {it.q}
                    </span>
                    <div
                      className={`shrink-0 w-9 h-9 flex items-center justify-center rounded-full transition-transform duration-300 ${isOpen ? 'bg-primary text-white rotate-180' : 'bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-gray-400 group-hover:bg-primary/10 group-hover:text-primary'}`}
                    >
                      {isOpen ? <Minus className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                    </div>
                  </button>

                  <div
                    className={`grid transition-all duration-300 ease-in-out ${
                      isOpen ? 'grid-rows-[1fr] opacity-100 pb-6' : 'grid-rows-[0fr] opacity-0'
                    }`}
                  >
                    <div className="overflow-hidden px-6">
                      <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{it.a}</p>
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
