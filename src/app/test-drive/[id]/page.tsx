"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { ChevronLeft, Check, CalendarIcon, MapPin, Loader2 } from "lucide-react";
import Image from "next/image";
import { loadStripe } from "@stripe/stripe-js";
import { toast } from "sonner";
import {
  format,
  parse,
  addHours,
  isAfter,
  isEqual,
  addMinutes,
} from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
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
    city: string;
    state: string;
    lat: number;
    lng: number;
  } | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [manualCity, setManualCity] = useState("");
  const [manualState, setManualState] = useState("");
  const [manualAddress, setManualAddress] = useState("");
  const [useManual, setUseManual] = useState(false);

  useEffect(() => {
    if (
      startDate &&
      endDate &&
      startTime !== "" &&
      endTime !== "" &&
      carDetails != null
    ) {
      const startDateTime = new Date(startDate);
      startDateTime.setHours(parseInt(startTime), 0, 0, 0);

      const endDateTime = new Date(endDate);
      endDateTime.setHours(parseInt(endTime), 0, 0, 0);

      const diffInMs = endDateTime.getTime() - startDateTime.getTime();
      const diffInHours = diffInMs / (1000 * 60 * 60);

      setTotalPrice(Math.round(diffInHours * (carDetails.pricePerHour || 10)));
    } else {
      setTotalPrice(0);
    }
  }, [startDate, endDate, startTime, endTime, carDetails]);

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      setUseManual(true);
      return;
    }
    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          // Use free reverse geocoding from nominatim (no API key needed)
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
          );
          const data = await res.json();
          const city =
            data.address?.city ||
            data.address?.town ||
            data.address?.village ||
            data.address?.county ||
            "";
          const state = data.address?.state || "";
          const address = data.display_name || `${city}, ${state}`;
          setUserLocation({ address, city, state, lat: latitude, lng: longitude });
          toast.success(`Location detected: ${city}, ${state}`);
        } catch {
          // Fallback: just store coordinates without address
          setUserLocation({ city: "", state: "", lat: latitude, lng: longitude });
          toast.success("GPS coordinates captured");
        } finally {
          setLocationLoading(false);
        }
      },
      (error) => {
        setLocationLoading(false);
        toast.error("Could not detect location. Please enter manually.");
        setUseManual(true);
      },
    );
  };

  const handleManualLocationSubmit = () => {
    if (!manualAddress.trim() && (!manualCity.trim() || !manualState.trim())) {
      toast.error("Please enter your location");
      return;
    }
    const city = manualCity.trim();
    const state = manualState.trim();
    const address = manualAddress.trim() || `${city}, ${state}`;
    setUserLocation({ address, city, state, lat: 0, lng: 0 });
    toast.success(`Location set: ${address}`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!session?.user) {
      toast.error("Please sign in to book a test drive", {
        description: "You need to be logged in to complete this booking.",
        action: {
          label: "Sign In",
          onClick: () => router.push("/sign-in"),
        },
      });
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
    startDateTime.setHours(parseInt(startTime), 0, 0, 0);

    const endDateTime = new Date(endDate);
    endDateTime.setHours(parseInt(endTime), 0, 0, 0);

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
                              i < parseInt(startTime) + 1;

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
                        setUseManual(false);
                        setManualCity("");
                        setManualState("");
                        setManualAddress("");
                      }
                    }}
                  />
                </div>

                {isDelivery && (
                  <div className="space-y-3 pt-1">
                    {!userLocation ? (
                      <>
                        {!useManual ? (
                          <button
                            type="button"
                            onClick={handleDetectLocation}
                            disabled={locationLoading}
                            className="flex items-center gap-2 w-full justify-center py-2.5 px-4 rounded-lg border border-blue-300 dark:border-blue-600 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 text-sm font-medium hover:bg-blue-100 dark:hover:bg-blue-950/60 transition-colors disabled:opacity-60"
                          >
                            {locationLoading ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <MapPin className="w-4 h-4" />
                            )}
                            {locationLoading ? "Detecting..." : "Detect My Location"}
                          </button>
                        ) : null}

                        {useManual && (
                          <div className="space-y-2">
                            <input
                              type="text"
                              placeholder="Current Location (e.g. 123 MG Road, Mumbai, Maharashtra)"
                              value={manualAddress}
                              onChange={(e) => setManualAddress(e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <div className="grid grid-cols-2 gap-2">
                              <input
                                type="text"
                                placeholder="City"
                                value={manualCity}
                                onChange={(e) => setManualCity(e.target.value)}
                                className="px-3 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                              <input
                                type="text"
                                placeholder="State"
                                value={manualState}
                                onChange={(e) => setManualState(e.target.value)}
                                className="px-3 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={handleManualLocationSubmit}
                              className="w-full py-2 px-4 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
                            >
                              Set Location
                            </button>
                          </div>
                        )}

                        {!useManual && (
                          <button
                            type="button"
                            onClick={() => setUseManual(true)}
                            className="text-xs text-gray-500 dark:text-gray-400 underline underline-offset-2 w-full text-center"
                          >
                            Enter manually instead
                          </button>
                        )}
                      </>
                    ) : (
                      <div className="flex items-center justify-between bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg px-3 py-2.5">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-green-600 shrink-0" />
                          <span className="text-sm text-green-800 dark:text-green-300 font-medium">
                            {userLocation.address ||
                              (userLocation.city && userLocation.state
                                ? `${userLocation.city}, ${userLocation.state}`
                                : "Location set")}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setUserLocation(null);
                            setUseManual(false);
                            setManualCity("");
                            setManualState("");
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
                  : `Pay $${totalPrice.toLocaleString()} & Confirm Booking`}
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
