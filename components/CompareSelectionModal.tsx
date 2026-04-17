"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Input } from "./ui/input";
import axios from "axios";
import { Search } from "lucide-react";
import { useCompareStore, CompareCar } from "@/hooks/use-compare-store";
import Image from "next/image";
import Link from "next/link";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CompareSelectionModal({ open, onOpenChange }: Props) {
  const [query, setQuery] = useState("");
  const [allCars, setAllCars] = useState<CompareCar[]>([]);
  const [loading, setLoading] = useState(false);
  const { addCar, selectedCars } = useCompareStore();

  useEffect(() => {
    if (!open) return;

    const fetchCars = async () => {
      setLoading(true);
      try {
        const { data } = await axios.get("/api/cars?limit=50");

        const mapped = data.cars.map((c: any) => {
          const firstImage = c.images?.[0] || c.image;
          const validImg =
            typeof firstImage === "string" && firstImage.trim() !== ""
              ? firstImage
              : "/placeholder.svg";
          return {
            id: c._id || c.id,
            image: validImg,
            title: c.title,
            price: c.price,
          };
        });

        setAllCars(mapped);
      } catch (err) {
        console.error("Error fetching cars to compare", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCars();
  }, [open]);

  const results = useMemo(() => {
    // Filter out already selected
    const filtered = allCars.filter(
      (car: CompareCar) => !selectedCars.some((sel) => sel.id === car.id),
    );

    if (!query) return filtered;

    const lowerQ = query.toLowerCase();
    return filtered.filter((car) => car.title.toLowerCase().includes(lowerQ));
  }, [query, allCars, selectedCars]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Search Cars to Compare</DialogTitle>
        </DialogHeader>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            placeholder="Search by make, model..."
            className="pl-10"
          />
        </div>

        <div className="max-h-100 overflow-y-auto space-y-4">
          {loading ? (
            <div className="text-center py-4">Loading...</div>
          ) : results.length === 0 ? (
            <div className="text-center py-4 text-gray-500">No cars found</div>
          ) : (
            results.map((car) => (
              <div
                key={car.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 transition"
              >
                <div className="flex items-center gap-4">
                  <div className="relative w-16 h-12 rounded-md overflow-hidden">
                    <Image
                      src={car.image || "/placeholder.svg"}
                      alt={car.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm">{car.title}</h4>
                    <p className="text-gray-500 text-xs">${car.price}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    href={`/car/${car.id}`}
                    onClick={() => onOpenChange(false)}
                    className="px-3 py-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-md text-sm font-medium transition"
                  >
                    View Car
                  </Link>
                  <button
                    onClick={() => {
                      addCar(car);
                      onOpenChange(false); // Close modal
                    }}
                    className="px-4 py-2 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/30 text-sm font-medium transition"
                  >
                    Select
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
