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
} from "lucide-react";
import { useState } from "react";

const testDrives: {
  id: number;
  car: string;
  date: string;
  time: string;
  customer: string;
  status: Status;
  notes: string;
  image: string;
}[] = [
  {
    id: 1,
    car: "2023 Hyundai i20",
    date: "Friday, March 21, 2025",
    time: "12:00 PM - 1:00 PM",
    customer: "Piyush Agarwal Biz",
    status: "Pending",
    notes: "This will be my first car",
    image:
      "https://images.unsplash.com/photo-1552820728-8ac41f1ce891?w=400&h=300&fit=crop",
  },
  {
    id: 2,
    car: "2024 Tata Nexon",
    date: "Saturday, March 22, 2025",
    time: "02:00 PM - 3:00 PM",
    customer: "Raj Kumar",
    status: "Confirmed",
    notes: "Interested in electric variants",
    image:
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop",
  },
  {
    id: 3,
    car: "2023 Mahindra Thar",
    date: "Sunday, March 23, 2025",
    time: "10:00 AM - 11:00 AM",
    customer: "Priya Singh",
    status: "Completed",
    notes: "Very interested, may purchase",
    image:
      "https://images.unsplash.com/photo-1605559424843-9e4c3ca4b2f7?w=400&h=300&fit=crop",
  },
];

type Status = "Pending" | "Confirmed" | "Completed" | "Cancelled";

const statusColors: Record<Status, string> = {
  Pending:
    "bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-300",
  Confirmed:
    "bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300",
  Completed: "bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300",
  Cancelled: "bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300",
};

export default function TestDrivesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [drives, setDrives] = useState(testDrives);

  const filteredDrives = drives.filter((drive) => {
    const matchesSearch =
      drive.car.toLowerCase().includes(searchQuery.toLowerCase()) ||
      drive.customer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || drive.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const updateStatus = (driveId: number, newStatus: string) => {
    setDrives(
      drives.map((d) =>
        d.id === driveId ? { ...d, status: newStatus as Status } : d
      )
    );
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
            <SelectItem value="Pending">Pending</SelectItem>
            <SelectItem value="Confirmed">Confirmed</SelectItem>
            <SelectItem value="Completed">Completed</SelectItem>
            <SelectItem value="Cancelled">Cancelled</SelectItem>
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
                          onClick={() => updateStatus(drive.id, "Pending")}
                        >
                          <div className="h-2 w-2 rounded-full bg-orange-500 mr-2" />
                          Pending
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => updateStatus(drive.id, "Confirmed")}
                        >
                          <div className="h-2 w-2 rounded-full bg-green-500 mr-2" />
                          Confirmed
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => updateStatus(drive.id, "Completed")}
                        >
                          <div className="h-2 w-2 rounded-full bg-blue-500 mr-2" />
                          Completed
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => updateStatus(drive.id, "Cancelled")}
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
                    >
                      <Eye className="h-4 w-4" />
                      View Car
                    </Button>
                    {drive.status === "Pending" && (
                      <Button variant="destructive" size="sm" className="gap-2">
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
