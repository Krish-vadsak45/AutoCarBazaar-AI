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
  Mail,
  Eye,
  EyeOff,
  MoreVertical,
  X,
  Loader2,
  Zap,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import { toast } from "sonner";

interface ITestDrive {
  _id: string;
  status: "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED";
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  notes?: string;
  carId: {
    title: string;
    transmission?: string;
    images?: string[];
  };
  userId: {
    name: string;
    email: string;
  };
}

type Status = "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED";

const statusColors: Record<Status, string> = {
  PENDING:
    "bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-300",
  CONFIRMED:
    "bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300",
  COMPLETED: "bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300",
  CANCELLED: "bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300",
};

export default function TestDrivesPage() {
  const params = useParams();
  const vendorId = params?.vendorId;

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [drives, setDrives] = useState<ITestDrive[]>([]);
  const [loading, setLoading] = useState(true);
  const [emailVisibility, setEmailVisibility] = useState<
    Record<string, boolean>
  >({});

  // Fetch Test Drives
  useEffect(() => {
    const fetchDrives = async () => {
      if (!vendorId) return;
      try {
        setLoading(true);
        const { data } = await axios.get(`/api/vendor/test-drives/${vendorId}`);
        setDrives(data);
      } catch (error) {
        console.error("Failed to fetch test drives:", error);
        toast.error("Could not load test drives");
      } finally {
        setLoading(false);
      }
    };

    fetchDrives();
  }, [vendorId]);

  const filteredDrives = drives.filter((drive) => {
    const matchesSearch =
      drive.carId?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      drive.userId?.name?.toLowerCase().includes(searchQuery.toLowerCase());
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
          d._id === driveId ? { ...d, status: newStatus as Status } : d
        )
      );
      toast.success(`Status updated to ${newStatus}`);
    } catch (error) {
      console.error("Failed to update status:", error);
      toast.error("Failed to update status");
    }
  };

  const toggleEmailVisibility = (driveId: string) => {
    setEmailVisibility((prev) => ({
      ...prev,
      [driveId]: !prev[driveId],
    }));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header Section */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Test Drive Management
        </h1>
        <p className="mt-2 text-muted-foreground">
          Manage all test drive reservations and update their status
        </p>
      </div>

      {/* Filter Section */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by car title or customer name..."
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

      {/* Test Drive Cards Section */}
      <Card>
        <CardHeader>
          <CardTitle>Test Drive Bookings</CardTitle>
          <CardDescription>
            Total Bookings: {filteredDrives.length}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {filteredDrives.length > 0 ? (
            filteredDrives.map((drive) => (
              <div
                key={drive._id}
                className="overflow-hidden rounded-lg border border-border transition-colors hover:bg-muted/30"
              >
                {/* Top Section - Status and Actions */}
                <div className="flex flex-col gap-4 border-b border-border p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex flex-col gap-2">
                    <h3 className="text-lg font-semibold text-foreground">
                      {drive.carId?.title}
                    </h3>
                    <Badge className={statusColors[drive.status]}>
                      {drive.status}
                    </Badge>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => updateStatus(drive._id, "PENDING")}
                      >
                        <div className="mr-2 h-2 w-2 rounded-full bg-orange-500" />
                        Pending
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => updateStatus(drive._id, "CONFIRMED")}
                      >
                        <div className="mr-2 h-2 w-2 rounded-full bg-green-500" />
                        Confirmed
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => updateStatus(drive._id, "COMPLETED")}
                      >
                        <div className="mr-2 h-2 w-2 rounded-full bg-blue-500" />
                        Completed
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => updateStatus(drive._id, "CANCELLED")}
                      >
                        <div className="mr-2 h-2 w-2 rounded-full bg-red-500" />
                        Cancelled
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Main Content - Image and Details */}
                <div className="flex flex-col gap-4 p-4 lg:flex-row">
                  {/* Image Placeholder */}
                  <div className="flex-shrink-0 lg:w-48">
                    <div className="flex h-40 w-full items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/20 bg-muted/20">
                      <div className="text-center">
                        <div className="mb-2 flex justify-center">
                          <svg
                            className="h-8 w-8 text-muted-foreground/40"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Car Image
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Details Section */}
                  <div className="flex-1 space-y-4">
                    {/* Car Details */}
                    <div className="rounded-lg bg-muted/30 p-3">
                      <p className="text-sm font-medium text-foreground mb-1">
                        Car Details
                      </p>
                      <div className="space-y-1 text-sm">
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">Title:</span>
                          <span className="font-medium">
                            {drive.carId?.title}
                          </span>
                        </div>
                        {drive.carId?.transmission && (
                          <div className="flex items-center gap-2">
                            <Zap className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">
                              Transmission:
                            </span>
                            <span className="font-medium">
                              {drive.carId.transmission}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Test Drive Schedule */}
                    <div className="rounded-lg bg-muted/30 p-3">
                      <p className="text-sm font-medium text-foreground mb-2">
                        Test Drive Schedule
                      </p>
                      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-xs text-muted-foreground">
                              Start Date
                            </p>
                            <p className="text-sm font-medium">
                              {formatDate(drive.startDate)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-xs text-muted-foreground">
                              End Date
                            </p>
                            <p className="text-sm font-medium">
                              {formatDate(drive.endDate)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-xs text-muted-foreground">
                              Start Time
                            </p>
                            <p className="text-sm font-medium">
                              {drive.startTime}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-xs text-muted-foreground">
                              End Time
                            </p>
                            <p className="text-sm font-medium">
                              {drive.endTime}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Customer Details */}
                    <div className="rounded-lg bg-muted/30 p-3">
                      <p className="text-sm font-medium text-foreground mb-2">
                        Booking Customer
                      </p>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">
                            {drive.userId?.name}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            {emailVisibility[drive._id] ? (
                              <span className="text-sm font-medium">
                                {drive.userId?.email}
                              </span>
                            ) : (
                              <span className="text-sm text-muted-foreground">
                                ••••••••••••••••
                              </span>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleEmailVisibility(drive._id)}
                            className="h-6 w-6 p-0"
                            title={
                              emailVisibility[drive._id]
                                ? "Hide email"
                                : "Show email"
                            }
                          >
                            {emailVisibility[drive._id] ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Notes Section */}
                    {drive.notes && (
                      <div className="rounded-lg bg-muted/30 p-3">
                        <p className="text-sm font-medium text-foreground mb-1">
                          Notes
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {drive.notes}
                        </p>
                      </div>
                    )}

                    {/* Action Buttons */}
                    {drive.status === "PENDING" && (
                      <div className="flex gap-2 pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateStatus(drive._id, "CONFIRMED")}
                          className="flex-1 sm:flex-none"
                        >
                          Confirm Booking
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => updateStatus(drive._id, "CANCELLED")}
                          className="gap-2"
                        >
                          <X className="h-4 w-4" />
                          Cancel
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
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
