"use client";

import React, { useEffect, useState, useCallback } from "react";
import CarCard from "./CarCard";
import axios from "axios";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import CarSpinner from "./CarSpinner";

type Car = {
  id?: string;
  _id?: string;
  image: string;
  title: string;
  price: string | number;
  year?: string | number;
  transmission?: string;
  fuel?: string;
  tags?: string[];
};

type AllCarsProps = {
  searchQuery?: string;
  company?: string[];
  yearFrom?: string;
  yearTo?: string;
  minPrice?: string;
  maxPrice?: string;
  transmission?: string;
  fuel?: string;
};

export default function AllCars({
  searchQuery = "",
  company = [],
  yearFrom = "",
  yearTo = "",
  minPrice = "",
  maxPrice = "",
  transmission = "",
  fuel = "",
}: AllCarsProps) {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Animation states
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [slideDirection, setSlideDirection] = useState<"left" | "right" | "">(
    "",
  );

  const buildParams = useCallback(
    (pageNum: number) => {
      const params = new URLSearchParams();
      params.append("page", pageNum.toString());
      params.append("limit", "6");
      if (searchQuery) params.append("searchQuery", searchQuery);
      (company || []).forEach((c) => params.append("company", c));
      if (yearFrom) params.append("yearFrom", yearFrom);
      if (yearTo) params.append("yearTo", yearTo);
      if (minPrice) params.append("minPrice", minPrice);
      if (maxPrice) params.append("maxPrice", maxPrice);
      if (transmission) params.append("transmission", transmission);
      if (fuel) params.append("fuel", fuel);
      return params;
    },
    [
      searchQuery,
      company,
      yearFrom,
      yearTo,
      minPrice,
      maxPrice,
      transmission,
      fuel,
    ],
  );

  const fetchWindow = useCallback(
    async (pageNum: number) => {
      try {
        setLoading(true);
        const params = buildParams(pageNum);
        const url = `/api/cars?${params.toString()}`;
        const res = await axios.get(url);

        setCars(res.data.cars);
        setHasMore(res.data.hasMore);
        setPage(pageNum);
      } catch (err) {
        console.error("Error fetching cars window", err);
        setCars([]);
      } finally {
        setLoading(false);
      }
    },
    [buildParams],
  );

  const handleNext = async () => {
    if (!hasMore || loading || isTransitioning) return;

    setSlideDirection("left");
    setIsTransitioning(true);

    // Reliable transition: Wait for both animation-out and data fetch
    const startTime = Date.now();
    try {
      // Start fetching immediately
      const fetchPromise = fetchWindow(page + 1);

      // Ensure exit animation has time to show
      await new Promise((resolve) => setTimeout(resolve, 450));
      await fetchPromise;

      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 550 - elapsed);
      await new Promise((resolve) => setTimeout(resolve, remaining));

      setSlideDirection("right"); // Prep for enter from right
      // Double requestAnimationFrame or small timeout to bypass paint batching
      setTimeout(() => {
        setIsTransitioning(false);
      }, 70);
    } catch (err) {
      setIsTransitioning(false);
    }
  };

  const handlePrev = async () => {
    if (page === 1 || loading || isTransitioning) return;

    setSlideDirection("right"); // Exit to right
    setIsTransitioning(true);

    const startTime = Date.now();
    try {
      const fetchPromise = fetchWindow(page - 1);

      await new Promise((resolve) => setTimeout(resolve, 450));
      await fetchPromise;

      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 550 - elapsed);
      await new Promise((resolve) => setTimeout(resolve, remaining));

      setSlideDirection("left"); // Prep for enter from left
      setTimeout(() => {
        setIsTransitioning(false);
      }, 70);
    } catch (err) {
      setIsTransitioning(false);
    }
  };

  // Initial load and filter tracking
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchWindow(1);
    }, 400); // Debounce for filters
    return () => clearTimeout(timer);
  }, [fetchWindow]);

  return (
    <section className="py-8 mt-16 mx-4 relative min-h-[600px]">
      <div className="container mx-auto px-4 relative">
        <div className="flex items-center justify-between mb-10">
          <h2 className="pb-1 relative inline-block text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
            Browse Cars
            <span className="absolute left-0 -bottom-1 h-1 w-24 rounded-full bg-orange-500"></span>
          </h2>
          <div className="text-sm font-medium text-orange-500 bg-orange-50/50 dark:bg-orange-950/20 px-4 py-2 rounded-full border border-orange-100 dark:border-orange-900/30">
            Window {page}
          </div>
        </div>

        {/* Navigation Wrapper */}
        <div className="relative group max-w-7xl mx-auto">
          {/* Robust Viewport Frame */}
          <div className="relative rounded-[2.5rem] bg-white dark:bg-slate-900 p-2 border border-gray-100 dark:border-slate-800 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.14)] dark:shadow-[0_32px_64px_-12px_rgba(0,0,0,0.4)] overflow-hidden">
            {/* Background Loading Progress Bar */}
            <div
              className={`absolute top-0 left-0 h-1 bg-orange-500 z-50 transition-all duration-700 ease-out
                ${isTransitioning ? "w-full opacity-100" : "w-0 opacity-0"}
              `}
            />

            <div className="relative bg-gray-50/30 dark:bg-slate-950/20 rounded-[2.3rem] p-6 lg:p-10 min-h-[500px] overflow-hidden flex items-center justify-center">
              {/* Dynamic 3D Light Source Effect */}
              <div
                className={`absolute inset-0 pointer-events-none transition-opacity duration-700 bg-[radial-gradient(circle_at_var(--light-x,50%)_var(--light-y,50%),rgba(249,115,22,0.08),transparent_70%)]
                  ${isTransitioning ? "opacity-100" : "opacity-0"}
                `}
                style={
                  {
                    "--light-x": slideDirection === "left" ? "0%" : "100%",
                    "--light-y": "50%",
                  } as React.CSSProperties
                }
              />

              {/* Left Arrow Button (integrated into frame) */}
              <button
                onClick={handlePrev}
                disabled={page === 1 || loading || isTransitioning}
                className={`absolute left-4 top-1/2 cursor-pointer -translate-y-1/2 z-30 p-4 rounded-2xl shadow-xl transition-all duration-500 transform
                  ${page === 1 ? "opacity-0 -translate-x-10 scale-75 pointer-events-none" : "opacity-100 translate-x-0 scale-100 hover:scale-110 active:scale-90"}
                  bg-white/90 dark:bg-slate-800/90 backdrop-blur-md border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-200 hover:border-orange-500 hover:text-orange-500 hover:shadow-orange-500/20
                `}
              >
                <ChevronLeft className="h-6 w-6" />
              </button>

              {/* Right Arrow Button (integrated into frame) */}
              <button
                onClick={handleNext}
                disabled={!hasMore || loading || isTransitioning}
                className={`absolute right-4 top-1/2 cursor-pointer -translate-y-1/2 z-30 p-4 rounded-2xl shadow-xl transition-all duration-500 transform
                  ${!hasMore ? "opacity-0 translate-x-10 scale-75 pointer-events-none" : "opacity-100 translate-x-0 scale-100 hover:scale-110 active:scale-90"}
                  bg-white/90 dark:bg-slate-800/90 backdrop-blur-md border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-200 hover:border-orange-500 hover:text-orange-500 hover:shadow-orange-500/20
                `}
              >
                <ChevronRight className="h-6 w-6" />
              </button>

              {/* Transitioning Content Container (Enhanced 3D) */}
              <div
                className="w-full relative min-h-[500px]"
                style={{ perspective: "2000px", transformStyle: "preserve-3d" }}
              >
                <div
                  className={`w-full grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 transition-all duration-700 ease-[cubic-bezier(0.2,0,0,1)]
                    ${isTransitioning && slideDirection === "left" ? "opacity-0 [transform:translateX(-100%)_rotateY(25deg)_translateZ(-200px)] blur-lg" : ""}
                    ${isTransitioning && slideDirection === "right" ? "opacity-0 [transform:translateX(100%)_rotateY(-25deg)_translateZ(-200px)] blur-lg" : ""}
                    ${!isTransitioning ? "opacity-100 [transform:translateX(0)_rotateY(0)_translateZ(0)] blur-0" : ""}
                  `}
                >
                  {loading && !isTransitioning ? (
                    <div className="col-span-full py-20 flex items-center justify-center">
                      <CarSpinner message="Refreshing collection..." />
                    </div>
                  ) : cars.length === 0 ? (
                    <div
                      className="col-span-full py-32 text-center"
                      style={{ transform: "translateZ(50px)" }}
                    >
                      <div className="inline-flex p-6 rounded-full bg-orange-50 dark:bg-orange-950/20 text-orange-500 mb-6 group-hover:scale-110 transition-transform duration-500 shadow-inner">
                        <Loader2 className="h-10 w-10 animate-pulse text-orange-200" />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        No vehicles found
                      </h3>
                      <p className="text-gray-500 dark:text-gray-400 mt-2 max-w-md mx-auto">
                        We couldn't find any cars matching your current filters.
                        Try relaxing your search criteria.
                      </p>
                    </div>
                  ) : (
                    cars.map((c, i) => (
                      <div
                        key={c.id || i}
                        className="w-full flex justify-center transition-all duration-700 ease-out"
                        style={{
                          transitionDelay: isTransitioning
                            ? `${i * 30}ms`
                            : `${(cars.length - i) * 30}ms`,
                          transform: !isTransitioning
                            ? "translateZ(0)"
                            : "translateZ(-50px)",
                        }}
                      >
                        <CarCard cars={c} />
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Pagination Indicators */}
        {cars.length > 0 && (
          <div className="flex flex-col items-center mt-16 space-y-4">
            <div className="flex items-center gap-3">
              <span
                className={`h-1.5 rounded-full transition-all duration-300 ${page > 1 ? "w-3 bg-gray-300 dark:bg-slate-700" : "w-0 opacity-0"}`}
              />
              <div className="h-2.5 w-12 rounded-full bg-orange-500 shadow-lg shadow-orange-500/30" />
              <span
                className={`h-1.5 rounded-full transition-all duration-300 ${hasMore ? "w-3 bg-gray-300 dark:bg-slate-700" : "w-0 opacity-0"}`}
              />
            </div>
            <p className="text-xs uppercase tracking-widest font-bold text-gray-400 dark:text-gray-600">
              {page === 1
                ? "First Collection"
                : !hasMore
                  ? "End of Catalog"
                  : "Browsing Catalog"}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
