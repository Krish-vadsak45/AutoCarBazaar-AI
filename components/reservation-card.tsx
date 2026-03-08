"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, X, Car, ArrowRight, MapPin } from "lucide-react";
import { CancelReservationModal } from "./cancel-reservation-modal";
import { cn } from "@/lib/utils";

interface ReservationData {
  _id: string;
  carId: string;
  title: string;
  image: string;
  transmission: string;
  bodyType: string;
  price: number;
  selectedDate: string;
  selectedTime: string;
  notes: string;
  status: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";
}

interface ReservationCardProps {
  reservation: ReservationData;
  onCancel?: (reservationId: string) => void;
}

export function ReservationCard({
  reservation,
  onCancel,
}: ReservationCardProps) {
  const [showCancelModal, setShowCancelModal] = useState(false);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const statusStyles = {
    PENDING:
      "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800",
    CONFIRMED:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
    CANCELLED:
      "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800",
    COMPLETED:
      "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800",
  };

  return (
    <>
      <div className="group bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-gray-200 dark:border-slate-800 shadow-sm hover:shadow-xl dark:shadow-black/40 hover:border-primary/30 transition-all duration-300">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 lg:gap-6">
          {/* Image Section */}
          <div className="lg:col-span-4 relative h-56 lg:h-auto overflow-hidden">
            <img
              src={reservation.image || "/placeholder.svg"}
              alt={reservation.title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute top-4 left-4">
              <Badge
                className={cn(
                  "px-3 py-1 font-semibold uppercase shadow-lg backdrop-blur-md",
                  statusStyles[reservation.status] ||
                    "bg-gray-100 text-gray-700",
                )}
              >
                {reservation.status}
              </Badge>
            </div>
          </div>

          {/* Details Section */}
          <div className="lg:col-span-5 p-6 flex flex-col justify-center">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 line-clamp-1 group-hover:text-primary transition-colors">
              {reservation.title}
            </h3>

            <div className="space-y-3">
              <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600 dark:text-blue-400">
                  <Calendar className="w-4 h-4" />
                </div>
                <span className="font-medium">
                  {formatDate(reservation.selectedDate)}
                </span>
              </div>

              <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg text-purple-600 dark:text-purple-400">
                  <Clock className="w-4 h-4" />
                </div>
                <span className="font-medium">{reservation.selectedTime}</span>
              </div>

              <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                <div className="p-2 bg-gray-100 dark:bg-slate-800 rounded-lg text-gray-500 dark:text-gray-400">
                  <Car className="w-4 h-4" />
                </div>
                <span className="text-sm">
                  {reservation.bodyType} • {reservation.transmission}
                </span>
              </div>
            </div>
          </div>

          {/* Actions Section */}
          <div className="lg:col-span-3 p-6 bg-gray-50 dark:bg-slate-800/50 border-l border-gray-100 dark:border-slate-800 flex flex-col justify-between">
            <div className="mb-4">
              <h4 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">
                Notes
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3 leading-relaxed italic">
                &quot;{reservation.notes || "No additional notes provided."}
                &quot;
              </p>
            </div>

            <div className="space-y-2 mt-auto">
              <Link href={`/cars/${reservation.carId}`} className="w-full">
                <Button
                  variant="outline"
                  className="w-full justify-between group/btn border-gray-300 dark:border-slate-600 hover:bg-white dark:hover:bg-slate-700 bg-transparent text-gray-700 dark:text-gray-200"
                >
                  View Details
                  <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover/btn:opacity-100 group-hover/btn:translate-x-0 transition-all" />
                </Button>
              </Link>

              {reservation.status !== "CANCELLED" && (
                <Button
                  onClick={() => setShowCancelModal(true)}
                  variant="destructive"
                  className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 border border-transparent hover:border-red-200 dark:hover:border-red-900 shadow-none"
                >
                  Cancel Booking
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {showCancelModal && (
        <CancelReservationModal
          reservation={reservation}
          onClose={() => setShowCancelModal(false)}
          onConfirm={(id) => {
            setShowCancelModal(false);
            onCancel?.(id);
          }}
        />
      )}
    </>
  );
}
