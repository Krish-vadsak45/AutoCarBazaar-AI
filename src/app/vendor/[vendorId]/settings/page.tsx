'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Clock, Save, Loader2, CalendarDays, Moon, Sun, MapPin, Check } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent } from '@/components/ui/card'; // Reduced imports to keep cards clean
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Loading from '@/components/Loading';
import { Badge } from '@/components/ui/badge';

type DaySchedule = {
  day: string;
  isOpen: boolean;
  openTime: string;
  closeTime: string;
};

// Times for dropdown (00:00 to 23:30)
const timeOptions = Array.from({ length: 48 }).map((_, i) => {
  const hour = Math.floor(i / 2);
  const minute = i % 2 === 0 ? '00' : '30';
  const formattedHour = hour.toString().padStart(2, '0');
  return `${formattedHour}:${minute}`;
});

export default function WorkingHoursPage() {
  const [schedule, setSchedule] = useState<DaySchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Delivery location state
  const [vendorLocation, setVendorLocation] = useState<{
    lat: number | null;
    lng: number | null;
    city: string;
    state: string;
  }>({
    lat: null,
    lng: null,
    city: '',
    state: '',
  });
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationSaving, setLocationSaving] = useState(false);

  // Fetch initial data
  useEffect(() => {
    const fetchHours = async () => {
      try {
        const { data } = await axios.get('/api/working-hours');
        setSchedule(data.workingHours);
      } catch (error) {
        console.error('Failed to load schedule', error);
        toast.error('Failed to load schedule');
      } finally {
        setLoading(false);
      }
    };
    const fetchLocation = async () => {
      try {
        const { data } = await axios.get('/api/vendor-location');
        setVendorLocation({
          lat: data.lat,
          lng: data.lng,
          city: data.city,
          state: data.state,
        });
      } catch {
        // Silently fail — location not required
      }
    };
    fetchHours();
    fetchLocation();
  }, []);

  const handleToggle = (index: number) => {
    setSchedule((prev) =>
      prev.map((item, i) => (i === index ? { ...item, isOpen: !item.isOpen } : item))
    );
  };

  const handleTimeChange = (index: number, field: 'openTime' | 'closeTime', value: string) => {
    setSchedule((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  };

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }
    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
          );
          const data = await res.json();
          const city =
            data.address?.city ||
            data.address?.town ||
            data.address?.village ||
            data.address?.county ||
            '';
          const state = data.address?.state || '';
          setVendorLocation({ lat: latitude, lng: longitude, city, state });
          toast.success(`Location detected: ${city}, ${state}`);
        } catch {
          setVendorLocation((prev) => ({
            ...prev,
            lat: latitude,
            lng: longitude,
          }));
          toast.success('GPS coordinates captured');
        } finally {
          setLocationLoading(false);
        }
      },
      () => {
        setLocationLoading(false);
        toast.error('Could not detect location. Please try again.');
      }
    );
  };

  const handleSaveLocation = async () => {
    if (vendorLocation.lat === null || vendorLocation.lng === null) {
      toast.error('Please detect your location first');
      return;
    }
    setLocationSaving(true);
    try {
      await axios.patch('/api/vendor-location', {
        lat: vendorLocation.lat,
        lng: vendorLocation.lng,
      });
      toast.success('Delivery location saved');
    } catch {
      toast.error('Failed to save location');
    } finally {
      setLocationSaving(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await axios.patch('/api/working-hours', { workingHours: schedule });
      toast.success('Schedule updated successfully');
    } catch (error) {
      console.error('Failed to update schedule', error);
      toast.error('Failed to update schedule');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <Loading />;
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

      {/* Delivery Location Section */}
      <div className="border border-border rounded-xl p-6 bg-card space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              Delivery Location
            </h2>
            <p className="text-muted-foreground text-sm mt-1">
              Set your location so customers can see the distance for delivery requests.
            </p>
          </div>
          <Button
            onClick={handleSaveLocation}
            disabled={locationSaving || vendorLocation.lat === null}
            size="lg"
            className="shadow-lg shadow-primary/20 shrink-0"
          >
            {locationSaving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Save Location
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <button
            type="button"
            onClick={handleDetectLocation}
            disabled={locationLoading}
            className="flex items-center gap-2 py-2.5 px-5 rounded-lg border border-primary/40 bg-primary/5 text-primary text-sm font-medium hover:bg-primary/10 transition-colors disabled:opacity-60"
          >
            {locationLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <MapPin className="w-4 h-4" />
            )}
            {locationLoading ? 'Detecting...' : 'Use My Current Location'}
          </button>

          {vendorLocation.lat !== null && (
            <div className="flex items-center gap-2 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg px-4 py-2.5">
              <Check className="w-4 h-4 text-green-600 shrink-0" />
              <span className="text-sm font-medium text-green-800 dark:text-green-300">
                {vendorLocation.city && vendorLocation.state
                  ? `Location set: ${vendorLocation.city}, ${vendorLocation.state}`
                  : `Coordinates: ${vendorLocation.lat?.toFixed(4)}, ${vendorLocation.lng?.toFixed(4)}`}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Grid Layout for Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {schedule.map((day, index) => (
          <Card
            key={day.day}
            className={`transition-all duration-300 border-2 overflow-hidden ${
              day.isOpen
                ? 'bg-card border-border shadow-sm hover:shadow-md'
                : 'bg-muted/30 border-dashed border-border opacity-70'
            }`}
          >
            <CardContent className="p-6 space-y-6">
              {/* Card Header: Day & Switch */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-lg ${
                      day.isOpen ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    <CalendarDays className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base capitalize">{day.day}</h3>
                    <Badge
                      variant={day.isOpen ? 'default' : 'secondary'}
                      className="text-[10px] h-5 px-2 mt-0.5"
                    >
                      {day.isOpen ? 'Open' : 'Closed'}
                    </Badge>
                  </div>
                </div>
                <Switch checked={day.isOpen} onCheckedChange={() => handleToggle(index)} />
              </div>

              {/* Time Selection */}
              <div
                className={`space-y-4 pt-2 ${
                  !day.isOpen && 'opacity-50 pointer-events-none filter grayscale'
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
                      onValueChange={(val) => handleTimeChange(index, 'openTime', val)}
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
                      onValueChange={(val) => handleTimeChange(index, 'closeTime', val)}
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
