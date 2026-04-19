import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { X } from "lucide-react";

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

interface IncomingVendorRequestsProps {
  pendingVendors: Vendor[];
  loading: boolean;
  onApprove: (vendorId: string) => void;
  onReject: (vendorId: string) => void;
  onClose: () => void;
}

export const IncomingVendorRequests = React.memo(
  function IncomingVendorRequests({
    pendingVendors,
    loading,
    onApprove,
    onReject,
    onClose,
  }: IncomingVendorRequestsProps) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
        <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col relative animated-in fade-in zoom-in-95 duration-200">
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-4"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
          <CardHeader>
            <CardTitle>Incoming Vendor Requests</CardTitle>
            <CardDescription>
              Review and manage new vendor registration requests.
            </CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto p-0 sm:p-6">
            {loading ? (
              <div className="text-center py-4">Loading requests...</div>
            ) : pendingVendors.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                <p>No pending vendor requests found.</p>
                <Button variant="outline" className="mt-4" onClick={onClose}>
                  Close
                </Button>
              </div>
            ) : (
              <div className="min-w-[600px] w-full px-4 sm:px-0 pb-4 sm:pb-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Business Name</TableHead>
                      <TableHead>Owner</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingVendors.map((vendor) => (
                      <TableRow key={vendor._id}>
                        <TableCell className="font-medium">
                          {vendor.businessName}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span>{vendor.ownerName}</span>
                            <span className="text-xs text-muted-foreground">
                              {vendor?.userId?.email}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col text-sm">
                            <span>{vendor?.contactDetails?.email}</span>
                            <span>{vendor?.contactDetails?.phone}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{vendor.vendorType}</Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(vendor?.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right space-x-2">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => onReject(vendor._id)}
                            >
                              Reject
                            </Button>
                            <Button
                              variant="default"
                              size="sm"
                              className="bg-green-600 hover:bg-green-700"
                              onClick={() => onApprove(vendor._id)}
                            >
                              Approve
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>{" "}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  },
);
