"use client";
import React from "react";
import Link from "next/link";

export default function HeroCTA() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10 dark:from-[#0b2138] dark:to-[#071022]" />

      <div className="container mx-auto px-6 py-16 md:py-24 max-w-6xl">
        <div className="relative z-10 flex items-center justify-center">
          <div className="text-center max-w-3xl">
            <h1 className="text-3xl md:text-5xl font-extrabold leading-tight text-slate-900 dark:text-white drop-shadow-md">
              Ready to Find Your Dream Car?
            </h1>
            <p className="mt-4 text-lg md:text-xl text-slate-700 dark:text-white/80">
              Join thousands of satisfied customers who found their perfect
              vehicle through our platform.
            </p>

            <div className="mt-8">
              <Link
                href="/cars"
                className="inline-flex items-center gap-3 bg-slate-900 text-white dark:bg-white dark:text-slate-900 px-6 py-3 rounded-full shadow-lg hover:shadow-2xl transform transition duration-200 hover:-translate-y-1 focus:outline-none focus:ring-4 dark:focus:ring-white/20 focus:ring-slate-900/20"
              >
                View All Cars
              </Link>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0); }
        }
      `}</style>
    </section>
  );
}
