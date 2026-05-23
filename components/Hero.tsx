'use client';

import React, { useEffect, useState } from 'react';

import CarCard from './CarCard';
import { Button } from './ui/button';

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
    fetch('/api/cars')
      .then((res) => res.json())
      .then((data) => {
        if (!mounted) {
          return;
        }
        setCars(data?.cars ?? []);
      })
      .catch(() => setCars([]))
      .finally(() => mounted && setLoading(false));

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <section className="py-8 mt-10 w-full">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
          <h2 className="pb-1 relative inline-block text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
            Featured Cars
            <span className="absolute left-0 -bottom-2 h-1 w-1/2 rounded-full bg-gradient-to-r from-orange-500 to-orange-600"></span>
          </h2>

          <Button
            variant="ghost"
            className="hidden sm:inline-flex items-center gap-2 hover:bg-orange-50 dark:hover:bg-orange-900/20 text-orange-600 dark:text-orange-400 font-medium"
          >
            View All Cars
          </Button>
        </div>

        <div className="grid gap-6 sm:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {loading ? (
            // Skeleton Loading State
            [...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-[320px] w-full rounded-2xl bg-gray-100 dark:bg-slate-800 animate-pulse"
              />
            ))
          ) : cars.length === 0 ? (
            <div className="col-span-full py-12 text-center bg-gray-50 dark:bg-slate-900 rounded-2xl border border-dashed border-gray-200 dark:border-slate-800">
              <p className="text-muted-foreground">No featured cars available at the moment.</p>
            </div>
          ) : (
            cars.slice(0, 4).map((c, i) => <CarCard key={`${c.title}-${i}`} cars={c} />)
          )}
        </div>

        <div className="mt-8 text-center sm:hidden">
          <Button
            variant="outline"
            className="w-full text-orange-600 border-orange-200 dark:border-orange-900/30 hover:bg-orange-50 dark:hover:bg-orange-900/20"
          >
            View All Cars
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Hero;
