"use client";

import React from "react";
import {
  CheckCircle,
  X,
  AlertCircle,
  Calendar,
  Clock,
  MapPin,
} from "lucide-react";

export interface SuccessModalProps {
  details: {
    car: string;
    date: string;
    time: string;
    dealership: string;
  };
  onClose: () => void;
}

export function SuccessModal({ details, onClose }: SuccessModalProps) {
  const bookingDetails = details; // Declare the bookingDetails variable

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-slate-800 overflow-hidden">
        <button
          aria-label="Close"
          onClick={onClose}
          className="absolute right-4 top-4 z-20 p-2 bg-white/80 dark:bg-slate-800/80 rounded-lg hover:scale-105 transition-transform"
        >
          <X className="w-5 h-5 text-gray-600 dark:text-gray-300" />
        </button>

        <div className="p-6 sm:p-8">
          <div className="flex flex-col items-center gap-4">
            <div className="bg-green-50 dark:bg-green-900/10 rounded-full p-4">
              <CheckCircle className="w-14 h-14 text-green-500" />
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-gray-100 text-center">
              Test Drive Booked
            </h2>

            <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
              Your test drive is confirmed — here are the details.
            </p>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-3">
            <div className="flex items-center justify-between bg-gray-50 dark:bg-slate-800 rounded-lg p-3">
              <div className="flex items-center gap-3">
                <svg
                  className="w-5 h-5 text-gray-500"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <circle cx="12" cy="12" r="10" strokeWidth="0" />
                </svg>
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Car
                </span>
              </div>
              <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                {bookingDetails.car}
              </span>
            </div>

            <div className="flex items-center justify-between bg-gray-50 dark:bg-slate-800 rounded-lg p-3">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-gray-500" />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Date
                </span>
              </div>
              <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                {bookingDetails.date}
              </span>
            </div>

            <div className="flex items-center justify-between bg-gray-50 dark:bg-slate-800 rounded-lg p-3">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-gray-500" />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Time
                </span>
              </div>
              <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                {bookingDetails.time}
              </span>
            </div>

            <div className="flex items-center justify-between bg_gray-50 dark:bg-slate-800 rounded-lg p-3">
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-gray-500" />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Dealership
                </span>
              </div>
              <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                {bookingDetails.dealership}
              </span>
            </div>
          </div>

          <div className="mt-5 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800 rounded-lg p-3 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600" />
            <p className="text-sm text-blue-800 dark:text-blue-300">
              Please arrive 10 minutes early with your driver's license.
            </p>
          </div>

          <div className="mt-6">
            <button
              onClick={onClose}
              className="w-full py-3 bg-gray-900 hover:bg-gray-800 text-white rounded-lg font-semibold transition-colors cursor-pointer"
            >
              Done
            </button>
          </div>
          <p className="text-center text-gray-500 dark:text-gray-400 text-sm mt-4">
            A confirmation email has been sent to your registered email address.
          </p>
        </div>
      </div>
    </div>
  );
}
