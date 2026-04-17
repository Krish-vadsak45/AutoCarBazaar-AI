"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Loading from "@/components/Loading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AdminEmailModal } from "@/components/admin-email-modal";
import { AdminVendorChatSheet } from "@/components/admin-vendor-chat-sheet";
import { VendorReportModal } from "@/components/admin/VendorReportModal";
import {
  User,
  Mail,
  DollarSign,
  Activity,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ChevronDown,
  Send,
  MessageSquareText,
  FileText,
} from "lucide-react";

interface VendorType {
  _id: string;
  userId?: { name: string; email: string };
  name?: string;
  priority: number;
  subscriptionStatus: string;
  isActive: boolean;
  totalTestDrivesBooked: number;
  totalRevenue: number;
  verificationStatus: string;
  isVerified?: boolean;
  createdAt: string;
  cars: any[];
  hasUnreadMessages?: boolean;
}

export default function AdminVendorsPage() {
  const [vendors, setVendors] = useState<VendorType[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);

  // States for Report Modal
  const [reportVendorId, setReportVendorId] = useState<string | null>(null);
  const [reportVendorName, setReportVendorName] = useState("");

  // States for Q&A Chat
  const [chatVendorId, setChatVendorId] = useState<string | null>(null);
  const [chatVendorName, setChatVendorName] = useState("");

  useEffect(() => {
    async function fetchVendors() {
      try {
        const res = await axios.get("/api/admin/vendors/all");
        setVendors(res.data || []);
      } catch (err) {
        console.error("Failed to fetch vendors:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchVendors();
  }, []);

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <User className="h-8 w-8 text-primary" /> Vendor Management
            <Button
              variant="outline"
              size="icon"
              className="rounded-full h-9 w-9 ml-3 border-primary/50 text-primary hover:bg-primary hover:text-primary-foreground transition-all shadow-sm group"
              onClick={() => setIsEmailModalOpen(true)}
              title="Send Custom Email"
            >
              <Send className="h-4 w-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Button>
          </h1>
          <p className="text-muted-foreground mt-2">
            Monitor your platform's vendors, their priorities, subscription
            metrics, and active revenue.
          </p>
        </div>
      </div>

      <AdminEmailModal
        isOpen={isEmailModalOpen}
        onClose={() => setIsEmailModalOpen(false)}
      />

      <AdminVendorChatSheet
        vendorId={chatVendorId}
        vendorName={chatVendorName}
        isOpen={!!chatVendorId}
        onClose={() => setChatVendorId(null)}
      />

      <VendorReportModal
        isOpen={!!reportVendorId}
        onClose={() => setReportVendorId(null)}
        vendorId={reportVendorId || ""}
        vendorName={reportVendorName}
      />

      <div className="grid gap-4">
        {vendors.map((vendor) => {
          const isExpanded = expandedId === vendor._id;
          const vendorName =
            vendor.userId?.name || vendor.name || "Unknown Vendor";
          const vendorEmail = vendor.userId?.email || "No Email Provided";

          return (
            <div
              key={vendor._id}
              className={`bg-card border rounded-xl overflow-hidden transition-all duration-300 shadow-sm hover:shadow-md ${isExpanded ? "border-primary/50 ring-1 ring-primary/20" : "border-border"}`}
            >
              {/* Visible Summary Header */}
              <div
                className="p-5 cursor-pointer flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                onClick={() => toggleExpand(vendor._id)}
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="relative h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <User className="h-6 w-6 text-primary" />
                    {vendor.hasUnreadMessages && (
                      <span className="absolute -top-1 -right-1 flex h-4 w-4">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-4 w-4 bg-green-500 border-2 border-background"></span>
                      </span>
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-foreground flex items-center gap-2">
                      {vendorName}
                      {vendor.isActive && (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      )}
                    </h3>
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-1">
                      <Mail className="h-3.5 w-3.5" />
                      {vendorEmail}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 flex-wrap md:flex-nowrap w-full md:w-auto">
                  {/* Priority Badge */}
                  <div className="flex flex-col items-center bg-blue-50 dark:bg-blue-900/20 px-3 py-1.5 rounded-lg border border-blue-100 dark:border-blue-900/50">
                    <span className="text-[10px] uppercase font-bold text-blue-600 dark:text-blue-400 tracking-wider">
                      Tier
                    </span>
                    <span className="font-extrabold text-blue-700 dark:text-blue-300 text-sm">
                      Level {vendor.priority || 1}
                    </span>
                  </div>

                  {/* Subscription Status Badge */}
                  <div className="flex flex-col items-center px-3 py-1.5 rounded-lg">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                      Subscription
                    </span>
                    <Badge
                      variant={
                        vendor.subscriptionStatus === "ACTIVE"
                          ? "default"
                          : "secondary"
                      }
                      className={
                        vendor.subscriptionStatus === "ACTIVE"
                          ? "bg-green-500 hover:bg-green-600"
                          : "bg-orange-500 hover:bg-orange-600 text-white"
                      }
                    >
                      {vendor.subscriptionStatus || "INACTIVE"}
                    </Badge>
                  </div>

                  {/* Expand Chevron */}
                  <div className="ml-2 bg-muted p-2 rounded-full">
                    <ChevronDown
                      className={`h-5 w-5 text-muted-foreground transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`}
                    />
                  </div>
                </div>
              </div>

              {/* Hidden Expanded Content */}
              <div
                className={`transition-all duration-500 ease-in-out ${isExpanded ? "max-h-[1000px] opacity-100 border-t border-border" : "max-h-0 opacity-0 overflow-hidden"}`}
              >
                <div className="p-6 bg-muted/20 grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Stats Column */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-semibold uppercase text-muted-foreground tracking-wider mb-2">
                      Vendor Metrics
                    </h4>

                    <div className="flex justify-between items-center bg-background p-3 rounded-lg border shadow-sm">
                      <div className="flex items-center gap-2">
                        <Activity className="h-4 w-4 text-blue-500" />
                        <span className="font-medium text-sm">
                          Total Bookings
                        </span>
                      </div>
                      <span className="font-bold">
                        {vendor.totalTestDrivesBooked || 0}
                      </span>
                    </div>

                    <div className="flex justify-between items-center bg-background p-3 rounded-lg border shadow-sm">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-green-500" />
                        <span className="font-medium text-sm">
                          Total Revenue
                        </span>
                      </div>
                      <span className="font-bold text-green-600 dark:text-green-500">
                        ₹{(vendor.totalRevenue || 0).toLocaleString()}
                      </span>
                    </div>

                    <div className="flex justify-between items-center bg-background p-3 rounded-lg border shadow-sm">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm text-muted-foreground">
                          Cars Listed
                        </span>
                      </div>
                      <span className="font-bold">
                        {vendor.cars?.length || 0}
                      </span>
                    </div>

                    <Button
                      variant="outline"
                      className="w-full mt-4 flex items-center justify-center gap-2 border-primary/40 hover:bg-primary/5 hover:text-primary"
                      onClick={(e) => {
                        e.stopPropagation();
                        setReportVendorId(vendor._id);
                        setReportVendorName(vendorName);
                      }}
                    >
                      <FileText className="h-4 w-4" />
                      Monthly Analysis Report
                    </Button>
                  </div>

                  {/* Account Status Column */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-semibold uppercase text-muted-foreground tracking-wider mb-2">
                      Account Status
                    </h4>

                    <div className="bg-background p-4 rounded-lg border shadow-sm space-y-3">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">
                          Initial Payment (Done?)
                        </span>
                        {vendor.isActive ? (
                          <span className="flex items-center text-green-600 font-bold text-xs">
                            <CheckCircle2 className="h-3 w-3 mr-1" /> YES
                          </span>
                        ) : (
                          <span className="flex items-center text-red-500 font-bold text-xs">
                            <XCircle className="h-3 w-3 mr-1" /> NO
                          </span>
                        )}
                      </div>
                      <div className="flex justify-between items-center text-sm border-t pt-2 mt-2">
                        <span className="text-muted-foreground">
                          Admin Verified
                        </span>
                        {vendor.verificationStatus === "APPROVED" ||
                        vendor.isVerified ? (
                          <span className="flex items-center text-green-600 font-bold text-xs">
                            <CheckCircle2 className="h-3 w-3 mr-1" /> TRUE
                          </span>
                        ) : (
                          <span className="flex items-center text-orange-500 font-bold text-xs">
                            <AlertCircle className="h-3 w-3 mr-1" /> PENDING
                          </span>
                        )}
                      </div>
                      <div className="flex justify-between items-center text-sm border-t pt-2 mt-2">
                        <span className="text-muted-foreground">
                          Joined Platform
                        </span>
                        <span className="font-medium text-xs">
                          {vendor.createdAt
                            ? new Date(vendor.createdAt).toLocaleDateString()
                            : "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions / Admin Column */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-semibold uppercase text-muted-foreground tracking-wider mb-2">
                      Admin Interventions
                    </h4>
                    <div className="flex flex-col gap-3 h-full">
                      <div className="bg-primary/5 border border-primary/20 p-4 rounded-lg flex flex-col justify-center flex-1">
                        <p className="text-xs text-muted-foreground text-center mb-3">
                          Evaluated monthly: {"("}totalBooked × 500{")"} +
                          Revenue
                        </p>
                        <div className="text-center border-t border-primary/10 pt-3">
                          <span className="text-[12px] uppercase font-bold text-primary tracking-wider block mb-1">
                            Current Score
                          </span>
                          <span className="font-extrabold text-2xl text-primary">
                            {(vendor.totalTestDrivesBooked || 0) * 500 +
                              (vendor.totalRevenue || 0)}
                          </span>
                        </div>
                      </div>

                      {/* Open Chat Thread Action Button */}
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          setChatVendorName(vendorName);
                          setChatVendorId(vendor._id);
                          // Auto clear dot instantly when opened
                          setVendors((prev) =>
                            prev.map((v) =>
                              v._id === vendor._id
                                ? { ...v, hasUnreadMessages: false }
                                : v,
                            ),
                          );
                        }}
                        variant="secondary"
                        className="w-full relative flex items-center justify-center gap-2 mt-auto mb-4 border border-blue-500/20 bg-blue-50 hover:bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:hover:bg-blue-900/40 dark:text-blue-400 font-bold transition-all shadow-sm"
                      >
                        <MessageSquareText className="h-4 w-4" />
                        Open Q&A Chat
                        {vendor.hasUnreadMessages && (
                          <div className="absolute right-4 h-2 w-2 bg-green-500 rounded-full"></div>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {vendors.length === 0 && (
          <div className="text-center py-20 bg-muted/20 border border-dashed rounded-xl">
            <User className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-50" />
            <h3 className="text-lg font-medium text-muted-foreground">
              No vendors found on the platform yet.
            </h3>
          </div>
        )}
      </div>
    </div>
  );
}
