"use client";

import Image from "next/image";
import React, { useState } from "react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Heart as HeartIcon } from "lucide-react";

type Car = {
  image: string;
  title: string;
  price: string | number;
  year?: string | number;
  transmission?: string;
  fuel?: string;
  tags?: string[];
};

type CarCardProps = {
  cars: Car;
  onView?: () => void;
};

export default function CarCard({ cars, onView }: CarCardProps) {
  const { image, title, price, year, transmission, fuel, tags = [] } = cars;
  const [fav, setFav] = useState(false);

  return (
    <article className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-xl shadow-md dark:shadow-none overflow-hidden border border-gray-100 dark:border-slate-700 transform-gpu transition-transform duration-300 transition-shadow hover:scale-105 hover:shadow-xl dark:hover:shadow-[0_30px_80px_rgba(6,182,212,0.12),0_8px_30px_rgba(6,182,212,0.08),0_0_0_12px_rgba(6,182,212,0.06)] dark:hover:ring-1 dark:hover:ring-cyan-400/25 group will-change-transform">
      <div className="relative w-full h-52 overflow-hidden">
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <button
          aria-label={fav ? "Remove from saved" : "Save car"}
          onClick={() => setFav((s) => !s)}
          className="absolute top-3 right-3 bg-white/90 dark:bg-slate-800/70 rounded-full p-2 shadow-sm hover:scale-110 transform transition-transform"
        >
          <HeartIcon
            className={`w-5 h-5 cursor-pointer ${
              fav
                ? "text-primary fill-primary"
                : "text-gray-600 dark:text-gray-300"
            }`}
          />
        </button>
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100 transition-colors duration-200 group-hover:text-primary">
          {title}
        </h3>
        <div className="mt-1 flex items-baseline justify-between">
          <div>
            <div className="text-primary font-bold text-lg">${price}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {year} • {transmission} • {fuel}
            </div>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {tags.map((t) => (
            <Badge
              key={t}
              variant="outline"
              className="text-xs bg-gray-100 dark:bg-slate-800"
            >
              {t}
            </Badge>
          ))}
        </div>

        <div className="mt-4">
          <Button
            variant="default"
            className="w-full bg-black text-white hover:opacity-95 transform transition-transform hover:-translate-y-0.5 cursor-pointer"
            onClick={onView}
          >
            View Car
          </Button>
        </div>
      </div>
    </article>
  );
}
