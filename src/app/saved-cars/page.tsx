"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Heart,
  ArrowLeft,
  Trash2,
  ArrowUpDown,
  Car,
  Calendar,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import axios from "axios";
import { toast } from "react-toastify";

interface CarData {
  _id: string;
  title: string;
  price: number;
  image: string;
  images?: string[];
  transmission: string;
  bodyType: string;
  description: string;
  features: string[];
  createdAt: string;
}

export default function LikedCarsPage() {
  const [likedCars, setLikedCars] = useState<CarData[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<"recent" | "price-low" | "price-high">(
    "recent"
  );

  const fetchSavedCars = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get("/api/saved-cars");
      setLikedCars(data);
    } catch (error) {
      console.error("Failed to fetch saved cars", error);
      toast.error("Failed to load saved cars");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSavedCars();
  }, []);

  const getSortedCars = () => {
    const cars = [...likedCars];
    switch (sortBy) {
      case "price-low":
        return cars.sort((a, b) => a.price - b.price);
      case "price-high":
        return cars.sort((a, b) => b.price - a.price);
      case "recent":
      default:
        return cars.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
    }
  };

  const handleRemoveLike = async (carId: string) => {
    try {
      await axios.post("/api/saved-cars", { carId });
      setLikedCars((prev) => prev.filter((car) => car._id !== carId));
      toast.success("Removed from collection");
    } catch (error) {
      console.error("Failed to remove saved car", error);
      toast.error("Failed to remove car");
    }
  };

  const sortedCars = getSortedCars();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 pt-24 pb-12 transition-colors duration-300">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
          <div className="space-y-2">
            <Link
              href="/"
              className="inline-flex items-center text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors mb-2"
            >
              <ArrowLeft className="w-4 h-4 mr-1" /> Back to Explore
            </Link>
            <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight flex items-center gap-3">
              <span className="p-2 bg-red-50 dark:bg-red-900/20 rounded-xl text-red-500 dark:text-red-400">
                <Heart className="w-8 h-8 fill-current" />
              </span>
              Saved Collection
            </h1>
            <p className="text-gray-600 dark:text-gray-400 ml-1">
              You have{" "}
              <span className="font-bold text-primary dark:text-gray-200">
                {sortedCars.length}
              </span>{" "}
              vehicles saved for later
            </p>
          </div>

          {/* Sort Controls */}
          {sortedCars.length > 0 && (
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <ArrowUpDown className="h-4 w-4 text-gray-400" />
              </div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-primary/20 outline-none appearance-none cursor-pointer shadow-sm hover:border-gray-300 dark:hover:border-slate-700 transition-all"
              >
                <option value="recent">Recently Added</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>
          )}
        </div>

        {/* Content Area */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-[400px] bg-white dark:bg-slate-900 rounded-3xl animate-pulse shadow-sm border border-gray-100 dark:border-slate-800"
              />
            ))}
          </div>
        ) : sortedCars.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-900 rounded-3xl border-2 border-dashed border-gray-200 dark:border-slate-800 text-center"
          >
            <div className="p-6 bg-gray-50 dark:bg-slate-800/50 rounded-full mb-6">
              <Heart className="w-12 h-12 text-gray-300 dark:text-gray-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              No favorites yet
            </h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-8">
              Start exploring our collection and tap the heart icon to save the
              cars you love.
            </p>
            <Link href="/">
              <Button
                size="lg"
                className="rounded-xl px-8 font-semibold shadow-lg shadow-primary/25"
              >
                Browse Vehicles
              </Button>
            </Link>
          </motion.div>
        ) : (
          <>
            <motion.div
              layout
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12"
            >
              <AnimatePresence>
                {sortedCars.map((item) => (
                  <motion.div
                    layout
                    key={item._id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{
                      opacity: 0,
                      scale: 0.9,
                      transition: { duration: 0.2 },
                    }}
                    className="group relative bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-gray-200 dark:border-slate-800 shadow-sm hover:shadow-xl hover:border-primary/20 dark:hover:border-primary/20 transition-all duration-300"
                  >
                    {/* Image Section */}
                    <Link
                      href={`/car/${item._id}`}
                      className="block relative h-56 overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10 opacity-60 group-hover:opacity-40 transition-opacity" />
                      <img
                        src={item.image || (item.images && item.images[0])}
                        alt={item.title}
                        className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                      />
                      <div className="absolute top-4 left-4 z-20">
                        <Badge className="bg-white/90 dark:bg-slate-900/90 text-gray-900 dark:text-white backdrop-blur-sm border-0 shadow-lg hover:bg-white">
                          {item.bodyType}
                        </Badge>
                      </div>

                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          handleRemoveLike(item._id);
                        }}
                        className="absolute top-4 right-4 z-20 p-2.5 bg-white/10 hover:bg-red-500 text-white rounded-full backdrop-blur-md transition-all duration-300 shadow-lg group/btn border border-white/20"
                        title="Remove from favorites"
                      >
                        <Trash2 className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                      </button>

                      <div className="absolute bottom-4 left-4 z-20 text-white">
                        <p className="text-xs font-medium text-white/80 mb-1 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Added {new Date(item.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </Link>

                    {/* Details Section */}
                    <div className="p-6">
                      <div className="mb-4">
                        <Link
                          href={`/car/${item._id}`}
                          className="hover:text-primary transition-colors"
                        >
                          <h3 className="text-xl font-bold text-gray-900 dark:text-white line-clamp-1 mb-1">
                            {item.title}
                          </h3>
                        </Link>
                        <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                          <Car className="w-3.5 h-3.5" />
                          {item.transmission} Transmission
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2 mb-6">
                        {item.features?.slice(0, 3).map((feat, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] px-2.5 py-1 rounded-full bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 font-medium"
                          >
                            {feat}
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-slate-800">
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-0.5">
                            Price
                          </p>
                          <p className="text-2xl font-bold text-primary dark:text-blue-400">
                            ${item.price.toLocaleString()}
                          </p>
                        </div>
                        <Link href={`/car/${item._id}`}>
                          <Button
                            variant="outline"
                            size="sm"
                            className="rounded-xl border-gray-200 dark:border-slate-700 bg-transparent hover:bg-gray-50 dark:hover:bg-slate-800 text-gray-700 dark:text-gray-200 group/btn"
                          >
                            Details{" "}
                            <ExternalLink className="w-3.5 h-3.5 ml-2 opacity-60 group-hover/btn:opacity-100 transition-opacity" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
}
