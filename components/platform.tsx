"use client";
import React from "react";

export default function Platform() {
  const cards = [
    {
      title: "Verified Listings",
      desc: "Every car is verified by our team so you can buy with confidence.",
      icon: (
        <svg
          className="w-8 h-8 text-primary"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M12 1l3 6 6 .5-4.5 3.5L19 18l-7-4-7 4 1.5-7-4.5-3.5L9 7 12 1z"
            stroke="currentColor"
            strokeWidth="0.5"
          />
        </svg>
      ),
    },
    {
      title: "Smart Matches",
      desc: "AI-powered recommendations surface the best cars for your needs.",
      icon: (
        <svg
          className="w-8 h-8 text-primary"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M3 12h6l3-9 3 18 3-9h6"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
    },
    {
      title: "Secure Payments",
      desc: "Payments protected with end-to-end encryption and buyer protection.",
      icon: (
        <svg
          className="w-8 h-8 text-primary"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M12 17c3 0 5-2 5-5V8a5 5 0 10-10 0v4c0 3 2 5 5 5z"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
    },
  ];

  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-1">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Why choose our platform
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              We make buying and selling cars simple, safe and smart — combining
              verified listings, AI-powered matching, and secure payments so you
              spend less time searching and more time driving.
            </p>
          </div>

          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-6">
            {cards.map((c) => (
              <div
                key={c.title}
                className="bg-white dark:bg-slate-900 rounded-lg border border-gray-100 dark:border-slate-700 p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-4">
                  <div className="shrink-0 flex items-center justify-center w-12 h-12 bg-gray-100 dark:bg-slate-800 rounded-lg">
                    {c.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      {c.title}
                    </h3>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                      {c.desc}
                    </p>
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
