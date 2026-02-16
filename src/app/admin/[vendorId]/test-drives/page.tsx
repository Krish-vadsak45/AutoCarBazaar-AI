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
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import { toast } from "sonner";

interface ITestDrive {
  _id: string;
  carId: {
    _id: string;
    title: string;
    images: string[];
    price: number;
  };
  userId: {
    _id: string;
    name: string;
    email: string;
  };
  startDate: string;
  startTime: string;
  endTime: string;
  notes?: string;
  status: "pending" | "confirmed" | "completed" | "cancelled";
}

type Status = "pending" | "confirmed" | "completed" | "cancelled";

const statusColors: Record<Status, string> = {
  pending:
    "bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-300",
  confirmed:
    "bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300",
  completed: "bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300",
  cancelled: "bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300",
};

export default function TestDrivesPage() {
  const params = useParams();
  const vendorId = params?.vendorId;

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [drives, setDrives] = useState<ITestDrive[]>([]);
  const [loading, setLoading] = useState(true);

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
          d._id === driveId ? { ...d, status: newStatus as Status } : d,
        ),
      );
      toast.success(`Status updated to ${newStatus}`);
    } catch (error) {
      console.error("Failed to update status:", error);
      toast.error("Failed to update status");
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

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
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
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
          {filteredDrives.length > 0 ? (
            filteredDrives.map((drive) => (
              <div
                key={drive._id}
                className="flex flex-col md:flex-row gap-6 p-4 border border-border rounded-lg hover:bg-muted/30 transition-colors"
              >
                {/* Car Image */}
                {/* <div className="md:w-48 flex-shrink-0">
                  <Image
                    src={drive.carId?.images?.[0] || drive.carId?.images || "/placeholder.svg"}
                    alt={drive.carId?.title}
                    className="w-full h-32 md:h-40 rounded-lg object-cover"
                  />
                </div> */}

                {/* Content */}
                <div className="flex-1 space-y-4">
                  {/* Header with Status */}
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">
                        {drive.carId?.title}
                      </h3>
                      <Badge
                        className={
                          statusColors[drive.status] || "bg-gray-100 uppercase"
                        }
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
                          onClick={() => updateStatus(drive._id, "pending")}
                        >
                          <div className="h-2 w-2 rounded-full bg-orange-500 mr-2" />
                          Pending
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => updateStatus(drive._id, "confirmed")}
                        >
                          <div className="h-2 w-2 rounded-full bg-green-500 mr-2" />
                          Confirmed
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => updateStatus(drive._id, "completed")}
                        >
                          <div className="h-2 w-2 rounded-full bg-blue-500 mr-2" />
                          Completed
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => updateStatus(drive._id, "cancelled")}
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
                      <span>
                        {new Date(drive.startDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="h-4 w-4 flex-shrink-0" />
                      <span>
                        {drive.startTime} - {drive.endTime}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <User className="h-4 w-4 flex-shrink-0" />
                      <span>
                        {drive.userId?.name} ({drive.userId?.email})
                      </span>
                    </div>
                  </div>

                  {/* Notes Section */}
                  <div className="bg-muted/50 p-3 rounded-lg">
                    <p className="text-sm text-foreground">
                      <strong>Notes:</strong>{" "}
                      {drive.notes || "No notes provided"}
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
                      <a href={`/car/${drive.carId?._id}`} target="_blank">
                        <Eye className="h-4 w-4" />
                        View Car
                      </a>
                    </Button>
                    {drive.status === "pending" && (
                      <Button
                        variant="destructive"
                        size="sm"
                        className="gap-2"
                        onClick={() => updateStatus(drive._id, "cancelled")}
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
