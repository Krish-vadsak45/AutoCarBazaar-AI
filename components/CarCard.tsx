"use client";

import Image from "next/image";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Heart as HeartIcon } from "lucide-react";
import { useSession } from "next-auth/react";
import axios from "axios";
import { toast } from "react-toastify";
import { useEffect } from "react";

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
  status?: "available" | "unavailable";
};

type CarCardProps = {
  cars: Car;
  onView?: () => void;
};

export default function CarCard({ cars, onView }: CarCardProps) {
  const router = useRouter();
  const {
    id,
    _id,
    image,
    title,
    price,
    year,
    transmission,
    fuel,
    tags = [],
    status = "available",
  } = cars;
  const [fav, setFav] = useState(false);
  const { data: session } = useSession();

  // Check initial saved status
  useEffect(() => {
    const checkStatus = async () => {
      if (!session) return;
      try {
        const { data } = await axios.get("/api/saved-cars");
        const currentCarId = (id || _id)?.toString();
        const isSaved = Array.isArray(data) && data.some((c: any) => c?._id?.toString() === currentCarId);
        setFav(isSaved);
      } catch (err) {
        console.error("Error checking fav status", err);
      }
    };
    checkStatus();
  }, [session, id, _id]);

  // Handle toggling save status
  const handleToggleSave = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!session) {
      toast.error("Please login to save cars");
      router.push("/login");
      return;
    }

    try {
      const carId = (id || _id)?.toString();
      const { data } = await axios.post("/api/saved-cars", { carId });
      setFav(data.action === "saved");
      toast.success(data.message);
    } catch (error) {
      console.error("Error toggling save status:", error);
      toast.error("Failed to update collection");
    }
  };

  return (
    <article className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-xl shadow-md dark:shadow-none overflow-hidden border border-gray-100 dark:border-slate-700 transform-gpu transition-transform duration-300 transition-shadow hover:scale-105 hover:shadow-xl dark:hover:shadow-[0_30px_80px_rgba(6,182,212,0.12),0_8px_30px_rgba(6,182,212,0.08),0_0_0_12px_rgba(6,182,212,0.06)] dark:hover:ring-1 dark:hover:ring-cyan-400/25 group will-change-transform">
      <div className="relative w-full h-52 overflow-hidden">
        {image ? (
          <Image
            src={image}
            alt={title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-gray-100 dark:bg-slate-800 flex items-center justify-center text-sm text-gray-500">
            No image
          </div>
        )}
        <button
          aria-label={fav ? "Remove from saved" : "Save car"}
          onClick={handleToggleSave}
          className="absolute top-3 right-3 bg-white/90 dark:bg-slate-800/70 rounded-full p-2 shadow-sm hover:scale-110 transform transition-transform z-10"
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
        <div className="flex justify-between items-start mb-1">
          <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100 transition-colors duration-200 group-hover:text-primary leading-tight">
            {title}
          </h3>
          {status === "unavailable" && (
            <Badge variant="destructive" className="ml-2 text-[10px] px-1.5 py-0 h-4">
              Sold Out
            </Badge>
          )}
        </div>
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
            onClick={() => {
              if (onView) return onView();
              const carId = id ?? _id;
              if (carId) router.push(`/car/${carId}`);
            }}
          >
            View Car
          </Button>
        </div>
      </div>
    </article>
  );
}
