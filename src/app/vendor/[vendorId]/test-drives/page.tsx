"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Calendar,
  Clock,
  User,
  MapPin,
  MoreVertical,
  Eye,
  X,
  Loader2,
} from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import axios from "axios";

type Status = "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED";

interface TestDriveData {
  id: string;
  carId: string;
  car: string;
  date: string;
  time: string;
  customer: string;
  status: Status;
  notes: string;
  image: string;
  isDelivery: boolean;
  userLocationCity?: string;
  userLocationState?: string;
  userLocationLat?: number;
  userLocationLng?: number;
  userLocationAddress?: string;
  distanceKm?: number;
}

interface DistanceResult {
  distance: string;
  duration: string;
  originAddress: string;
  destinationAddress: string;
}

const statusColors: Record<Status, string> = {
  PENDING:
    "bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-300",
  CONFIRMED:
    "bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300",
  COMPLETED: "bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300",
  CANCELLED: "bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300",
};

export default function TestDrivesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [drives, setDrives] = useState<TestDriveData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [vendorLat, setVendorLat] = useState<number | null>(null);
  const [vendorLng, setVendorLng] = useState<number | null>(null);
  const [vendorCity, setVendorCity] = useState("");
  const [vendorStateStr, setVendorStateStr] = useState("");

  // Accept delivery flow
  const [acceptingDrive, setAcceptingDrive] = useState<TestDriveData | null>(
    null,
  );
  const [vendorAddressInput, setVendorAddressInput] = useState("");
  const [distanceResult, setDistanceResult] = useState<DistanceResult | null>(
    null,
  );
  const [distanceLoading, setDistanceLoading] = useState(false);

  useEffect(() => {
    fetchVendorLocation();
    fetchTestDrives();
  }, []);

  const fetchVendorLocation = async () => {
    try {
      const { data } = await axios.get("/api/vendor-location");
      if (data.lat && data.lng) {
        setVendorLat(data.lat);
        setVendorLng(data.lng);
      }
      if (data.city) setVendorCity(data.city);
      if (data.state) setVendorStateStr(data.state);
    } catch {
      // Location not set — distance won't be shown
    }
  };

  const fetchTestDrives = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get("/api/vendor/test-drives");
      const data = response.data;

      const formattedData: TestDriveData[] = data.map((item: any) => ({
        id: item._id,
        carId: item.carId?._id || "",
        car: item.carId?.title || "Unknown Car",
        date: new Date(item.startDate).toLocaleDateString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
        time: `${item.startTime} - ${item.endTime}`,
        customer: item.userId?.name || "Anonymous",
        status: item.status as Status,
        notes: item.notes || "No notes provided",
        image:
          item.carId?.image || item.carId?.images?.[0] || "/placeholder.svg",
        isDelivery: item.isDelivery || false,
        userLocationCity: item.userLocation?.city,
        userLocationState: item.userLocation?.state,
        userLocationLat: item.userLocation?.lat,
        userLocationLng: item.userLocation?.lng,
        userLocationAddress: item.userLocation?.address,
      }));

      setDrives(formattedData);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load test drives");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredDrives = drives.filter((drive) => {
    const matchesSearch =
      drive.car.toLowerCase().includes(searchQuery.toLowerCase()) ||
      drive.customer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || drive.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const updateStatus = async (driveId: string, newStatus: string) => {
    try {
      await axios.patch("/api/vendor/test-drives", {
        id: driveId,
        status: newStatus,
      });

      setDrives(
        drives.map((d) =>
          d.id === driveId ? { ...d, status: newStatus as Status } : d,
        ),
      );
      toast.success(`Status updated to ${newStatus}`);
    } catch (error) {
      console.error(error);
      toast.error("Failed to update status");
    }
  };

  const openAcceptPanel = (drive: TestDriveData) => {
    setAcceptingDrive(drive);
    setDistanceResult(null);
    // Pre-fill vendor address from their profile
    const pre = [vendorCity, vendorStateStr].filter(Boolean).join(", ");
    setVendorAddressInput(pre);
  };

  const handleCalculateDistance = async () => {
    if (!acceptingDrive) return;
    const userAddr =
      acceptingDrive.userLocationAddress ||
      [acceptingDrive.userLocationCity, acceptingDrive.userLocationState]
        .filter(Boolean)
        .join(", ");
    if (!userAddr) {
      toast.error("User location not available");
      return;
    }
    if (!vendorAddressInput.trim()) {
      toast.error("Please enter your location");
      return;
    }
    setDistanceLoading(true);
    try {
      const { data } = await axios.get("/api/calculate-distance", {
        params: { origins: vendorAddressInput, destinations: userAddr },
      });
      setDistanceResult(data);
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to calculate distance");
    } finally {
      setDistanceLoading(false);
    }
  };

  const handleConfirmAccept = async () => {
    if (!acceptingDrive) return;
    await updateStatus(acceptingDrive.id, "CONFIRMED");
    setAcceptingDrive(null);
    setDistanceResult(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Test Drive Management
        </h1>
        <p className="text-muted-foreground mt-2">
          Manage all test drive reservations and update their status
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by car or customer..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full md:w-48">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="CONFIRMED">Confirmed</SelectItem>
            <SelectItem value="COMPLETED">Completed</SelectItem>
            <SelectItem value="CANCELLED">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Test Drive Cards */}
      <Card>
        <CardHeader>
          <CardTitle>Test Drive Bookings</CardTitle>
          <CardDescription>
            Manage all test drive reservations and update their status
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-muted-foreground">Loading test drives...</p>
            </div>
          ) : filteredDrives.length > 0 ? (
            filteredDrives.map((drive) => (
              <div
                key={drive.id}
                className="flex flex-col md:flex-row gap-6 p-4 border border-border rounded-lg hover:bg-muted/30 transition-colors"
              >
                {/* Car Image */}
                <div className="md:w-48 flex-shrink-0">
                  <img
                    src={drive.image || "/placeholder.svg"}
                    alt={drive.car}
                    className="w-full h-32 md:h-40 rounded-lg object-cover"
                  />
                </div>

                {/* Content */}
                <div className="flex-1 space-y-4">
                  {/* Header with Status */}
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                    <div className="space-y-1">
                      <h3 className="text-lg font-semibold text-foreground">
                        {drive.car}
                      </h3>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge
                          className={
                            statusColors[drive.status] || "bg-gray-100"
                          }
                        >
                          {drive.status}
                        </Badge>
                        {drive.isDelivery && (
                          <Badge className="bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 gap-1">
                            <MapPin className="h-3 w-3" />
                            DELIVERY
                          </Badge>
                        )}
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => updateStatus(drive.id, "PENDING")}
                        >
                          <div className="h-2 w-2 rounded-full bg-orange-500 mr-2" />
                          Pending
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            drive.isDelivery
                              ? openAcceptPanel(drive)
                              : updateStatus(drive.id, "CONFIRMED")
                          }
                        >
                          <div className="h-2 w-2 rounded-full bg-green-500 mr-2" />
                          Confirmed
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => updateStatus(drive.id, "COMPLETED")}
                        >
                          <div className="h-2 w-2 rounded-full bg-blue-500 mr-2" />
                          Completed
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => updateStatus(drive.id, "CANCELLED")}
                        >
                          <div className="h-2 w-2 rounded-full bg-red-500 mr-2" />
                          Cancelled
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-4 w-4 flex-shrink-0" />
                      <span>{drive.date}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="h-4 w-4 flex-shrink-0" />
                      <span>{drive.time}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <User className="h-4 w-4 flex-shrink-0" />
                      <span>{drive.customer}</span>
                    </div>
                    {drive.isDelivery && drive.userLocationCity && (
                      <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400">
                        <MapPin className="h-4 w-4 flex-shrink-0" />
                        <span>
                          {drive.userLocationAddress}, {drive.userLocationCity},{" "}
                          {drive.userLocationState}
                          {vendorLat &&
                            vendorLng &&
                            drive.userLocationLat &&
                            drive.userLocationLng && (
                              <span className="ml-1 text-muted-foreground">
                                ( km away)
                              </span>
                            )}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Notes Section */}
                  <div className="bg-muted/50 p-3 rounded-lg">
                    <p className="text-sm text-foreground">
                      <strong>Notes:</strong> {drive.notes}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 flex-wrap pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2 bg-transparent"
                      asChild
                    >
                      <a
                        href={`/car/${drive.carId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Eye className="h-4 w-4" />
                        View Car
                      </a>
                    </Button>
                    {drive.status === "PENDING" && drive.isDelivery && (
                      <Button
                        size="sm"
                        className="gap-2 bg-green-600 hover:bg-green-700 text-white"
                        onClick={() => openAcceptPanel(drive)}
                      >
                        <MapPin className="h-4 w-4" />
                        Accept Delivery
                      </Button>
                    )}
                    {drive.status === "PENDING" && (
                      <Button
                        variant="destructive"
                        size="sm"
                        className="gap-2"
                        onClick={() => updateStatus(drive.id, "CANCELLED")}
                      >
                        <X className="h-4 w-4" />
                        Cancel
                      </Button>
                    )}
                  </div>

                  {/* Accept Delivery Panel */}
                  {acceptingDrive?.id === drive.id && (
                    <div className="mt-3 border border-green-200 dark:border-green-800 rounded-lg p-4 bg-green-50 dark:bg-green-950/20 space-y-3">
                      <p className="text-sm font-semibold text-green-800 dark:text-green-300">
                        Confirm Delivery — Calculate Distance
                      </p>

                      {/* User location (read-only) */}
                      <div className="space-y-1">
                        <label className="text-xs text-muted-foreground uppercase font-medium">
                          Customer Location
                        </label>
                        <p className="text-sm text-foreground bg-white dark:bg-slate-800 border border-border rounded-lg px-3 py-2">
                          {drive.userLocationAddress +
                            ", " +
                            drive.userLocationCity +
                            ", " +
                            drive.userLocationState || "Not provided"}
                        </p>
                      </div>

                      {/* Vendor location input */}
                      <div className="space-y-1">
                        <label className="text-xs text-muted-foreground uppercase font-medium">
                          Your Location
                        </label>
                        <input
                          type="text"
                          placeholder="Enter your full address or city, state"
                          value={vendorAddressInput}
                          onChange={(e) => {
                            setVendorAddressInput(e.target.value);
                            setDistanceResult(null);
                          }}
                          className="w-full px-3 py-2 text-sm border border-border bg-white dark:bg-slate-800 text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                      </div>

                      {/* Distance result */}
                      {distanceResult && (
                        <div className="flex items-center gap-3 bg-white dark:bg-slate-800 border border-border rounded-lg px-3 py-2.5 text-sm">
                          <MapPin className="h-4 w-4 text-green-600 shrink-0" />
                          <div>
                            <span className="font-semibold text-foreground">
                              {distanceResult.distance}
                            </span>
                            <span className="text-muted-foreground ml-2">
                              (~{distanceResult.duration})
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Buttons */}
                      <div className="flex gap-2 flex-wrap">
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-2"
                          disabled={distanceLoading}
                          onClick={handleCalculateDistance}
                        >
                          {distanceLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <MapPin className="h-4 w-4" />
                          )}
                          {distanceLoading ? "Calculating..." : "Get Distance"}
                        </Button>
                        <Button
                          size="sm"
                          className="gap-2 bg-green-600 hover:bg-green-700 text-white"
                          onClick={handleConfirmAccept}
                        >
                          Confirm Accept
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setAcceptingDrive(null);
                            setDistanceResult(null);
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                No test drives found matching your filters.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
