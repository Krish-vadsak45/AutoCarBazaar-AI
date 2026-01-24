"use client";

import React, { useEffect, useState } from "react";
import CarCard from "./CarCard";
import { Button } from "./ui/button";

type Car = {
  image: string;
  title: string;
  price: string | number;
  year?: string | number;
  transmission?: string;
  fuel?: string;
  tags?: string[];
};

const Hero = () => {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    fetch("/api/cars")
      .then((res) => res.json())
      .then((data) => {
        if (!mounted) return;
        setCars(data?.cars ?? []);
      })
      .catch(() => setCars([]))
      .finally(() => mounted && setLoading(false));

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <section className="py-8 mt-10 mx-8">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="mb-5 pb-1 relative inline-block text-2xl sm:text-3xl font-semibold text-gray-900 dark:text-gray-100">
            Featured Cars
            <span className="absolute left-0 -bottom-1 h-1 w-20 rounded-full bg-linear-to-r from-orange-500 to-orange-500"></span>
          </h2>

          <Button
            variant="ghost"
            className="hidden sm:inline-flex items-center gap-2 cursor-pointer"
          >
            View All Cars
          </Button>
        </div>

        <div className="grid gap-6 place-items-center max-sm:w-full grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {loading ? (
            <div>Loading cars...</div>
          ) : cars.length === 0 ? (
            <div>No cars available.</div>
          ) : (
            cars.map((c, i) => <CarCard key={`${c.title}-${i}`} cars={c} />)
          )}
        </div>

        <div className="mt-6 text-center sm:hidden">
          <Button variant="ghost" className="cursor-pointer">
            View All Cars
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Hero;
