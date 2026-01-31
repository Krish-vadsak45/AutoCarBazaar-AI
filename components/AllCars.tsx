"use client";

import React, { useEffect, useState } from "react";
import CarCard from "./CarCard";
import { Button } from "./ui/button";
import axios from "axios";

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

  useEffect(() => {
    let mounted = true;

    // Debounce network calls when filters/search change
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        setLoading(true);

        const params = new URLSearchParams();
        if (searchQuery) params.append("searchQuery", searchQuery);
        (company || []).forEach((c) => params.append("company", c));
        if (yearFrom) params.append("yearFrom", yearFrom);
        if (yearTo) params.append("yearTo", yearTo);
        if (minPrice) params.append("minPrice", minPrice);
        if (maxPrice) params.append("maxPrice", maxPrice);
        if (transmission) params.append("transmission", transmission);
        if (fuel) params.append("fuel", fuel);

        const url = `/api/cars?${params.toString()}`;
        console.log("Fetching cars with URL:", url);
        const res = await axios.get(url, { signal: controller.signal });
        if (!mounted) return;
        setCars(res?.data?.cars ?? []);
      } catch (err) {
        if (mounted) setCars([]);
      } finally {
        if (mounted) setLoading(false);
      }
    }, 300);

    return () => {
      mounted = false;
      controller.abort();
      clearTimeout(timer);
    };
  }, [
    searchQuery,
    company,
    yearFrom,
    yearTo,
    minPrice,
    maxPrice,
    transmission,
    fuel,
  ]);

  return (
    <section className="py-8 mt-16 mx-8">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="mb-5 pb-1 relative inline-block text-2xl sm:text-3xl font-semibold text-gray-900 dark:text-gray-100">
            Browse Cars
            <span className="absolute left-0 -bottom-1 h-1 w-27 rounded-full bg-linear-to-r from-orange-500 to-orange-500"></span>
          </h2>
        </div>

        <div className="mb-4">
          <div className="text-sm text-muted-foreground">
            {loading ? "Loading cars..." : `${cars.length} total cars`}
          </div>
        </div>

        <div className="grid gap-3 place-items-center max-sm:w-full grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {loading ? (
            <div>Loading cars...</div>
          ) : cars.length === 0 ? (
            <div>No cars available.</div>
          ) : (
            cars.map((c, i) => <CarCard key={`${c.title}-${i}`} cars={c} />)
          )}
        </div>
      </div>
    </section>
  );
}
