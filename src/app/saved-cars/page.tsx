"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Heart,
  ArrowLeft,
  Trash2,
  ArrowUpDown,
  ExternalLink,
  Calendar,
  Car,
  Fuel,
  Gauge,
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// --- Types ---
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
    // Mock Data Simulation
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
            "Premium sedan for city driving with advanced safety features. Excellent fuel economy and comfort.",
          features: ["Sunroof", "Cruise Control", "Lane Assist"],
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
            "Rugged SUV built for off-road adventures and family comfort. Dominating road presence.",
          features: ["4x4 Drive", "Leather Seats", "360 Camera"],
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
          description:
            "The ultimate driving machine with sporty performance and cutting-edge technology.",
          features: ["M Sport", "Heated Seats", "Heads-up Display"],
        },
      },
    ];

    setTimeout(() => {
      setLikedCars(mockLikedCars);
      setLoading(false);
    }, 800);
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

  const handleRemoveLike = (idToRemove: string) => {
    setLikedCars((prev) => prev.filter((item) => item._id !== idToRemove));
  };

  const sortedCars = getSortedCars();

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-slate-950 pt-24 pb-12 transition-colors duration-300">
      <div className="container mx-auto px-4 max-w-5xl">
        {" "}
        {/* Narrower container for list view */}
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6">
          <div>
            <Link
              href="/"
              className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors mb-3 group"
            >
              <ArrowLeft className="w-4 h-4 mr-1 group-hover:-translate-x-1 transition-transform" />
              Back to Showroom
            </Link>
            <h1 className="text-3xl md:text-4xl font-extrabold text-foreground tracking-tight flex items-center gap-3">
              Your Garage
              <Badge
                variant="secondary"
                className="text-lg px-3 py-1 rounded-full bg-primary/10 text-primary hover:bg-primary/20"
              >
                {sortedCars.length}
              </Badge>
            </h1>
            <p className="text-muted-foreground mt-2 max-w-md">
              Review and compare your bookmarked vehicles.
            </p>
          </div>

          {/* Sort Controls */}
          {sortedCars.length > 0 && (
            <div className="flex items-center gap-3 bg-background border rounded-xl p-1 shadow-sm">
              <span className="text-xs font-semibold text-muted-foreground pl-3 uppercase tracking-wider hidden sm:inline-block">
                Sort By
              </span>
              <Select
                value={sortBy}
                onValueChange={(val: any) => setSortBy(val)}
              >
                <SelectTrigger className="w-[180px] border-0 bg-transparent focus:ring-0 h-9 font-medium">
                  <SelectValue placeholder="Sort order" />
                </SelectTrigger>
                <SelectContent align="end">
                  <SelectItem value="recent">Recently Added</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
        {/* Content List */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-48 w-full rounded-2xl bg-gray-200 dark:bg-slate-800 animate-pulse border border-gray-300 dark:border-slate-700"
              />
            ))}
          </div>
        ) : sortedCars.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-24 text-center space-y-6 bg-background rounded-3xl border-2 border-dashed border-muted"
          >
            <div className="p-6 bg-red-50 dark:bg-red-900/10 rounded-full">
              <Heart className="w-12 h-12 text-red-500/50" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-foreground">
                No saved cars yet
              </h3>
              <p className="text-muted-foreground max-w-sm mx-auto">
                Tap the heart icon on any vehicle to save it here for quick
                access later.
              </p>
            </div>
            <Button asChild size="lg" className="rounded-full px-8">
              <Link href="/">Browse Inventory</Link>
            </Button>
          </motion.div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="space-y-6"
          >
            <AnimatePresence mode="popLayout">
              {sortedCars.map((item) => (
                <motion.div
                  layout
                  key={item._id}
                  variants={itemVariants}
                  exit={{
                    opacity: 0,
                    x: -50,
                    scale: 0.95,
                    transition: { duration: 0.2 },
                  }}
                  className="group relative bg-white dark:bg-slate-900 rounded-3xl border border-gray-200 dark:border-slate-800 hover:border-primary/30 dark:hover:border-primary/30 shadow-sm hover:shadow-xl dark:shadow-black/20 transition-all duration-300 overflow-hidden flex flex-col md:flex-row h-auto md:h-52"
                >
                  {/* Image Section - Left (or Top on mobile) */}
                  <div className="relative w-full md:w-72 h-48 md:h-full flex-shrink-0 bg-gray-100 dark:bg-slate-800 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-transparent z-10" />
                    <img
                      src={item.car.image}
                      alt={item.car.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute top-3 left-3 z-20">
                      <Badge
                        variant="secondary"
                        className="backdrop-blur-md bg-white/90 dark:bg-black/60 text-foreground font-semibold px-2.5 py-0.5 text-xs shadow-sm"
                      >
                        {item.car.bodyType}
                      </Badge>
                    </div>
                  </div>

                  {/* Content Section - Right (or Bottom on mobile) */}
                  <div className="flex-1 p-5 md:p-6 flex flex-col justify-between relative">
                    {/* Top Content */}
                    <div>
                      <div className="flex justify-between items-start gap-4">
                        <div>
                          <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                            {item.car.title}
                          </h3>
                          <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1.5 px-2 py-1 bg-gray-100 dark:bg-slate-800 rounded-md">
                              <Car className="w-3.5 h-3.5" />
                              {item.car.transmission}
                            </span>
                            <span className="flex items-center gap-1.5 px-2 py-1 bg-gray-100 dark:bg-slate-800 rounded-md">
                              <Calendar className="w-3.5 h-3.5" />
                              Saved{" "}
                              {new Date(item.likedAt).toLocaleDateString(
                                undefined,
                                { month: "short", day: "numeric" }
                              )}
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-1">
                          <p className="text-sm font-medium text-muted-foreground line-through opacity-70">
                            ${(item.car.price * 1.1).toLocaleString()}
                          </p>
                          <p className="text-2xl font-bold text-primary">
                            ${item.car.price.toLocaleString()}
                          </p>
                        </div>
                      </div>

                      <p className="mt-3 text-sm text-muted-foreground line-clamp-2 md:pr-16 leading-relaxed">
                        {item.car.description}
                      </p>
                    </div>

                    {/* Bottom Action Area */}
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mt-4 md:mt-0 pt-4 md:pt-0 border-t md:border-0 border-gray-100 dark:border-slate-800">
                      {/* Features Badges */}
                      <div className="flex gap-2 overflow-x-auto pb-1 md:pb-0 w-full md:w-auto scrollbar-none">
                        {item.car.features.slice(0, 3).map((feat, idx) => (
                          <Badge
                            key={idx}
                            variant="outline"
                            className="whitespace-nowrap text-xs font-normal text-muted-foreground border-gray-200 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-800/50"
                          >
                            {feat}
                          </Badge>
                        ))}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-3 w-full md:w-auto">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveLike(item._id)}
                          className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                          title="Remove from Saved"
                        >
                          <Trash2 className="w-5 h-5" />
                        </Button>
                        <Button
                          asChild
                          className="flex-1 md:flex-none shadow-md shadow-primary/10 hover:shadow-primary/20 transition-all rounded-xl"
                        >
                          <Link href={`/cars/${item.carId}`} className="gap-2">
                            View Details <ExternalLink className="w-4 h-4" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  );
}
