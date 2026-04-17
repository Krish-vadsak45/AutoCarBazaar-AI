"use client";

import React from "react";
import { format } from "date-fns";
import { AlertCircle } from "lucide-react";
import {
  calculateGrowth,
  calculateStatusDistribution,
  getPerformanceTips,
} from "@/lib/report-utils";

interface VendorReportProps {
  data: {
    vendor: any;
    stats: {
      current: any;
      previous: any;
    };
    topCars: any[];
    bookingsTable: any[];
    reportMonth: { month: number; year: number };
  };
}

export const VendorMonthlyReport: React.FC<VendorReportProps> = ({ data }) => {
  const { vendor, stats, topCars, bookingsTable, reportMonth } = data;
  const monthName = format(
    new Date(reportMonth.year, reportMonth.month),
    "MMMM yyyy",
  );

  // Metrics
  const revenueGrowth = calculateGrowth(
    stats.current.revenue,
    stats.previous.revenue,
  );
  const bookingGrowth = calculateGrowth(
    stats.current.total,
    stats.previous.total,
  );
  const successRate =
    stats.current.total > 0
      ? (stats.current.completed / stats.current.total) * 100
      : 0;
  const rejectionRate =
    stats.current.total > 0
      ? (stats.current.rejected / stats.current.total) * 100
      : 0;

  const statusDist = calculateStatusDistribution(bookingsTable);
  const tips = getPerformanceTips({
    successRate,
    rejectionRate,
    revenueGrowth: revenueGrowth.percentageChange,
  });

  return (
    <div
      id="vendor-monthly-report"
      className="p-10 bg-white text-gray-900 font-sans border-0 w-[800px] min-h-[1100px] flex flex-col"
    >
      {/* Header */}
      <div className="flex justify-between items-center border-b pb-6 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-red-600">
            AutoCarBazaar <span className="text-gray-400 font-normal">AI</span>
          </h1>
          <p className="text-sm text-gray-500 mt-1 uppercase tracking-widest">
            Monthly Performance Analysis
          </p>
        </div>
        <div className="text-right">
          <h2 className="text-xl font-semibold">{vendor.businessName}</h2>
          <p className="text-sm text-gray-500">{monthName}</p>
        </div>
      </div>

      {/* Executive Summary */}
      <div className="grid grid-cols-4 gap-4 mb-10">
        <MetricCard
          label="Total Revenue"
          value={`$${stats.current.revenue}`}
          growth={revenueGrowth.percentageChange}
          isPositive={revenueGrowth.isPositive}
        />
        <MetricCard
          label="Total Bookings"
          value={stats.current.total}
          growth={bookingGrowth.percentageChange}
          isPositive={bookingGrowth.isPositive}
        />
        <MetricCard
          label="Success Rate"
          value={`${Math.round(successRate)}%`}
        />
        <MetricCard
          label="Priority Score"
          value={vendor.priority || 1}
          subText={`Status: ${vendor.subscriptionStatus}`}
        />
      </div>

      {/* Highlights & Tips */}
      <div className="grid grid-cols-2 gap-8 mb-10">
        <div className="bg-gray-50 p-6 rounded-lg border">
          <h3 className="text-sm font-semibold text-gray-400 uppercase mb-4">
            Performance Insights
          </h3>
          <ul className="space-y-3">
            {tips.map((tip, idx) => (
              <li key={idx} className="flex items-start text-sm">
                <span className="text-red-500 mr-2 font-bold">•</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-gray-50 p-6 rounded-lg border">
          <h3 className="text-sm font-semibold text-gray-400 uppercase mb-4">
            Status Distribution
          </h3>
          <div className="space-y-4">
            <ProgressBar
              label="Completed"
              percentage={statusDist.COMPLETED || 0}
              color="bg-green-500"
            />
            <ProgressBar
              label="Rejected"
              percentage={statusDist.REJECTED || 0}
              color="bg-red-500"
            />
            <ProgressBar
              label="Cancelled"
              percentage={statusDist.CANCELLED || 0}
              color="bg-orange-500"
            />
          </div>
        </div>
      </div>

      {/* Top Performing Cars */}
      <div className="mb-10">
        <h3 className="text-lg font-semibold mb-4 border-l-4 border-red-600 pl-3">
          Top Performing Cars
        </h3>
        {topCars.length > 0 ? (
          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-100 text-gray-600">
                <tr>
                  <th className="px-4 py-3 font-semibold">Car Model</th>
                  <th className="px-4 py-3 font-semibold">Make</th>
                  <th className="px-4 py-3 font-semibold text-center">
                    Month Bookings
                  </th>
                  <th className="px-4 py-3 font-semibold text-right">
                    Unit Price
                  </th>
                </tr>
              </thead>
              <tbody>
                {topCars.map((car, idx) => (
                  <tr key={idx} className="border-t">
                    <td className="px-4 py-3 font-medium">{car.carModel}</td>
                    <td className="px-4 py-3">{car.make}</td>
                    <td className="px-4 py-3 text-center">
                      {car.monthBookings}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-xs">
                      ${car.price}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-6 px-4 bg-gray-50/50 border border-dashed rounded-lg text-center">
            <p className="text-gray-400 text-sm italic">
              No inventory activity recorded this month.
            </p>
          </div>
        )}
      </div>

      {/* Detailed Booking Log */}
      <div className="mb-10 flex-1">
        <h3 className="text-lg font-semibold mb-4 border-l-4 border-red-600 pl-3">
          Monthly Test Drive Log
        </h3>
        {bookingsTable.length > 0 ? (
          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-800 text-white">
                <tr>
                  <th className="px-4 py-3 font-semibold">Date</th>
                  <th className="px-4 py-3 font-semibold">Car Model</th>
                  <th className="px-4 py-3 font-semibold">Customer Name</th>
                  <th className="px-4 py-3 font-semibold text-center">
                    Status
                  </th>
                  <th className="px-4 py-3 font-semibold text-right">
                    Revenue
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {bookingsTable.map((booking, idx) => (
                  <tr
                    key={idx}
                    className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
                  >
                    <td className="px-4 py-3 text-xs">
                      {format(new Date(booking.createdAt), "dd MMM HH:mm")}
                    </td>
                    <td className="px-4 py-3 font-medium text-xs">
                      {booking.carId?.carModel || "Deleted Car"}
                    </td>
                    <td className="px-4 py-3 text-xs truncate max-w-[120px]">
                      {booking.userId?.name || "Member"}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-bold text-white ${getStatusColor(booking.status)}`}
                      >
                        {booking.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-xs">
                      {booking.paymentStatus === "PAID"
                        ? `$${booking.bookingFeeAmount}`
                        : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 px-4 bg-gray-50 border rounded-lg border-dashed">
            <div className="h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
              <AlertCircle className="h-6 w-6 text-gray-400" />
            </div>
            <p className="text-gray-500 font-medium text-center">
              No test-drive bookings found for {monthName}.
            </p>
            <p className="text-gray-400 text-xs text-center mt-1">
              Analytics metrics will appear as zero until new activity is
              recorded.
            </p>
          </div>
        )}
      </div>

      {/* Footer Disclaimer */}
      <div className="text-center text-[10px] text-gray-400 mt-20 border-t pt-4">
        <p>
          This report was automatically generated on{" "}
          {format(new Date(), "PPpp")}.
        </p>
        <p>© 2026 AutoCarBazaar AI - Platform Services Team.</p>
      </div>
    </div>
  );
};

// Sub-components
const MetricCard = ({ label, value, growth, isPositive, subText }: any) => (
  <div className="bg-white border rounded-lg p-5 shadow-sm text-center">
    <p className="text-xs text-gray-500 uppercase tracking-tighter mb-2">
      {label}
    </p>
    <p className="text-2xl font-bold">{value}</p>
    {growth !== undefined && (
      <p
        className={`text-[10px] mt-2 font-semibold ${isPositive ? "text-green-600" : "text-red-500"}`}
      >
        {isPositive ? "▲" : "▼"} {Math.abs(growth)}% vs Prev Month
      </p>
    )}
    {subText && <p className="text-[10px] text-gray-400 mt-1">{subText}</p>}
  </div>
);

const ProgressBar = ({ label, percentage, color }: any) => (
  <div>
    <div className="flex justify-between text-[11px] mb-1">
      <span className="font-semibold text-gray-600">{label}</span>
      <span className="font-mono">{percentage}%</span>
    </div>
    <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
      <div
        className={`${color} h-1.5`}
        style={{ width: `${percentage}%` }}
      ></div>
    </div>
  </div>
);

const getStatusColor = (status: string) => {
  switch (status) {
    case "COMPLETED":
      return "bg-green-600";
    case "REJECTED":
      return "bg-red-600";
    case "CANCELLED":
      return "bg-orange-500";
    case "CONFIRMED":
      return "bg-blue-600";
    default:
      return "bg-gray-500";
  }
};
