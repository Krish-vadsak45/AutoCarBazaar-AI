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

  useEffect(() => {
    fetchTestDrives();
  }, []);

  const fetchTestDrives = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/vendor/test-drives");
      if (!response.ok) throw new Error("Failed to fetch test drives");
      const data = await response.json();

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
      const response = await fetch("/api/vendor/test-drives", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: driveId, status: newStatus }),
      });

      if (!response.ok) throw new Error("Failed to update status");

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
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">
                        {drive.car}
                      </h3>
                      <Badge
                        className={statusColors[drive.status] || "bg-gray-100"}
                      >
                        {drive.status}
                      </Badge>
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
                          onClick={() => updateStatus(drive.id, "CONFIRMED")}
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
