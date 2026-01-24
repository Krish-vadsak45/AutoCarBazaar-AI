"use client";
import React, { useMemo, useState } from "react";
import Image from "next/image";
import { Button } from "./ui/button";

export default function Company() {
  const [paused, setPaused] = useState(false);

  const BRANDS = [
    { name: "Hyundai", img: "/hyundai.webp" },
    { name: "Honda", img: "/honda.webp" },
    { name: "BMW", img: "/bmw.webp" },
    { name: "Tata", img: "/tata.webp" },
    { name: "Mahindra", img: "/mahindra.webp" },
    { name: "Ford", img: "/ford.webp" },
  ];

  // duplicate brands for seamless infinite scroll
  const items = useMemo(() => [...BRANDS, ...BRANDS], []);

  const duration = 14;

  return (
    <section className="py-8 mt-10 mx-8">
      <div className="container mx-auto px-4">
        {/* HEADER */}
        <div className="flex items-center justify-between mb-10">
          <h2 className="relative inline-block text-2xl sm:text-3xl font-semibold text-gray-900 dark:text-gray-100">
            Featured Cars
            <span className="absolute left-0 -bottom-1 h-1 w-32 rounded-full bg-linear-to-r from-orange-500 to-orange-500" />
          </h2>

          <Button
            variant="ghost"
            className="hidden sm:inline-flex items-center gap-2"
          >
            View All Company
          </Button>
        </div>

        {/* MARQUEE */}
        <div className="relative overflow-hidden px-6">
          {/* TRACK */}
          <div
            className="marquee-track relative z-0"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            style={{
              animationPlayState: paused ? "paused" : "running",
              animationDuration: `${duration}s`,
            }}
          >
            {items.map((b, i) => (
              <div
                key={`${b.name}-${i}`}
                className="mx-6 flex-shrink-0 text-center w-40"
              >
                <div className="w-36 h-28 mx-auto bg-white dark:bg-slate-800 rounded-lg border shadow-sm flex items-center justify-center">
                  <Image
                    src={b.img}
                    alt={b.name}
                    width={112}
                    height={112}
                    className="object-contain"
                  />
                </div>
                <p className="mt-2 text-sm text-gray-700 dark:text-gray-200">
                  {b.name}
                </p>
              </div>
            ))}
          </div>

          {/* LEFT FADE */}
          <div
            className="pointer-events-none absolute left-0 top-0 h-full w-24 z-10"
            style={{
              background:
                "linear-gradient(to right, rgba(0,0,0,0.45), rgba(0,0,0,0))",
            }}
          />

          {/* RIGHT FADE */}
          <div
            className="pointer-events-none absolute right-0 top-0 h-full w-24 z-10"
            style={{
              background:
                "linear-gradient(to left, rgba(0,0,0,0.45), rgba(0,0,0,0))",
            }}
          />
        </div>
      </div>

      {/* CSS */}
      <style jsx>{`
        .marquee-track {
          display: flex;
          width: max-content;
          animation: scroll linear infinite;
        }

        @keyframes scroll {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(-50%);
          }
        }
      `}</style>
    </section>
  );
}
