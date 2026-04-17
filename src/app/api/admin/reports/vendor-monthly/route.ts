import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import TestDrive from "@/models/test-drive.model";
import Vendor from "@/models/vendor.model";
import Car from "@/models/car.model";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const vendorId = searchParams.get("vendorId");
    const month = Number.parseInt(searchParams.get("month") || "");
    const year = Number.parseInt(searchParams.get("year") || "");

    if (!vendorId || Number.isNaN(month) || Number.isNaN(year)) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 },
      );
    }

    await dbConnect();

    // 1. Define date ranges for current and previous month
    const startOfMonth = new Date(year, month, 1);
    const endOfMonth = new Date(year, month + 1, 0, 23, 59, 59, 999);

    const prevMonth = month === 0 ? 11 : month - 1;
    const prevYear = month === 0 ? year - 1 : year;
    const startOfPrevMonth = new Date(prevYear, prevMonth, 1);
    const endOfPrevMonth = new Date(
      prevYear,
      prevMonth + 1,
      0,
      23,
      59,
      59,
      999,
    );

    // 2. Fetch data for current month (with populated references for the table)
    const [vendorData, currentMonthDrives, prevMonthDrives, vendorCars] =
      await Promise.all([
        Vendor.findById(vendorId).lean(),
        TestDrive.find({
          vendorId,
          createdAt: { $gte: startOfMonth, $lte: endOfMonth },
        })
          .populate({ path: "carId", select: "carModel make price" })
          .populate({ path: "userId", select: "name email" })
          .lean(),
        TestDrive.find({
          vendorId,
          createdAt: { $gte: startOfPrevMonth, $lte: endOfPrevMonth },
        }).lean(),
        Car.find({ vendorId })
          .select("carModel make totalBookedCount price")
          .lean(),
      ]);

    if (!vendorData) {
      return NextResponse.json({ error: "Vendor not found" }, { status: 404 });
    }

    // 3. Core Calculations
    const calculateTotals = (drives: any[]) => {
      return drives.reduce(
        (acc, drive) => {
          if (drive.paymentStatus === "PAID") {
            acc.revenue += drive.bookingFeeAmount || 0;
          }
          if (drive.status === "COMPLETED") acc.completed += 1;
          if (drive.status === "REJECTED") acc.rejected += 1;
          if (drive.status === "CANCELLED") acc.cancelled += 1;
          acc.total += 1;
          return acc;
        },
        { revenue: 0, completed: 0, rejected: 0, cancelled: 0, total: 0 },
      );
    };

    const currentStats = calculateTotals(currentMonthDrives);
    const prevStats = calculateTotals(prevMonthDrives);

    // Top Cars of the month
    const carBookingCounts = currentMonthDrives.reduce(
      (acc: any, drive: any) => {
        const cid = drive.carId?._id?.toString();
        if (cid) {
          acc[cid] = (acc[cid] || 0) + 1;
        }
        return acc;
      },
      {},
    );

    const top3Cars = vendorCars
      .map((car: any) => ({
        ...car,
        monthBookings: carBookingCounts[car._id.toString()] || 0,
      }))
      .sort((a, b) => b.monthBookings - a.monthBookings)
      .slice(0, 3);

    return NextResponse.json({
      vendor: vendorData,
      stats: {
        current: currentStats,
        previous: prevStats,
      },
      topCars: top3Cars,
      bookingsTable: currentMonthDrives,
      reportMonth: { month, year },
    });
  } catch (error: any) {
    console.error("Report Generation Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch report data" },
      { status: 500 },
    );
  }
}
