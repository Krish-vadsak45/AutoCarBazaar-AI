"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card"; // Reduced imports to keep cards clean
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Clock, Save, Loader2, CalendarDays, Moon, Sun } from "lucide-react";
import { Badge } from "@/components/ui/badge";

type DaySchedule = {
  day: string;
  isOpen: boolean;
  openTime: string;
  closeTime: string;
};

// Times for dropdown (00:00 to 23:30)
const timeOptions = Array.from({ length: 48 }).map((_, i) => {
  const hour = Math.floor(i / 2);
  const minute = i % 2 === 0 ? "00" : "30";
  const formattedHour = hour.toString().padStart(2, "0");
  return `${formattedHour}:${minute}`;
});

export default function WorkingHoursPage() {
  const [schedule, setSchedule] = useState<DaySchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Fetch initial data
  useEffect(() => {
    const fetchHours = async () => {
      try {
        const { data } = await axios.get("/api/working-hours");
        console.log("Fetched schedule:", data);
        setSchedule(data.workingHours);
      } catch (error) {
        toast.error("Failed to load schedule");
      } finally {
        setLoading(false);
      }
    };
    fetchHours();
  }, []);

  const handleToggle = (index: number) => {
    setSchedule((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, isOpen: !item.isOpen } : item,
      ),
    );
  };

  const handleTimeChange = (
    index: number,
    field: "openTime" | "closeTime",
    value: string,
  ) => {
    setSchedule((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)),
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await axios.patch("/api/working-hours", { workingHours: schedule });
      toast.success("Schedule updated successfully");
    } catch (error) {
      toast.error("Failed to update schedule");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
            <Clock className="h-8 w-8 text-primary" />
            Working Hours
          </h1>
          <p className="text-muted-foreground mt-1">
            Configure your weekly availability and operation timings.
          </p>
        </div>
        <Button
          onClick={handleSave}
          disabled={saving}
          size="lg"
          className="shadow-lg shadow-primary/20"
        >
          {saving ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          Save Changes
        </Button>
      </div>

      {/* Grid Layout for Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {schedule.map((day, index) => (
          <Card
            key={day.day}
            className={`transition-all duration-300 border-2 overflow-hidden ${
              day.isOpen
                ? "bg-card border-border shadow-sm hover:shadow-md"
                : "bg-muted/30 border-dashed border-border opacity-70"
            }`}
          >
            <CardContent className="p-6 space-y-6">
              {/* Card Header: Day & Switch */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-lg ${
                      day.isOpen
                        ? "bg-primary/10 text-primary"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    <CalendarDays className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base capitalize">
                      {day.day}
                    </h3>
                    <Badge
                      variant={day.isOpen ? "default" : "secondary"}
                      className="text-[10px] h-5 px-2 mt-0.5"
                    >
                      {day.isOpen ? "Open" : "Closed"}
                    </Badge>
                  </div>
                </div>
                <Switch
                  checked={day.isOpen}
                  onCheckedChange={() => handleToggle(index)}
                />
              </div>

              {/* Time Selection */}
              <div
                className={`space-y-4 pt-2 ${
                  !day.isOpen &&
                  "opacity-50 pointer-events-none filter grayscale"
                }`}
              >
                <div className="grid grid-cols-2 gap-4">
                  {/* Open Time */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase">
                      <Sun className="h-3 w-3" /> Opens at
                    </div>
                    <Select
                      value={day.openTime}
                      onValueChange={(val) =>
                        handleTimeChange(index, "openTime", val)
                      }
                      disabled={!day.isOpen}
                    >
                      <SelectTrigger className="w-full bg-background">
                        <SelectValue placeholder="--:--" />
                      </SelectTrigger>
                      <SelectContent>
                        {timeOptions.map((time) => (
                          <SelectItem key={`open-${time}`} value={time}>
                            {time}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Close Time */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase">
                      <Moon className="h-3 w-3" /> Closes at
                    </div>
                    <Select
                      value={day.closeTime}
                      onValueChange={(val) =>
                        handleTimeChange(index, "closeTime", val)
                      }
                      disabled={!day.isOpen}
                    >
                      <SelectTrigger className="w-full bg-background">
                        <SelectValue placeholder="--:--" />
                      </SelectTrigger>
                      <SelectContent>
                        {timeOptions.map((time) => (
                          <SelectItem key={`close-${time}`} value={time}>
                            {time}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
