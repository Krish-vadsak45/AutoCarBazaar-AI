"use client";

import { usePathname, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { Bell, Loader2 } from "lucide-react";
import { IncomingVendorRequests } from "@/components/IncomingVendorRequests";
import { useSession } from "next-auth/react";

// UI Components
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import DashboardPage from "@/src/app/vendor/[vendorId]/dashboard/page";

interface Vendor {
  _id: string;
  businessName: string;
  ownerName: string;
  contactDetails: {
    email: string;
    phone: string;
  };
  vendorType: string;
  verificationStatus: string;
  userId: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
}

export default function AdminDashboardPage() {
  const { data: session, status } = useSession();
  const params = useParams();
  const adminId = params.adminId as string;

  const pathname = usePathname();
  // Keep existing logic if relevant, though it seems unused on this specific route
  const isLoginPage = pathname === "/vendor/login";

  const [pendingVendors, setPendingVendors] = useState<Vendor[]>([]);
  const [approvedVendors, setApprovedVendors] = useState<Vendor[]>([]);
  const [selectedVendorId, setSelectedVendorId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const fetchPendingVendors = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/admin/vendors/pending");
      console.log("Fetched pending vendors:", res.data);
      setPendingVendors(res.data);
    } catch (error) {
      console.error("Error fetching pending vendors:", error);
      toast.error("Failed to fetch pending vendors");
    } finally {
      setLoading(false);
    }
  };

  const fetchApprovedVendors = async () => {
    try {
      const res = await axios.get("/api/admin/vendors/approved");
      console.log("Fetched approved vendors:", res.data.approvedVendors);
      setApprovedVendors(res.data);
    } catch (error) {
      console.error("Error fetching approved vendors:", error);
    }
  };

  useEffect(() => {
    if (
      status === "authenticated" &&
      session?.user?.role === "admin" &&
      !isLoginPage
    ) {
      fetchPendingVendors();
      fetchApprovedVendors();
    }
  }, [status, session, isLoginPage]);

  const handleApproval = async (
    vendorId: string,
    action: "approve" | "reject",
  ) => {
    try {
      await axios.post("/api/admin/vendors/approve", { vendorId, action });
      toast.success(`Vendor ${action}ed successfully`);
      fetchPendingVendors(); // Refresh list
    } catch (error) {
      console.error(`Error ${action}ing vendor:`, error);
      toast.error(`Failed to ${action} vendor`);
      toast.error((error as Error).message || "An error occurred");
    }
  };

  const handleRemoveVendor = async (vendorId: string) => {
    if (!confirm("Are you sure you want to remove this vendor?")) return;
    try {
      await axios.post("/api/admin/vendors/remove", { vendorId });
      toast.success("Vendor removed successfully");
      fetchApprovedVendors(); // Refresh list
    } catch (error) {
      console.error("Error removing vendor:", error);
      toast.error("Failed to remove vendor");
    }
  };

  if (status === "loading") {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">
          Verifying Admin Session...
        </span>
      </div>
    );
  }

  if (status === "unauthenticated" || session?.user?.role !== "admin") {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center space-y-4">
        <div className="text-xl font-semibold text-red-500">Access Denied</div>
        <p className="text-muted-foreground">
          You do not have permission to view this dashboard.
        </p>
        <Button onClick={() => (window.location.href = "/admin/login")}>
          Back to Login
        </Button>
      </div>
    );
  }

  if (isLoginPage) {
    return <></>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your platform, vendors, and settings.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">Admin ID: {adminId}</Badge>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowNotifications(true)}
          >
            <Bell className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {showNotifications && (
        <IncomingVendorRequests
          pendingVendors={pendingVendors}
          loading={loading}
          onApprove={(id) => handleApproval(id, "approve")}
          onReject={(id) => handleApproval(id, "reject")}
          onClose={() => setShowNotifications(false)}
        />
      )}

      {/* Pending requests card removed */}
      {/* Existing content placeholder if needed */}

      <Card>
        <CardHeader>
          <CardTitle>Approved Vendors</CardTitle>
          <CardDescription>
            Click on a vendor to view their dashboard and performance.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {approvedVendors.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">
              No approved vendors found.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Business Name</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Reports</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {approvedVendors.map((vendor) => (
                  <TableRow
                    key={vendor._id}
                    className={`cursor-pointer transition-colors ${
                      selectedVendorId === vendor._id
                        ? "bg-muted border-l-4 border-l-primary"
                        : "hover:bg-muted/50"
                    }`}
                    onClick={() =>
                      setSelectedVendorId(
                        selectedVendorId === vendor._id ? null : vendor._id,
                      )
                    }
                  >
                    <TableCell className="font-medium">
                      {vendor.businessName}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span>{vendor.ownerName}</span>
                        <span className="text-xs text-muted-foreground">
                          {vendor.userId?.email}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          selectedVendorId === vendor._id
                            ? "default"
                            : "outline"
                        }
                      >
                        {selectedVendorId === vendor._id
                          ? "Viewing Dashboard"
                          : "View Dashboard"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation(); // prevent row click
                          handleRemoveVendor(vendor._id);
                        }}
                      >
                        Remove
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Embedded Vendor Dashboard */}
      {selectedVendorId && (
        <div className="mt-8 border-t pt-8 animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-2xl font-bold">
              Vendor Dashboard:{" "}
              <span className="text-primary">
                {
                  approvedVendors.find((v) => v._id === selectedVendorId)
                    ?.businessName
                }
              </span>
            </h2>
            <Button variant="ghost" onClick={() => setSelectedVendorId(null)}>
              Close Dashboard
            </Button>
          </div>
          <div className="border rounded-xl p-4 bg-background/50 backdrop-blur-sm shadow-sm">
            <DashboardPage overrideVendorId={selectedVendorId} />
          </div>
        </div>
      )}
    </div>
  );
}
