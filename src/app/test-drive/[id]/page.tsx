"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { ChevronLeft, Check, CalendarIcon, MapPin } from "lucide-react";
import Image from "next/image";
import { loadStripe } from "@stripe/stripe-js";
import { toast } from "react-toastify";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import axios from "axios";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { SuccessModal } from "@/components/success-modal";
import { Switch } from "@/components/ui/switch";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
);

export default function TestDrivePage() {
  const { data: session } = useSession();
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const carId = Array.isArray(params?.id) ? params?.id[0] : params?.id;
  const success = searchParams.get("success") === "true";
  const canceled = searchParams.get("canceled") === "true";
  const sessionId = searchParams.get("session_id");

  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [notes, setNotes] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [bookingDetails, setBookingDetails] = useState<any>(null);
  const [totalPrice, setTotalPrice] = useState(0);

  const [carDetails, setCarDetails] = useState<any>(null);

  // Delivery state
  const [isDelivery, setIsDelivery] = useState(false);
  const [userLocation, setUserLocation] = useState<{
    address?: string;
  } | null>(null);
  const [manualAddress, setManualAddress] = useState("");
  const [userSavedAddress, setUserSavedAddress] = useState("");
  const [basePrice, setBasePrice] = useState(0);
  const [deliveryFee, setDeliveryFee] = useState(0);

  useEffect(() => {
    if (
      startDate &&
      endDate &&
      startTime !== "" &&
      endTime !== "" &&
      carDetails != null
    ) {
      const startDateTime = new Date(startDate);
      startDateTime.setHours(Number.parseInt(startTime), 0, 0, 0);

      const endDateTime = new Date(endDate);
      endDateTime.setHours(Number.parseInt(endTime), 0, 0, 0);

      const diffInMs = endDateTime.getTime() - startDateTime.getTime();
      const diffInHours = diffInMs / (1000 * 60 * 60);

      setBasePrice(Math.round(diffInHours * (carDetails.pricePerHour || 10)));
    } else {
      setBasePrice(0);
    }
  }, [startDate, endDate, startTime, endTime, carDetails]);

  useEffect(() => {
    setTotalPrice(basePrice + (isDelivery ? deliveryFee : 0));
  }, [basePrice, deliveryFee, isDelivery]);

  useEffect(() => {
    if (session?.user) {
      const fetchUser = async () => {
        try {
          const axios = (await import("axios")).default;
          const res = await axios.get("/api/users");
          if (res.data?.user?.address) {
            setUserSavedAddress(res.data.user.address);
          }
        } catch (err) {
          console.error("Failed to fetch user address", err);
        }
      };
      fetchUser();
    }
  }, [session]);

  const handleManualLocationSubmit = async () => {
    if (!manualAddress.trim()) {
      toast.error("Please enter a valid address");
      return;
    }

    const startAddress = carDetails?.carAddress || carDetails?.vendorAddress;

    if (!startAddress) {
      toast.error(
        "Could not find start location for this car. Vendor/Car address missing.",
      );
      return;
    }

    toast.info("Calculating distance...");
    try {
      const res = await fetch(
        `/api/calculate-distance?origins=${encodeURIComponent(startAddress)}&destinations=${encodeURIComponent(manualAddress)}`,
      );
      const data = await res.json();

      if (!res.ok || data.error) {
        toast.error(data.error || "Failed to calculate distance");
        return;
      }
      console.log("📍 Calculated Distance Data:", data);
      console.log(
        `🛣️ Distance: ${data.distance}, Value: ${data.distanceValue} meters`,
      );
      const distanceKm = (data.distanceValue || 0) / 1000;
      const ratePerKm = 10;
      setDeliveryFee(Math.ceil(distanceKm) * ratePerKm);

      setUserLocation({ address: manualAddress });
      toast.success(
        `Distance: ${data.distance}, Delivery Fee: Rs. ${Math.ceil(distanceKm) * ratePerKm}`,
      );
    } catch (error) {
      toast.error("Failed to fetch distance api.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!session?.user) {
      toast.error(
        "Please sign in to book a test drive. You need to be logged in to complete this booking.",
      );
      router.push("/sign-in");
      return;
    }

    if (!startDate || !endDate || !startTime || !endTime) {
      toast.error("Please select date and time range");
      return;
    }

    if (isDelivery && !userLocation) {
      toast.error("Please set your delivery location");
      return;
    }

    const startDateTime = new Date(startDate);
    startDateTime.setHours(Number.parseInt(startTime), 0, 0, 0);

    const endDateTime = new Date(endDate);
    endDateTime.setHours(Number.parseInt(endTime), 0, 0, 0);

    if (endDateTime <= startDateTime) {
      toast.error("End date/time must be after start date/time");
      return;
    }

    setIsSubmitting(true);
    try {
      const axios = (await import("axios")).default;
      const response = await axios.post("/api/test-drive/checkout", {
        carId,
        bookingDetails: {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          startTime: `${startTime.padStart(2, "0")}:00`,
          endTime: `${endTime.padStart(2, "0")}:00`,
          notes,
        },
        isDelivery,
        userLocation: isDelivery ? userLocation : undefined,
      });

      if (response.data.url) {
        globalThis.location.href = response.data.url;
      }

      toast.success("Test drive booked successfully!");
      // check the new fields in response.data for debugging
      console.log("DEBUG: Checkout Response Data:", response.data);
    } catch (error: any) {
      console.error("Booking error:", error);
      toast.error(error.response?.data?.error || "Failed to initiate payment");
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (success && sessionId && carDetails && !showSuccess) {
      const startDisplay = startDate ? format(startDate, "PPP") : "N/A";
      const endDisplay = endDate ? format(endDate, "PPP") : "N/A";

      setBookingDetails({
        car: carDetails.name,
        start: `${startDisplay} at ${startTime}:00`,
        end: `${endDisplay} at ${endTime}:00`,
        dealership: "Vehicl Motors",
      });
      setShowSuccess(true);
    }
    if (canceled) {
      toast.error("Booking payment was canceled.");
      router.replace(`/test-drive/${carId}`);
    }
  }, [success, canceled, sessionId, carDetails]);

  useEffect(() => {
    if (!carId) return;
    let mounted = true;
    (async () => {
      setIsLoading(true);
      try {
        const axios = (await import("axios")).default;
        const res = await axios.get(`/api/cars/${carId}`);
        const json = res.data;
        const fetched = json?.car ?? json;
        if (mounted && fetched) {
          setCarDetails({
            name: fetched.title || fetched.name || `Car ${carId}`,
            price: fetched.price ? String(fetched.price) : "$0",
            pricePerHour: fetched.pricePerHour || 10, // default if not set
            mileage: fetched.specs?.mileage || fetched.mileage || "N/A",
            fuelType: fetched.specs?.fuelType || fetched.fuelType || "N/A",
            transmission: fetched.transmission || "N/A",
            bodyType: fetched.bodyType || fetched.specs?.bodyType || "N/A",
            color: fetched.specs?.color || fetched.color || "N/A",
            image: fetched.images?.[0] || fetched.image,
            carAddress: fetched.carAddress,
            vendorAddress: fetched.vendorAddress,
          });
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (mounted) setIsLoading(false);
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          {/* LEFT COLUMN - CAR DETAILS */}
          <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-gray-200 dark:border-slate-800 p-6 flex flex-col h-full">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6">
              Car Details
            </h2>

            {/* Car Image */}
            <div className="rounded-lg overflow-hidden mb-6 bg-gray-100 h-64 relative">
              {isLoading ? (
                <Skeleton className="w-full h-full" />
              ) : (
                <Image
                  src={carDetails?.image || "/placeholder.svg"}
                  alt={carDetails?.name || "Car image"}
                  fill
                  className="object-cover"
                />
              )}
            </div>

            {/* Car Info */}
            <div className="flex-1">
              {isLoading ? (
                <>
                  <Skeleton className="h-7 w-3/4 mb-2" />
                  <Skeleton className="h-9 w-1/3 mb-8" />
                  <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="flex justify-between py-2">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                    {carDetails?.name}
                  </h3>
                  <p className="text-3xl font-bold text-blue-600 mb-8">
                    {carDetails?.price}
                  </p>

                  {/* Specifications */}
                  <div className="space-y-4">
                    {[
                      { label: "Mileage", value: carDetails?.mileage },
                      { label: "Fuel Type", value: carDetails?.fuelType },
                      {
                        label: "Transmission",
                        value: carDetails?.transmission,
                      },
                      { label: "Body Type", value: carDetails?.bodyType },
                      { label: "Color", value: carDetails?.color },
                    ].map((spec, idx) => (
                      <div
                        key={spec.label}
                        className="flex justify-between py-2 border-b border-gray-50 dark:border-slate-800 last:border-0 text-gray-700 dark:text-gray-300"
                      >
                        <span className="text-sm">{spec.label}</span>
                        <span className="font-semibold text-gray-900 dark:text-gray-100">
                          {spec.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN - FORM */}
          <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-gray-200 dark:border-slate-800 p-6 flex flex-col h-full">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6">
              Schedule Your Test Drive
            </h2>

            <form
              onSubmit={handleSubmit}
              className="flex-1 flex flex-col space-y-6"
            >
              <div className="space-y-6">
                {/* Selection Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Start Date & Time */}
                  <div className="space-y-4">
                    <Label className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      Select Start Date
                    </Label>
                    <div className="space-y-3">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full justify-start text-left font-normal border-gray-300 dark:border-slate-700 h-11",
                              !startDate && "text-muted-foreground",
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {startDate ? (
                              format(startDate, "PPP")
                            ) : (
                              <span>Pick start date</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={startDate}
                            onSelect={setStartDate}
                            disabled={(date) =>
                              date < new Date(new Date().setHours(0, 0, 0, 0))
                            }
                          />
                        </PopoverContent>
                      </Popover>
                      <Select value={startTime} onValueChange={setStartTime}>
                        <SelectTrigger className="w-full border-gray-300 dark:border-slate-700 h-11">
                          <SelectValue placeholder="Pick start time" />
                        </SelectTrigger>
                        <SelectContent className="max-h-[300px]">
                          {Array.from({ length: 24 }, (_, i) => {
                            const hourLabel =
                              i === 0
                                ? "12 AM"
                                : i < 12
                                  ? `${i} AM`
                                  : i === 12
                                    ? "12 PM"
                                    : `${i - 12} PM`;

                            // Validation: If Start Date is TODAY, disable hours before current hour
                            const isToday =
                              startDate &&
                              format(startDate, "yyyy-MM-dd") ===
                                format(new Date(), "yyyy-MM-dd");
                            const currentHour = new Date().getHours();
                            const disabled = isToday && i < currentHour;

                            return (
                              <SelectItem
                                key={i}
                                value={i.toString()}
                                disabled={disabled}
                              >
                                {hourLabel}
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* End Date & Time */}
                  <div className="space-y-4">
                    <Label className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      Select End Date
                    </Label>
                    <div className="space-y-3">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full justify-start text-left font-normal border-gray-300 dark:border-slate-700 h-11",
                              !endDate && "text-muted-foreground",
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {endDate ? (
                              format(endDate, "PPP")
                            ) : (
                              <span>Pick end date</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={endDate}
                            onSelect={setEndDate}
                            disabled={(date) =>
                              startDate
                                ? date < startDate
                                : date <
                                  new Date(new Date().setHours(0, 0, 0, 0))
                            }
                          />
                        </PopoverContent>
                      </Popover>
                      <Select value={endTime} onValueChange={setEndTime}>
                        <SelectTrigger className="w-full border-gray-300 dark:border-slate-700 h-11">
                          <SelectValue placeholder="Pick end time" />
                        </SelectTrigger>
                        <SelectContent className="max-h-[300px]">
                          {Array.from({ length: 24 }, (_, i) => {
                            const hourLabel =
                              i === 0
                                ? "12 AM"
                                : i < 12
                                  ? `${i} AM`
                                  : i === 12
                                    ? "12 PM"
                                    : `${i - 12} PM`;

                            // Validation: If same day as start, must be at least 1 hour after start time
                            const isSameDay =
                              startDate &&
                              endDate &&
                              format(startDate, "yyyy-MM-dd") ===
                                format(endDate, "yyyy-MM-dd");

                            const disabled =
                              isSameDay &&
                              startTime !== "" &&
                              i < Number.parseInt(startTime) + 1;

                            return (
                              <SelectItem
                                key={i}
                                value={i.toString()}
                                disabled={disabled}
                              >
                                {hourLabel}
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Notes */}
              <div className="flex-1 flex flex-col">
                <Label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
                  Additional Notes (Optional)
                </Label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any specific questions or requests for your test drive?"
                  className="flex-1 w-full px-4 py-3 border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent resize-none min-h-30"
                />
              </div>

              {/* Car at My Location Toggle */}
              <div className="rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50 p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-blue-600" />
                    <Label className="text-sm font-semibold text-gray-900 dark:text-gray-100 cursor-pointer">
                      Car at My Location
                    </Label>
                  </div>
                  <Switch
                    checked={isDelivery}
                    onCheckedChange={(checked) => {
                      setIsDelivery(checked);
                      if (!checked) {
                        setUserLocation(null);

                        setManualAddress("");
                      }
                    }}
                  />
                </div>

                {isDelivery && (
                  <div className="space-y-3 pt-1">
                    {!userLocation ? (
                      <div className="space-y-2">
                        {" "}
                        {userSavedAddress && (
                          <button
                            type="button"
                            onClick={() => setManualAddress(userSavedAddress)}
                            className="w-full py-2 px-4 rounded-lg bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-800 dark:text-gray-200 text-sm font-medium hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors flex items-center justify-center gap-2"
                          >
                            <MapPin className="w-4 h-4" /> Use my saved address
                          </button>
                        )}{" "}
                        <input
                          type="text"
                          placeholder="Current Location (e.g. 123 MG Road, Mumbai, Maharashtra)"
                          value={manualAddress}
                          onChange={(e) => setManualAddress(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                          type="button"
                          onClick={handleManualLocationSubmit}
                          className="w-full py-2 px-4 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
                        >
                          Detect distance & set location
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg px-3 py-2.5">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-green-600 shrink-0" />
                          <span className="text-sm text-green-800 dark:text-green-300 font-medium">
                            {userLocation.address || "Location set"}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setUserLocation(null);
                            setManualAddress("");
                          }}
                          className="text-xs text-gray-500 dark:text-gray-400 underline underline-offset-2 ml-2 shrink-0"
                        >
                          Change
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={
                  isSubmitting ||
                  isLoading ||
                  totalPrice <= 0 ||
                  (isDelivery && !userLocation)
                }
                className="w-full py-7 text-lg font-bold bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 text-white transition-all shadow-lg hover:shadow-blue-500/25 mt-auto"
              >
                {isSubmitting
                  ? "Processing..."
                  : `Pay Rs. ${totalPrice.toLocaleString()} & Confirm Booking`}
              </Button>
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
            ].map((item) => (
              <div key={item} className="flex items-center gap-3">
                <Check className="w-5 h-5 text-green-600 shrink-0" />
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
