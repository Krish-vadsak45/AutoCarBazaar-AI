'use client';
import React from 'react';
import { CheckCircle, Zap, Shield } from 'lucide-react';

export default function Platform() {
  const cards = [
    {
      title: 'Verified Listings',
      desc: 'Every car is verified by our team so you can buy with confidence.',
      icon: (
        <CheckCircle className="w-8 h-8 text-primary transition-colors duration-300 group-hover:text-white" />
      ),
    },
    {
      title: 'Smart Matches',
      desc: 'AI-powered recommendations surface the best cars for your needs.',
      icon: (
        <Zap className="w-8 h-8 text-primary transition-colors duration-300 group-hover:text-white" />
      ),
    },
    {
      title: 'Secure Payments',
      desc: 'Payments protected with end-to-end encryption and buyer protection.',
      icon: (
        <Shield className="w-8 h-8 text-primary transition-colors duration-300 group-hover:text-white" />
      ),
    },
  ];

  return (
    <section className="py-12 md:py-16">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex flex-col gap-8 lg:gap-12">
          <div className="flex flex-col justify-center items-center">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Why choose our platform
            </h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-xl text-center">
              We make buying and selling cars simple, safe and smart — combining verified listings,
              AI-powered matching, and secure payments so you spend less time searching and more
              time driving.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {cards.map((c) => (
              <div
                key={c.title}
                role="button"
                tabIndex={0}
                aria-label={`Open ${c.title}`}
                className="group bg-white dark:bg-slate-900 rounded-lg border border-gray-100 dark:border-slate-700 p-6 md:p-8 shadow-sm transform transition-all duration-200 ease-in-out hover:shadow-lg hover:-translate-y-1 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/40"
              >
                <div className="flex items-start gap-4">
                  <div className="shrink-0 flex items-center justify-center w-12 h-12 bg-gray-100 dark:bg-slate-800 rounded-lg transform transition-all duration-500 ease-out group-hover:bg-primary/10 group-hover:scale-105 group-hover:-translate-y-1 group-hover:rotate-12">
                    {c.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      {c.title}
                    </h3>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{c.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
