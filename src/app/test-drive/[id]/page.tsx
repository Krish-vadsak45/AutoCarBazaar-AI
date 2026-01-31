"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { ChevronLeft, Check } from "lucide-react";
import Image from "next/image";
import { SuccessModal } from "@/components/success-modal";

export default function TestDrivePage() {
  const router = useRouter();
  const params = useParams();
  const carId = Array.isArray(params?.id) ? params?.id[0] : params?.id;
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [notes, setNotes] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [bookingDetails, setBookingDetails] = useState<any>(null);

  const [carDetails, setCarDetails] = useState<any>({
    name: "Loading...",
    price: "$0",
    mileage: "N/A",
    fuelType: "N/A",
    transmission: "N/A",
    bodyType: "N/A",
    color: "N/A",
    image: "/placeholder.svg",
  });

  const timeSlots = [
    "08:00 AM",
    "09:00 AM",
    "10:00 AM",
    "11:00 AM",
    "01:00 PM",
    "02:00 PM",
    "03:00 PM",
    "04:00 PM",
  ];

  const generateDates = () => {
    const dates = [];
    const today = new Date();
    for (let i = 1; i <= 30; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      if (date.getDay() !== 0 && date.getDay() !== 1) {
        dates.push(date);
      }
    }
    return dates;
  };

  const formatDate = (date: Date) => {
    return date.toISOString().split("T")[0];
  };

  const formatDisplayDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate || !selectedTime) {
      alert("Please select both date and time");
      return;
    }

    setBookingDetails({
      car: carDetails.name,
      date: formatDisplayDate(selectedDate),
      time: selectedTime,
      dealership: "Vehicl Motors",
    });
    setShowSuccess(true);
  };

  const availableDates = generateDates();

  useEffect(() => {
    if (!carId) return;
    let mounted = true;
    (async () => {
      try {
        const axios = (await import("axios")).default;
        const res = await axios.get(`/api/cars/${carId}`);
        const json = res.data;
        const fetched = json?.car ?? json;
        if (mounted && fetched) {
          setCarDetails({
            name: fetched.title || fetched.name || `Car ${carId}`,
            price: fetched.price ? String(fetched.price) : "$0",
            mileage: fetched.specs?.mileage || fetched.mileage || "N/A",
            fuelType: fetched.specs?.fuelType || fetched.fuelType || "N/A",
            transmission: fetched.transmission || "N/A",
            bodyType: fetched.bodyType || fetched.specs?.bodyType || "N/A",
            color: fetched.specs?.color || fetched.color || "N/A",
            image: fetched.images?.[0] || fetched.image,
          });
        }
      } catch (err) {
        console.error(err);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [carId]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="mt-8   ">
          <div className="mx-auto">
            <button
              onClick={() => router.back()}
              className="mb-6 text-primary dark:text-primary hover:text-primary/80 dark:hover:text-primary/70"
            >
              <ChevronLeft className="w-5 h-5" />
              Back
            </button>
          </div>
        </div>
        {/* Page Title */}
        <h1 className="text-4xl font-bold text-primary dark:text-primary mb-8">
          Book a Test Drive
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* LEFT COLUMN - CAR DETAILS */}
          <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-gray-200 dark:border-slate-800 p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6">
              Car Details
            </h2>

            {/* Car Image */}
            <div className="rounded-lg overflow-hidden mb-6 bg-gray-100">
              <Image
                src={carDetails.image || "/placeholder.svg"}
                alt={carDetails.name || "Car image"}
                width={400}
                height={300}
                className="w-full h-56 object-cover"
              />
            </div>

            {/* Car Info */}
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
              {carDetails.name}
            </h3>
            <p className="text-2xl font-bold text-blue-600 mb-6">
              {carDetails.price}
            </p>

            {/* Specifications */}
            <div className="space-y-4">
              {[
                { label: "Mileage", value: carDetails.mileage },
                { label: "Fuel Type", value: carDetails.fuelType },
                { label: "Transmission", value: carDetails.transmission },
                { label: "Body Type", value: carDetails.bodyType },
                { label: "Color", value: carDetails.color },
              ].map((spec, idx) => (
                <div
                  key={idx}
                  className="flex justify-between text-gray-700 dark:text-gray-300"
                >
                  <span>{spec.label}</span>
                  <span className="font-semibold text-gray-900 dark:text-gray-100">
                    {spec.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT COLUMN - FORM */}
          <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-gray-200 dark:border-slate-800 p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6">
              Schedule Your Test Drive
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Date Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
                  Select a Date
                </label>
                <div className="relative">
                  <svg
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    min={formatDate(new Date())}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
                    placeholder="Pick a date"
                  />
                </div>
              </div>

              {/* Time Slot Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
                  Select a Time Slot
                </label>
                {!selectedDate ? (
                  <p className="text-gray-500 dark:text-gray-400 text-sm py-3">
                    Please select a date first
                  </p>
                ) : (
                  <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                    {timeSlots.map((time, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setSelectedTime(time)}
                        className={`py-2 px-3 rounded-lg border-2 transition-all text-sm font-medium ${
                          selectedTime === time
                            ? "border-blue-600 dark:border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                            : "border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:border-blue-300 dark:hover:border-blue-600"
                        }`}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Additional Notes */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
                  Additional Notes (Optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any specific questions or requests for your test drive?"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent resize-none"
                  rows={4}
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full py-3 px-4 bg-gray-900 dark:bg-slate-800 text-white rounded-lg hover:bg-gray-800 dark:hover:bg-slate-700 transition-colors font-semibold"
              >
                Book Test Drive
              </button>
            </form>
          </div>
        </div>

        {/* What to Expect Section */}
        <div className="mt-8 bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-gray-200 dark:border-slate-800 p-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
            What to expect
          </h3>
          <div className="space-y-3">
            {[
              "Bring your driver's license for verification",
              "Test drives typically last 30-60 minutes",
            ].map((item, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                <p className="text-gray-700 dark:text-gray-300">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccess && bookingDetails && (
        <SuccessModal
          details={bookingDetails}
          onClose={() => {
            setShowSuccess(false);
            router.push("/car/" + carId);
          }}
        />
      )}
    </div>
  );
}
