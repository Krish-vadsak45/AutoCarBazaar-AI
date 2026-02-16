"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { ChevronLeft, Check, CalendarIcon, Clock } from "lucide-react";
import Image from "next/image";
import { SuccessModal } from "@/components/success-modal";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "react-toastify";

const TimePicker = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (val: string) => void;
}) => {
  const [hour, setHour] = useState(value.split(":")[0]);
  const [minute, setMinute] = useState(value.split(":")[1]);
  const [period, setPeriod] = useState("AM");

  // Convert 24h to 12h for initialization
  useEffect(() => {
    const [h, m] = value.split(":");
    let hNum = parseInt(h);
    const p = hNum >= 12 ? "PM" : "AM";
    if (hNum > 12) hNum -= 12;
    if (hNum === 0) hNum = 12;
    setHour(hNum.toString().padStart(2, "0"));
    setMinute(m);
    setPeriod(p);
  }, []);

  const updateTime = (h: string, m: string, p: string) => {
    let hNum = parseInt(h);
    if (p === "PM" && hNum < 12) hNum += 12;
    if (p === "AM" && hNum === 12) hNum = 0;
    onChange(`${hNum.toString().padStart(2, "0")}:${m}`);
  };

  return (
    <div className="flex gap-2">
      <Select
        value={hour}
        onValueChange={(v) => {
          setHour(v);
          updateTime(v, minute, period);
        }}
      >
        <SelectTrigger className="w-[70px] border-gray-300 dark:border-slate-700">
          <SelectValue placeholder="HH" />
        </SelectTrigger>
        <SelectContent>
          {Array.from({ length: 12 }, (_, i) => i + 1).map((h) => (
            <SelectItem key={h} value={h.toString().padStart(2, "0")}>
              {h.toString().padStart(2, "0")}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <span className="flex items-center">:</span>
      <Select
        value={minute}
        onValueChange={(v) => {
          setMinute(v);
          updateTime(hour, v, period);
        }}
      >
        <SelectTrigger className="w-[70px] border-gray-300 dark:border-slate-700">
          <SelectValue placeholder="MM" />
        </SelectTrigger>
        <SelectContent>
          {["00", "15", "30", "45"].map((m) => (
            <SelectItem key={m} value={m}>
              {m}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        value={period}
        onValueChange={(v) => {
          setPeriod(v);
          updateTime(hour, minute, v);
        }}
      >
        <SelectTrigger className="w-[75px] border-gray-300 dark:border-slate-700">
          <SelectValue placeholder="AM/PM" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="AM">AM</SelectItem>
          <SelectItem value="PM">PM</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default function TestDrivePage() {
  const router = useRouter();
  const params = useParams();
  const carId = Array.isArray(params?.id) ? params?.id[0] : params?.id;
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");
  const [notes, setNotes] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate || !startTime || !endDate || !endTime) {
      toast.error("Please select both start and end date and time");
      return;
    }

    setIsSubmitting(true);
    try {
      const axios = (await import("axios")).default;
      await axios.post("/api/test-drive", {
        carId,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        startTime,
        endTime,
        notes,
      });

      setBookingDetails({
        car: carDetails.name,
        start: `${format(startDate, "PPP")} at ${startTime}`,
        end: `${format(endDate, "PPP")} at ${endTime}`,
        dealership: "Vehicl Motors",
      });
      setShowSuccess(true);
    } catch (error: any) {
      console.error("Booking error:", error);
      toast.error(error.response?.data?.error || "Failed to book test drive");
    } finally {
      setIsSubmitting(false);
    }
  };

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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          {/* LEFT COLUMN - CAR DETAILS */}
          <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-gray-200 dark:border-slate-800 p-6 flex flex-col h-full">
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
                className="w-full h-64 object-cover"
              />
            </div>

            {/* Car Info */}
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                {carDetails.name}
              </h3>
              <p className="text-3xl font-bold text-blue-600 mb-8">
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
                    className="flex justify-between py-2 border-b border-gray-50 dark:border-slate-800 last:border-0 text-gray-700 dark:text-gray-300"
                  >
                    <span className="text-sm">{spec.label}</span>
                    <span className="font-semibold text-gray-900 dark:text-gray-100">
                      {spec.value}
                    </span>
                  </div>
                ))}
              </div>
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Start Date & Time */}
                <div className="space-y-4">
                  <Label className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    Start Date & Time
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
                            <span>Pick a date</span>
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
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <TimePicker value={startTime} onChange={setStartTime} />
                  </div>
                </div>

                {/* End Date & Time */}
                <div className="space-y-4">
                  <Label className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    End Date & Time
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
                            <span>Pick a date</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={endDate}
                          onSelect={setEndDate}
                          disabled={(date) =>
                            date <
                            (startDate ||
                              new Date(new Date().setHours(0, 0, 0, 0)))
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <TimePicker value={endTime} onChange={setEndTime} />
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
                  className="flex-1 w-full px-4 py-3 border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent resize-none min-h-[120px]"
                />
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-7 text-lg font-bold bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 text-white transition-all shadow-lg hover:shadow-blue-500/25 mt-auto"
              >
                {isSubmitting ? "Booking..." : "Confirm Test Drive Booking"}
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
