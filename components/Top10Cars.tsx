"use client";

import { Heart as HeartIcon } from "lucide-react";
import React, { useState } from "react";
import { Button } from "./ui/button";

const cars = [
  {
    image: "/1.png",
    title: "Honda Civic",
    year: "2019",
    price: "10,000",
    transmission: "Automatic",
    fuel: "Gasoline",
  },
  {
    image: "/2.webp",
    title: "Toyota Corolla",
    year: "2020",
    price: "12,000",
    transmission: "Manual",
    fuel: "Gasoline",
  },
  {
    image: "/3.jpg",
    title: "Ford Mustang",
    year: "2018",
    price: "25,000",
    transmission: "Automatic",
    fuel: "Gasoline",
  },
  {
    image: "/4.jpg",
    title: "BMW 3 Series",
    year: "2017",
    price: "22,000",
    transmission: "Automatic",
    fuel: "Diesel",
  },
  {
    image: "/5.jpg",
    title: "Audi A4",
    year: "2018",
    price: "24,000",
    transmission: "Automatic",
    fuel: "Gasoline",
  },
  {
    image: "/6.jpg",
    title: "Hyundai Elantra",
    year: "2021",
    price: "14,000",
    transmission: "Automatic",
    fuel: "Gasoline",
  },
  {
    image: "/7.jpg",
    title: "Kia Seltos",
    year: "2022",
    price: "16,000",
    transmission: "Automatic",
    fuel: "Gasoline",
  },
  {
    image: "/8.jpg",
    title: "Mercedes C-Class",
    year: "2019",
    price: "28,000",
    transmission: "Automatic",
    fuel: "Diesel",
  },
  {
    image: "/9.jpg",
    title: "Volkswagen Polo",
    year: "2016",
    price: "8,000",
    transmission: "Manual",
    fuel: "Gasoline",
  },
  {
    image: "/10.jpg",
    title: "Nissan Altima",
    year: "2020",
    price: "15,000",
    transmission: "Automatic",
    fuel: "Gasoline",
  },
];

export default function Top10Cars() {
  const [favs, setFavs] = useState<Record<number, boolean>>({});
  const [active, setActive] = useState<number | null>(null);

  const toggleFav = (i: number) => {
    setFavs((prev) => ({ ...prev, [i]: !prev[i] }));
  };

  return (
    <section className="py-8 mx-6">
      <div className="container mx-auto">
        <h3 className="text-2xl font-semibold mb-6 text-gray-900 dark:text-gray-100">
          Top 10 sale cars
        </h3>

        <div className="grid grid-cols-5 gap-6">
          {cars.map((c, idx) => (
            <div
              key={c.title + idx}
              onMouseEnter={() => setActive(idx)}
              onMouseLeave={() => setActive(null)}
              className={`relative origin-bottom rounded-lg transform transition-all duration-300 will-change-transform overflow-visible ${
                active === idx ? "z-50 scale-110 -translate-y-3" : "z-10"
              }`}
            >
              {/* base card */}
              <div
                className={`w-full h-40 z-0 bg-gray-200 dark:bg-slate-800 rounded-lg overflow-hidden shadow-sm transform transition-transform duration-300 ${
                  active === idx ? "scale-105" : ""
                }`}
              >
                <img
                  src={c.image || "/placeholder.svg"}
                  alt={c.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-3">
                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {c.title}
                </div>
              </div>
              {/* Hover overlay - visible only when base image is hovered (non-interactive) */}
              <div
                className={`absolute left-1/2 bottom-0 -translate-x-1/2 transition-all duration-300 z-50 w-[380px] ${
                  active === idx
                    ? "translate-y-0 opacity-100 scale-100 pointer-events-auto"
                    : "translate-y-6 opacity-0 scale-95 pointer-events-none"
                }`}
              >
                <div className="rounded-lg overflow-hidden shadow-2xl bg-transparent">
                  {/* Top: full width image */}
                  <img
                    src={c.image || "/placeholder.svg"}
                    alt={c.title}
                    className="w-full h-44 object-cover block"
                  />

                  <div className="bg-white/95 dark:bg-slate-900 p-4">
                    {/* Buttons row */}
                    <div className="flex items-center gap-3">
                      <Button
                        variant="default"
                        className="flex-1 bg-black text-white hover:opacity-95 transform transition-transform hover:-translate-y-0.5"
                      >
                        View Car
                      </Button>

                      <button
                        aria-label={
                          favs[idx] ? "Remove from saved" : "Save car"
                        }
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFav(idx);
                        }}
                        className="w-10 h-10 flex items-center justify-center rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                      >
                        <HeartIcon
                          className={`w-5 h-5 ${favs[idx] ? "text-primary fill-primary" : "text-gray-600 dark:text-gray-300"}`}
                        />
                      </button>
                    </div>

                    {/* Name and price */}
                    <div className="mt-3 flex items-center justify-between">
                      <div className="font-semibold text-gray-900 dark:text-gray-100">
                        {c.title}
                      </div>
                      <div className="text-sm font-bold text-primary">
                        ${c.price}
                      </div>
                    </div>

                    {/* Features */}
                    <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                      {c.year} • {c.transmission} • {c.fuel}
                    </div>

                    {/* Description (clamped) */}
                    <p className="mt-3 text-sm text-gray-600 dark:text-gray-300 line-clamp-3">
                      A well maintained {c.title} with full service history and
                      low mileage. Includes recent servicing, clean interior,
                      and new tires for added value.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
