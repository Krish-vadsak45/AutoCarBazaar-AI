"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Clock,
  Car,
  MapPin,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  FilterX,
  Loader2,
  FileText,
  User,
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

// --- Types based on API Response ---
interface IReservation {
  _id: string;
  status: string;
  startDate: string;
  endDate?: string;
  startTime: string;
  endTime?: string;
  notes?: string;
  carId: {
    _id: string;
    title: string;
    image?: string;
    images?: string[];
    price: number;
    transmission?: string;
    bodyType?: string;
  };
  vendorId?: {
    businessName: string;
    address?: {
      city: string;
      state: string;
    };
  };
  userId?: {
    name: string;
    email: string;
  };
}

export default function MyReservationsPage() {
  const [reservations, setReservations] = useState<IReservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // 1. Fetch reservations on mount and when page/filter changes
  useEffect(() => {
    const fetchReservations = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get("/api/my-reservation", {
          params: {
            page,
            limit: 5,
            status: filter === "all" ? undefined : filter,
          },
        });
        setReservations(data.data);
        setTotalPages(data.pagination.totalPages);
        setTotalCount(data.pagination.total);
      } catch (error) {
        console.error("Failed to load reservations", error);
      } finally {
        setLoading(false);
      }
    };
    fetchReservations();
  }, [page, filter]);

  // Handle filter change - reset to page 1
  const handleFilterChange = (newFilter: string) => {
    setFilter(newFilter);
    setPage(1);
  };

  // Status Badge Logic
  const getStatusBadge = (status: string) => {
    const normalizedStatus = status?.toUpperCase() || "";
    const statusConfig: Record<
      string,
      { bg: string; icon: any; label: string }
    > = {
      CONFIRMED: {
        bg: "bg-emerald-500 hover:bg-emerald-600",
        icon: CheckCircle2,
        label: "Confirmed",
      },
      PENDING: {
        bg: "bg-amber-500 hover:bg-amber-600",
        icon: Clock,
        label: "Pending",
      },
      CANCELLED: {
        bg: "bg-rose-500 hover:bg-rose-600",
        icon: XCircle,
        label: "Cancelled",
      },
      COMPLETED: {
        bg: "bg-blue-500 hover:bg-blue-600",
        icon: CheckCircle2,
        label: "Completed",
      },
    };

    const config = statusConfig[normalizedStatus] || {
      bg: "bg-gray-500",
      icon: AlertCircle,
      label: status,
    };
    const Icon = config.icon;

    return (
      <Badge className={`${config.bg} border-none text-white`}>
        <Icon className="w-3 h-3 mr-1" /> {config.label}
      </Badge>
    );
  };

  // Helper: Date Range Display
  const renderDateRange = (start: string, end?: string) => {
    try {
      if (end && end !== start) {
        return `${format(new Date(start), "MMM dd")} - ${format(
          new Date(end),
          "MMM dd, yyyy",
        )}`;
      }
      return format(new Date(start), "eeee, MMM dd, yyyy");
    } catch {
      return start;
    }
  };

  // Animation Variants
  const containerVariants = { show: { transition: { staggerChildren: 0.1 } } };
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-slate-950 pt-24 pb-12 transition-colors duration-300">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-foreground tracking-tight flex items-center gap-3">
              My Test Drives
              <Badge
                variant="secondary"
                className="text-lg px-3 py-1 rounded-full bg-primary/10 text-primary"
              >
                {totalCount}
              </Badge>
            </h1>
            <p className="text-muted-foreground mt-2 max-w-md">
              Track the status of your test drives and upcoming appointments.
            </p>
          </div>

          {/* Filters */}
          <div className="flex bg-white dark:bg-slate-900 p-1 rounded-xl shadow-sm border border-gray-200 dark:border-slate-800 overflow-x-auto">
            {["all", "PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"].map(
              (f) => (
                <button
                  key={f}
                  onClick={() => handleFilterChange(f)}
                  className={`px-3 py-2 rounded-lg text-xs font-bold uppercase transition-all whitespace-nowrap ${
                    filter === f
                      ? "bg-primary text-primary-foreground shadow-md"
                      : "text-muted-foreground hover:bg-gray-100 dark:hover:bg-slate-800"
                  }`}
                >
                  {f === "all" ? "All" : f}
                </button>
              ),
            )}
          </div>
        </div>

        {/* Content List */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-56 w-full rounded-3xl bg-gray-200 dark:bg-slate-800 animate-pulse border border-gray-300 dark:border-slate-700"
              />
            ))}
          </div>
        ) : reservations.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-24 text-center space-y-6 bg-background rounded-3xl border-2 border-dashed border-muted"
          >
            <div className="p-6 bg-muted/50 rounded-full">
              <FilterX className="w-12 h-12 text-muted-foreground/50" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-foreground">
                {filter === "all"
                  ? "No reservations found"
                  : `No ${filter} bookings`}
              </h3>
              <p className="text-muted-foreground max-w-sm mx-auto">
                {filter === "all"
                  ? "You currently don't have any bookings."
                  : `You don't have any ${filter} reservations at the moment.`}
              </p>
            </div>
            {filter !== "all" && (
              <Button
                onClick={() => handleFilterChange("all")}
                variant="outline"
                className="rounded-full px-8"
              >
                View All Bookings
              </Button>
            )}
            <Button asChild size="lg" className="rounded-full px-8">
              <Link href="/">Book a Test Drive</Link>
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
              {reservations.map((res) => (
                <motion.div
                  layout
                  key={res._id}
                  variants={itemVariants}
                  exit={{ opacity: 0, x: -20, scale: 0.95 }}
                  className="group relative bg-white dark:bg-slate-900 rounded-3xl border border-gray-200 dark:border-slate-800 hover:border-primary/30 shadow-sm hover:shadow-xl dark:shadow-black/20 transition-all duration-300 overflow-hidden flex flex-col lg:flex-row"
                >
                  {/* Left: Car Image & Status */}
                  <div className="relative w-full lg:w-80 h-56 lg:h-auto bg-gray-100 dark:bg-slate-800 flex-shrink-0 overflow-hidden">
                    {res.carId?.image || res.carId?.images?.[0] ? (
                      <img
                        src={res.carId.image || res.carId.images![0]}
                        alt={res.carId.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <Car className="w-16 h-16 text-muted-foreground/30" />
                      </div>
                    )}

                    {/* Floating Status Badge */}
                    <div className="absolute top-4 left-4 z-10 shadow-lg">
                      {getStatusBadge(res.status)}
                    </div>

                    {/* Price & Body Type Overlay */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 flex justify-between items-end">
                      <div>
                        <p className="text-white text-2xl font-bold">
                          ${res.carId?.price?.toLocaleString() || "N/A"}
                        </p>
                        <p className="text-white/70 text-xs">
                          {res.carId?.bodyType || "Sedan"}
                        </p>
                      </div>
                      {res.carId?.transmission && (
                        <Badge
                          variant="secondary"
                          className="bg-white/20 backdrop-blur-sm text-white border-0"
                        >
                          {res.carId.transmission}
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Right: Details Content */}
                  <div className="flex-1 p-6 lg:p-8 flex flex-col justify-between">
                    {/* Top Row: Title & Vendor */}
                    <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-4 mb-6">
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                          {res.carId?.title || "Unknown Vehicle"}
                        </h3>
                        {res.vendorId && (
                          <div className="flex items-center gap-2 mt-2 text-sm font-medium text-muted-foreground">
                            <MapPin className="w-4 h-4 text-primary" />
                            <span>{res.vendorId.businessName}</span>
                            {res.vendorId.address?.city && (
                              <span className="text-xs">
                                • {res.vendorId.address.city},{" "}
                                {res.vendorId.address.state}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Middle: Grid Info */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-6 border-y border-dashed border-gray-200 dark:border-slate-800">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 text-blue-600">
                          <Calendar className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-[10px] uppercase font-black text-muted-foreground tracking-wider">
                            Scheduled Date
                          </p>
                          <p className="text-sm font-bold">
                            {renderDateRange(res.startDate, res.endDate)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-orange-50 dark:bg-orange-900/20 border border-orange-100 dark:border-orange-800 text-orange-600">
                          <Clock className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-[10px] uppercase font-black text-muted-foreground tracking-wider">
                            Time Slot
                          </p>
                          <p className="text-sm font-bold">
                            {res.startTime}
                            {res.endTime && ` - ${res.endTime}`}
                          </p>
                        </div>
                      </div>

                      {res.status === "PENDING" && (
                        <div className="flex items-center gap-3 sm:col-span-2">
                          <div className="p-2.5 rounded-xl bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-100 dark:border-yellow-800 text-yellow-600">
                            <AlertCircle className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-[10px] uppercase font-black text-muted-foreground tracking-wider">
                              Status
                            </p>
                            <p className="text-sm font-bold text-yellow-700 dark:text-yellow-500">
                              Awaiting Vendor Approval
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Bottom: Notes & Actions */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-6">
                      <div className="flex-1 min-w-0">
                        {res.notes ? (
                          <div className="flex items-start gap-2 bg-blue-50/50 dark:bg-blue-900/10 p-3 rounded-lg border-l-2 border-blue-500">
                            <FileText className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                            <p className="text-xs text-muted-foreground italic line-clamp-2">
                              "{res.notes}"
                            </p>
                          </div>
                        ) : (
                          <p className="text-xs text-muted-foreground italic">
                            No additional notes provided
                          </p>
                        )}
                      </div>

                      <div className="flex gap-3 w-full sm:w-auto">
                        <Button
                          asChild
                          variant="outline"
                          className="rounded-xl border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800 flex-1 sm:flex-none"
                        >
                          <Link href={`/cars/${res.carId?._id}`}>
                            <Car className="w-4 h-4 mr-2" />
                            View Car
                          </Link>
                        </Button>
                        <Button
                          className="rounded-xl shadow-lg shadow-primary/20 flex-1 sm:flex-none"
                          disabled={res.status === "CANCELLED"}
                        >
                          Details <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 pt-8">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="rounded-xl"
                >
                  Previous
                </Button>
                <div className="flex items-center gap-2">
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setPage(i + 1)}
                      className={`w-10 h-10 rounded-xl text-sm font-medium transition-all ${
                        page === i + 1
                          ? "bg-primary text-primary-foreground shadow-lg"
                          : "bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 hover:border-primary/50"
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="rounded-xl"
                >
                  Next
                </Button>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
