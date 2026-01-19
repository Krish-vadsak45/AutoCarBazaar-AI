"use client";
import React, { useMemo, useState } from "react";
import Image from "next/image";

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

  // duplicate for seamless scrolling
  const items = useMemo(() => [...BRANDS, ...BRANDS], []);

  const duration = 18; // seconds for a full loop

  const marqueeStyle: React.CSSProperties = {
    display: "inline-flex",
    gap: "1.5rem",
    alignItems: "center",
    willChange: "transform",
    animation: `scroll ${duration}s linear infinite`,
    animationPlayState: paused ? "paused" : "running",
  };

  return (
    <section className="py-8 relative">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Browse by Make
          </h3>
          <a className="text-sm text-gray-600 dark:text-gray-300 hover:underline">
            View All &rarr;
          </a>
        </div>

        <div className="relative">
          {/* marquee viewport */}
          <div className="overflow-hidden">
            <div style={marqueeStyle} onMouseLeave={() => setPaused(false)}>
              {items.map((b, idx) => (
                <div
                  key={`${b.name}-${idx}`}
                  className="flex-shrink-0 w-40 text-center px-2"
                  onMouseEnter={() => setPaused(true)}
                  onMouseLeave={() => setPaused(false)}
                >
                  <div className="mx-auto w-28 h-28 rounded-lg flex items-center justify-center bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 shadow-sm overflow-hidden">
                    <Image
                      src={b.img}
                      alt={b.name}
                      width={112}
                      height={112}
                      className="object-contain"
                    />
                  </div>
                  <div className="mt-2 text-sm text-gray-700 dark:text-gray-200">
                    {b.name}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* left & right fades for low opacity at edges */}
          <div
            className="pointer-events-none absolute left-0 top-0 h-full w-20"
            style={{
              background:
                "linear-gradient(90deg, rgba(0,0,0,0.85), transparent)",
            }}
          />
          <div
            className="pointer-events-none absolute right-0 top-0 h-full w-20"
            style={{
              background:
                "linear-gradient(270deg, rgba(0,0,0,0.85), transparent)",
            }}
          />
        </div>
      </div>

      <style jsx>{`
        @keyframes scroll {
          0% {
            transform: translateX(0%);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        @media (max-width: 640px) {
          .container > div > div > div > div {
            width: 140px;
          }
        }
      `}</style>
    </section>
  );
}
