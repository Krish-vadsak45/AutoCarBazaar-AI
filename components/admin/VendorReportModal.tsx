"use client";

import React, { useState, useRef } from "react";
import axios from "axios";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, FileText, Download, AlertCircle } from "lucide-react";
import { VendorMonthlyReport } from "./VendorMonthlyReport";
import { useGeneratePDF } from "@/hooks/use-generate-pdf";
import { toast } from "sonner";

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  vendorId: string;
  vendorName: string;
}

export const VendorReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  vendorId,
  vendorName,
}) => {
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Date Selection
  const now = new Date();
  const reportRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Default values
  const defaultMonth = (
    now.getMonth() === 0 ? 11 : now.getMonth() - 1
  ).toString();
  const defaultYear = now.getFullYear().toString();

  const [selectedMonth, setSelectedMonth] = useState(defaultMonth);
  const [selectedYear, setSelectedYear] = useState(defaultYear);

  // Reset when vendorId shifts or modal opens/closes
  React.useEffect(() => {
    if (isOpen) {
      setReportData(null);
      setError(null);
      setSelectedMonth(defaultMonth);
      setSelectedYear(defaultYear);
    }
  }, [vendorId, isOpen, defaultMonth, defaultYear]);

  const { generatePDF } = useGeneratePDF();

  const handleFetchReport = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`/api/admin/reports/vendor-monthly`, {
        params: {
          vendorId,
          month: selectedMonth,
          year: selectedYear,
        },
      });
      setReportData(res.data);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.error || "Failed to load report data");
      toast.error("Could not fetch analytics for this period");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!reportData || !reportRef.current) return;

    setIsGenerating(true);
    try {
      const fileName = `Monthly_Report_${vendorName.replaceAll(/\s+/g, "_")}_${selectedMonth}_${selectedYear}.pdf`;
      // Use original element for high quality capture
      await generatePDF(reportRef.current, fileName);
      toast.success("Report downloaded successfully");
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate PDF");
    } finally {
      setIsGenerating(false);
    }
  };

  const reset = () => {
    setReportData(null);
    setError(null);
  };

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const years = Array.from({ length: 3 }, (_, i) =>
    (now.getFullYear() - i).toString(),
  );

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-[1000px] w-[95vw] h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <FileText className="h-5 w-5 text-red-600" />
            Vendor Performance Analysis
          </DialogTitle>
          <DialogDescription>
            Generate and export a comprehensive document for{" "}
            <strong>{vendorName}</strong>.
          </DialogDescription>
        </DialogHeader>

        {reportData ? (
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto p-6 bg-muted/30">
              <div
                ref={reportRef}
                className="w-[800px] mx-auto bg-white shadow-2xl rounded-sm border overflow-hidden min-h-[1100px]"
              >
                <VendorMonthlyReport data={reportData} />
              </div>
            </div>

            <div className="p-4 border-t bg-background flex justify-between items-center gap-4">
              <Button
                variant="ghost"
                onClick={reset}
                className="hover:bg-muted font-medium"
              >
                Change Filter
              </Button>
              <Button
                className="flex-1 max-w-xs bg-red-600 hover:bg-red-700 text-white font-bold h-11"
                onClick={handleDownload}
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Preparing PDF...
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    Export PDF Report
                  </>
                )}
              </Button>
            </div>
          </div>
        ) : (
          <div className="p-8 max-w-2xl mx-auto w-full space-y-8">
            <div className="text-center space-y-2">
              <div className="inline-flex items-center justify-center p-3 bg-red-50 rounded-full mb-2">
                <FileText className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-2xl font-bold">Select Report Period</h3>
              <p className="text-muted-foreground">
                Choose the month and year you want to analyze for this vendor.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-3">
                <label
                  htmlFor="month-select"
                  className="text-sm font-semibold tracking-tight"
                >
                  Analysis Month
                </label>
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                  <SelectTrigger id="month-select" className="h-11">
                    <SelectValue placeholder="Month" />
                  </SelectTrigger>
                  <SelectContent>
                    {months.map((m) => (
                      <SelectItem key={m} value={months.indexOf(m).toString()}>
                        {m}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-3">
                <label
                  htmlFor="year-select"
                  className="text-sm font-semibold tracking-tight"
                >
                  Analysis Year
                </label>
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger id="year-select" className="h-11">
                    <SelectValue placeholder="Year" />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map((y) => (
                      <SelectItem key={y} value={y}>
                        {y}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button
              className="w-full h-12 text-lg font-bold bg-gray-900 hover:bg-black text-white shadow-xl transition-all"
              onClick={handleFetchReport}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Processing Metrics...
                </>
              ) : (
                "Show Analytics Preview"
              )}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
