"use client";

import { Heart as HeartIcon } from "lucide-react";
import React, { useState, useEffect } from "react";
import { Button } from "./ui/button";
import Link from "next/link";
import { toast } from "react-toastify"; // Assuming sonner is used based on your workspace
import axios from "axios";
import { useSession } from "next-auth/react";

interface Car {
  _id: string;
  image: string;
  images: string[];
  title: string;
  specs: {
    year?: number;
    fuelType?: string;
  };
  price: number;
  transmission?: string;
}

export default function Top10Cars() {
  const { data: session } = useSession();
  const [cars, setCars] = useState<Car[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [favs, setFavs] = useState<Record<string, boolean>>({});
  const [active, setActive] = useState<number | null>(null);

  useEffect(() => {
    const fetchTopCars = async () => {
      try {
        const res = await fetch("/api/cars/top10");
        if (!res.ok) throw new Error("Failed to fetch cars");
        const data = await res.json();
        setCars(data);
      } catch (error) {
        console.error("Error fetching top 10 cars:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTopCars();
  }, []);

  useEffect(() => {
    const fetchSavedStatus = async () => {
      if (!session) return;
      try {
        const { data } = await axios.get("/api/saved-cars");
        const savedMap: Record<string, boolean> = {};
        data.forEach((savedCar: any) => {
          savedMap[savedCar._id] = true;
        });
        setFavs(savedMap);
      } catch (error) {
        console.error("Error fetching saved status:", error);
      }
    };
    fetchSavedStatus();
  }, [session]);

  const toggleFav = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (!session) {
      toast.error("Please sign in to save cars");
      return;
    }

    // Optimistic UI update
    const isSavedCurrently = !!favs[id];
    setFavs((prev) => ({ ...prev, [id]: !isSavedCurrently }));

    try {
      const { data } = await axios.post("/api/saved-cars", { carId: id });
      // Ensure state matches server response
      setFavs((prev) => ({ ...prev, [id]: data.action === "saved" }));
      toast.success(data.message);
    } catch (error) {
      console.error(error);
      // Revert optimistic update
      setFavs((prev) => ({ ...prev, [id]: isSavedCurrently }));
      toast.error("Failed to update saved status");
    }
  };

  if (isLoading) {
    return (
      <section className="py-8 mx-6">
        <div className="container mx-auto">
          <h3 className="text-2xl font-semibold mb-6 text-gray-900 dark:text-gray-100">
            Top 10 sale cars
          </h3>
          <div className="flex items-center justify-center min-h-[160px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </div>
      </section>
    );
  }

  if (cars.length === 0) {
    return null;
  }

  return (
    <section className="py-8 mx-6">
      <div className="container mx-auto">
        <h3 className="text-2xl font-semibold mb-6 text-gray-900 dark:text-gray-100">
          Top 10 sale cars
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {cars.map((c, idx) => (
            <div
              key={c._id || idx}
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
                  src={c.images?.[0] || c.image || "/placeholder.svg"}
                  alt={c.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-3">
                <div className="text-sm font-medium text-gray-900 dark:text-gray-100 line-clamp-1">
                  {c.title}
                </div>
              </div>
              {/* Hover overlay - visible only when base image is hovered (non-interactive) */}
              <div
                className={`absolute left-1/2 bottom-0 -translate-x-1/2 transition-all duration-300 z-50 w-[300px] sm:w-[380px] ${
                  active === idx
                    ? "translate-y-0 opacity-100 scale-100 pointer-events-auto"
                    : "translate-y-6 opacity-0 scale-95 pointer-events-none"
                }`}
              >
                <div className="rounded-lg overflow-hidden shadow-2xl bg-transparent">
                  {/* Top: full width image */}
                  <img
                    src={c.images?.[0] || c.image || "/placeholder.svg"}
                    alt={c.title}
                    className="w-full h-44 object-cover block"
                  />

                  <div className="bg-white/95 dark:bg-slate-900 p-4">
                    {/* Buttons row */}
                    <div className="flex items-center gap-3">
                      <Link href={`/car/${c._id}`} className="flex-1">
                        <Button
                          variant="default"
                          className="w-full bg-black text-white hover:opacity-95 transform transition-transform hover:-translate-y-0.5"
                        >
                          View Car
                        </Button>
                      </Link>

                      <button
                        title={favs[c._id] ? "Remove from saved" : "Save car"}
                        onClick={(e) => toggleFav(c._id, e)}
                        className="w-10 h-10 flex shrink-0 items-center justify-center rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                      >
                        <HeartIcon
                          className={`w-5 h-5 ${favs[c._id] ? "text-primary fill-primary" : "text-gray-600 dark:text-gray-300"}`}
                        />
                      </button>
                    </div>

                    {/* Name and price */}
                    <div className="mt-3 flex items-center justify-between gap-2">
                      <div className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                        {c.title}
                      </div>
                      <div className="text-sm font-bold text-primary whitespace-nowrap">
                        ${c.price?.toLocaleString() || 0}
                      </div>
                    </div>

                    {/* Features */}
                    <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 truncate">
                      {c.specs?.year || "N/A"} • {c.transmission || "N/A"} •{" "}
                      {c.specs?.fuelType || "N/A"}
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
