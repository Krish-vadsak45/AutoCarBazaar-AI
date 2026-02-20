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

interface CarData {
  _id: string;
  title: string;
  price: number;
  image: string;
  transmission: string;
  bodyType: string;
  description: string;
  features: string[];
}

interface LikedCarData {
  _id: string;
  carId: string;
  likedAt: string;
  car: CarData;
}

export default function LikedCarsPage() {
  const [likedCars, setLikedCars] = useState<LikedCarData[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<"recent" | "price-low" | "price-high">(
    "recent"
  );

  useEffect(() => {
    // Simulate fetching liked cars (Mock Data)
    const mockLikedCars: LikedCarData[] = [
      {
        _id: "liked1",
        carId: "car1",
        likedAt: new Date(Date.now() - 86400000).toISOString(),
        car: {
          _id: "car1",
          title: "2023 Honda City",
          price: 24999,
          image:
            "https://images.unsplash.com/photo-1552820728-8ac41f1ce891?w=800&h=600&fit=crop",
          transmission: "Automatic",
          bodyType: "Sedan",
          description:
            "Spacious and efficient city car with premium interiors.",
          features: ["ABS", "Power Steering", "Air Conditioning"],
        },
      },
      {
        _id: "liked2",
        carId: "car2",
        likedAt: new Date(Date.now() - 172800000).toISOString(),
        car: {
          _id: "car2",
          title: "2024 Toyota Fortuner",
          price: 54999,
          image:
            "https://images.unsplash.com/photo-1542362567-b07e54358753?w=800&h=600&fit=crop",
          transmission: "Automatic",
          bodyType: "SUV",
          description:
            "Premium SUV with advanced features and off-road capability.",
          features: ["Cruise Control", "360 Camera", "Sunroof"],
        },
      },
      {
        _id: "liked3",
        carId: "car3",
        likedAt: new Date(Date.now() - 259200000).toISOString(),
        car: {
          _id: "car3",
          title: "2022 BMW 3 Series",
          price: 49999,
          image:
            "https://images.unsplash.com/photo-1555215695-3004980adade?w=800&h=600&fit=crop",
          transmission: "Automatic",
          bodyType: "Sedan",
          description: "Luxury performance sedan with cutting-edge tech.",
          features: ["M Sport Package", "Premium Audio", "Leather Interior"],
        },
      },
    ];

    setTimeout(() => {
      setLikedCars(mockLikedCars);
      setLoading(false);
    }, 1000); // Simulate network delay
  }, []);

  const getSortedCars = () => {
    const cars = [...likedCars];
    switch (sortBy) {
      case "price-low":
        return cars.sort((a, b) => a.car.price - b.car.price);
      case "price-high":
        return cars.sort((a, b) => b.car.price - a.car.price);
      case "recent":
      default:
        return cars.sort(
          (a, b) =>
            new Date(b.likedAt).getTime() - new Date(a.likedAt).getTime()
        );
    }
  };

  const handleRemoveLike = (carId: string) => {
    setLikedCars((prev) => prev.filter((car) => car.carId !== carId));
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
                      href={`/cars/${item.carId}`}
                      className="block relative h-56 overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10 opacity-60 group-hover:opacity-40 transition-opacity" />
                      <img
                        src={item.car.image}
                        alt={item.car.title}
                        className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                      />
                      <div className="absolute top-4 left-4 z-20">
                        <Badge className="bg-white/90 dark:bg-slate-900/90 text-gray-900 dark:text-white backdrop-blur-sm border-0 shadow-lg hover:bg-white">
                          {item.car.bodyType}
                        </Badge>
                      </div>

                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          handleRemoveLike(item.carId);
                        }}
                        className="absolute top-4 right-4 z-20 p-2.5 bg-white/10 hover:bg-red-500 text-white rounded-full backdrop-blur-md transition-all duration-300 shadow-lg group/btn border border-white/20"
                        title="Remove from favorites"
                      >
                        <Trash2 className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                      </button>

                      <div className="absolute bottom-4 left-4 z-20 text-white">
                        <p className="text-xs font-medium text-white/80 mb-1 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Added {new Date(item.likedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </Link>

                    {/* Details Section */}
                    <div className="p-6">
                      <div className="mb-4">
                        <Link
                          href={`/cars/${item.carId}`}
                          className="hover:text-primary transition-colors"
                        >
                          <h3 className="text-xl font-bold text-gray-900 dark:text-white line-clamp-1 mb-1">
                            {item.car.title}
                          </h3>
                        </Link>
                        <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                          <Car className="w-3.5 h-3.5" />
                          {item.car.transmission} Transmission
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2 mb-6">
                        {item.car.features.slice(0, 3).map((feat, idx) => (
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
                            ${item.car.price.toLocaleString()}
                          </p>
                        </div>
                        <Link href={`/cars/${item.carId}`}>
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

            {/* Comparison CTA */}
            {sortedCars.length >= 2 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-br from-blue-600 to-indigo-700 dark:from-blue-900 dark:to-indigo-900 rounded-3xl p-8 md:p-12 text-center text-white relative overflow-hidden shadow-2xl shadow-blue-500/20"
              >
                {/* Decorative Background */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-[80px] pointer-events-none -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full blur-[80px] pointer-events-none translate-y-1/2 -translate-x-1/2" />

                <div className="relative z-10 max-w-2xl mx-auto">
                  <h3 className="text-3xl font-bold mb-4">
                    Can&apos;t Decide?
                  </h3>
                  <p className="text-blue-100 mb-8 text-lg font-light leading-relaxed">
                    Compare your saved vehicles side-by-side to find the perfect
                    match for your lifestyle. Analyze specs, features, and
                    pricing in one view.
                  </p>
                  <Button
                    size="lg"
                    className="bg-white text-blue-700 hover:bg-blue-50 border-0 rounded-xl px-8 font-bold shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1"
                  >
                    Start Comparison
                  </Button>
                </div>
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
