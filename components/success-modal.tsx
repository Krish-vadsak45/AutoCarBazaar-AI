"use client";

import React from "react";
import { CheckCircle, X, AlertCircle } from "lucide-react";

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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-lg w-full border-2 border-gray-200 dark:border-slate-800 overflow-hidden">
        {/* Close Button */}
        <div className="absolute top-4 right-4 z-10">
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 sm:p-10">
          {/* Success Icon */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-green-100 dark:bg-green-900/20 rounded-full blur-xl animate-pulse" />
              <CheckCircle className="w-20 h-20 text-green-500 relative" />
            </div>
          </div>

          {/* Title */}
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 text-center mb-2">
            Test Drive Booked Successfully
          </h2>

          {/* Subtitle */}
          <p className="text-gray-600 dark:text-gray-400 text-center mb-8">
            Your test drive has been confirmed with the following details:
          </p>

          {/* Details */}
          <div className="space-y-4 mb-8">
            {/* Car */}
            <div className="flex justify-between py-3 px-4 bg-gray-50 dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700">
              <span className="text-gray-700 dark:text-gray-300 font-semibold">
                Car:
              </span>
              <span className="text-gray-900 dark:text-gray-100 font-bold">
                {details.car}
              </span>
            </div>

            {/* Date */}
            <div className="flex justify-between py-3 px-4 bg-gray-50 dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700">
              <span className="text-gray-700 dark:text-gray-300 font-semibold">
                Date:
              </span>
              <span className="text-gray-900 dark:text-gray-100 font-bold">
                {details.date}
              </span>
            </div>

            {/* Time Slot */}
            <div className="flex justify-between py-3 px-4 bg-gray-50 dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700">
              <span className="text-gray-700 dark:text-gray-300 font-semibold">
                Time Slot:
              </span>
              <span className="text-gray-900 dark:text-gray-100 font-bold">
                {details.time}
              </span>
            </div>

            {/* Dealership */}
            <div className="flex justify-between py-3 px-4 bg-gray-50 dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700">
              <span className="text-gray-700 dark:text-gray-300 font-semibold">
                Dealership:
              </span>
              <span className="text-gray-900 dark:text-gray-100 font-bold">
                {details.dealership}
              </span>
            </div>

            {/* Date */}
            <div className="flex justify-between py-3 px-4 bg-gray-50 dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700">
              <span className="text-gray-700 dark:text-gray-300 font-semibold">
                Date:
              </span>
              <span className="text-gray-900 dark:text-gray-100 font-bold">
                {bookingDetails.date}
              </span>
            </div>

            {/* Time Slot */}
            <div className="flex justify-between py-3 px-4 bg-gray-50 dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700">
              <span className="text-gray-700 dark:text-gray-300 font-semibold">
                Time Slot:
              </span>
              <span className="text-gray-900 dark:text-gray-100 font-bold">
                {bookingDetails.time}
              </span>
            </div>

            {/* Dealership */}
            <div className="flex justify-between py-3 px-4 bg-gray-50 dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700">
              <span className="text-gray-700 dark:text-gray-300 font-semibold">
                Dealership:
              </span>
              <span className="text-gray-900 dark:text-gray-100 font-bold">
                {bookingDetails.dealership}
              </span>
            </div>
          </div>

          {/* Important Note */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-8">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-blue-800 dark:text-blue-300">
                Please arrive 10 minutes early with your driver's license.
              </p>
            </div>
          </div>

          {/* Done Button */}
          <button
            onClick={onClose}
            className="w-full py-4 bg-gray-900 hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-100 text-white dark:text-gray-900 rounded-xl font-bold text-lg transition-all duration-300 hover:shadow-lg"
          >
            Done
          </button>

          {/* Footer Message */}
          <p className="text-center text-gray-600 dark:text-gray-400 text-sm mt-4">
            A confirmation email has been sent to your registered email address.
          </p>
        </div>
      </div>
    </div>
  );
}
