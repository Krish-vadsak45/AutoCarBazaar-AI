"use client";

import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import {
  format,
  startOfMonth,
  endOfMonth,
  isWithinInterval,
  startOfDay,
  endOfDay,
  getMonth,
  getYear,
  setMonth,
  setYear,
  subMonths,
  eachMonthOfInterval,
  isSameMonth,
} from "date-fns";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Car as CarIcon,
  Users,
  TrendingUp,
  ShoppingCart,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  Filter,
  PieChart as PieChartIcon,
} from "lucide-react";
import Loading from "@/components/Loading";

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-popover border border-border p-3 rounded-xl shadow-2xl backdrop-blur-md min-w-[140px] animate-in fade-in zoom-in duration-200">
        {label && (
          <p className="text-[10px] uppercase font-bold text-muted-foreground mb-2 tracking-wider">
            {label}
          </p>
        )}
        <div className="space-y-1.5">
          {payload.map((entry: any, index: number) => (
            <div
              key={index}
              className="flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-1.5 h-1.5 rounded-full shadow-[0_0_8px_rgba(0,0,0,0.2)]"
                  style={{
                    backgroundColor:
                      entry.color || entry.fill || "hsl(var(--primary))",
                  }}
                />
                <span className="text-[12px] font-medium text-foreground">
                  {entry.name}
                </span>
              </div>
              <span className="text-[12px] font-bold text-primary dark:text-primary text-right">
                {entry.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

const PieTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-popover border border-border p-3 rounded-xl shadow-2xl backdrop-blur-md min-w-[140px] animate-in fade-in zoom-in duration-200">
        <div className="flex items-center gap-2 mb-2">
          <div
            className="w-2.5 h-2.5 rounded-full shadow-[0_0_8px_rgba(0,0,0,0.1)]"
            style={{ backgroundColor: data.color }}
          />
          <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
            {data.name}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-[12px] font-medium text-foreground">
            Bookings
          </span>
          <span className="text-[12px] font-bold text-primary dark:text-primary">
            {data.value}
          </span>
        </div>
      </div>
    );
  }
  return null;
};

const CustomLegend = ({ payload }: any) => {
  return (
    <div className="flex flex-wrap justify-center gap-x-6 gap-y-3 pt-8 pb-2">
      {payload.map((entry: any, index: number) => (
        <div
          key={`item-${index}`}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/30 border border-transparent hover:border-border transition-all cursor-default group"
        >
          <div
            className="w-2.5 h-2.5 rounded-full transition-transform group-hover:scale-125 shadow-[0_0_10px_rgba(0,0,0,0.1)] dark:shadow-[0_0_10px_rgba(255,255,255,0.05)]"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-[11px] font-semibold text-muted-foreground group-hover:text-foreground transition-colors uppercase tracking-tight">
            {entry.value}
          </span>
        </div>
      ))}
    </div>
  );
};

export default function DashboardPage() {
  const [cars, setCars] = useState<any[]>([]);
  const [testDrives, setTestDrives] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters for Test Drives tab
  const [filterType, setFilterType] = useState<
    "month" | "month-range" | "date-range"
  >("month");

  // Single Month default to current
  const [selectedMonth, setSelectedMonth] = useState<number>(
    getMonth(new Date()),
  );
  const [selectedYear, setSelectedYear] = useState<number>(getYear(new Date()));

  // Month Range
  const [startMonth, setStartMonth] = useState<number>(getMonth(new Date()));
  const [startYear, setStartYear] = useState<number>(getYear(new Date()));
  const [endMonth, setEndMonth] = useState<number>(getMonth(new Date()));
  const [endYear, setEndYear] = useState<number>(getYear(new Date()));

  // Date Range
  const [startDate, setStartDate] = useState<string>(
    format(startOfMonth(new Date()), "yyyy-MM-dd"),
  );
  const [endDate, setEndDate] = useState<string>(
    format(endOfMonth(new Date()), "yyyy-MM-dd"),
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [carsRes, testDrivesRes] = await Promise.all([
          axios.get("/api/vend-cars"),
          axios.get("/api/vendor/test-drives"),
        ]);
        setCars(carsRes.data.cars || []);
        setTestDrives(testDrivesRes.data || []);
      } catch (error) {
        console.error("Dashboard Fetch Error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Overview stats use all-time data
  const overviewStats = useMemo(() => {
    const totalCars = cars.length;
    const available = cars.filter((c) => c.status === "available").length;
    const sold = cars.filter((c) => c.status === "unavailable").length;
    const totalTD = testDrives.length;
    const convRate = totalTD > 0 ? ((sold / totalTD) * 100).toFixed(1) : "0";

    return [
      {
        name: "Total Cars",
        value: totalCars,
        icon: CarIcon,
        description: `${available} available, ${sold} sold`,
      },
      {
        name: "Test Drives",
        value: totalTD,
        icon: Users,
        description: "Total bookings all-time",
      },
      {
        name: "Conversion Rate",
        value: `${convRate}%`,
        icon: TrendingUp,
        description: "Test drives to sales ratio",
      },
      {
        name: "Cars Sold",
        value: sold,
        icon: ShoppingCart,
        description: `${totalCars > 0 ? ((sold / totalCars) * 100).toFixed(1) : 0}% of inventory sold`,
      },
    ];
  }, [cars, testDrives]);

  // Filtered test drives for the Test Drives tab
  const filteredTestDrives = useMemo(() => {
    return testDrives.filter((td) => {
      const dateVal = td.startDate || td.createdAt;
      if (!dateVal) return false;
      const tdDate = new Date(dateVal);
      if (isNaN(tdDate.getTime())) return false;

      if (filterType === "month") {
        return (
          getMonth(tdDate) === selectedMonth && getYear(tdDate) === selectedYear
        );
      }
      if (filterType === "month-range") {
        const start = startOfMonth(
          setYear(setMonth(new Date(), startMonth), startYear),
        );
        const end = endOfMonth(
          setYear(setMonth(new Date(), endMonth), endYear),
        );
        return isWithinInterval(tdDate, { start, end });
      }
      if (filterType === "date-range") {
        const start = startOfDay(new Date(startDate));
        const end = endOfDay(new Date(endDate));
        return isWithinInterval(tdDate, { start, end });
      }
      return true;
    });
  }, [
    testDrives,
    filterType,
    selectedMonth,
    selectedYear,
    startMonth,
    startYear,
    endMonth,
    endYear,
    startDate,
    endDate,
  ]);

  const testDriveStatsRows = useMemo(() => {
    const total = filteredTestDrives.length;
    const pending = filteredTestDrives.filter(
      (td) => td.status === "PENDING",
    ).length;
    const confirmed = filteredTestDrives.filter(
      (td) => td.status === "CONFIRMED",
    ).length;
    const completed = filteredTestDrives.filter(
      (td) => td.status === "COMPLETED",
    ).length;
    const cancelled = filteredTestDrives.filter(
      (td) => td.status === "CANCELLED",
    ).length;

    return [
      {
        name: "Total Bookings",
        value: total,
        icon: Clock,
        color: "bg-blue-500",
      },
      {
        name: "Pending",
        value: pending,
        icon: AlertCircle,
        color: "bg-orange-500",
      },
      {
        name: "Confirmed",
        value: confirmed,
        icon: CheckCircle,
        color: "bg-green-500",
      },
      {
        name: "Completed",
        value: completed,
        icon: CheckCircle,
        color: "bg-blue-500",
      },
      {
        name: "Cancelled",
        value: cancelled,
        icon: XCircle,
        color: "bg-red-500",
      },
    ];
  }, [filteredTestDrives]);

  const dayWiseDistribution = useMemo(() => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const distribution = days.map((day) => ({ name: day, bookings: 0 }));
    if (!filteredTestDrives.length) return distribution;

    filteredTestDrives.forEach((td) => {
      try {
        const dateStr = td.startDate || td.createdAt;
        if (!dateStr) return;
        const d = new Date(dateStr);
        if (!isNaN(d.getTime())) {
          distribution[d.getDay()].bookings++;
        }
      } catch (e) {}
    });
    return distribution;
  }, [filteredTestDrives]);

  const allTimeStatusDistribution = useMemo(() => {
    const stats = [
      { name: "Pending", value: 0, color: "#f97316" }, // orange-500
      { name: "Confirmed", value: 0, color: "#22c55e" }, // green-500
      { name: "Completed", value: 0, color: "#3b82f6" }, // blue-500
      { name: "Cancelled", value: 0, color: "#ef4444" }, // red-500
    ];

    testDrives.forEach((td) => {
      if (td.status === "PENDING") stats[0].value++;
      else if (td.status === "CONFIRMED") stats[1].value++;
      else if (td.status === "COMPLETED") stats[2].value++;
      else if (td.status === "CANCELLED") stats[3].value++;
    });

    return stats.filter((s) => s.value > 0);
  }, [testDrives]);

  const statusDistribution = useMemo(() => {
    const stats = [
      { name: "Pending", value: 0, color: "#f97316" }, // orange-500
      { name: "Confirmed", value: 0, color: "#22c55e" }, // green-500
      { name: "Completed", value: 0, color: "#3b82f6" }, // blue-500
      { name: "Cancelled", value: 0, color: "#ef4444" }, // red-500
    ];

    filteredTestDrives.forEach((td) => {
      if (td.status === "PENDING") stats[0].value++;
      else if (td.status === "CONFIRMED") stats[1].value++;
      else if (td.status === "COMPLETED") stats[2].value++;
      else if (td.status === "CANCELLED") stats[3].value++;
    });

    return stats.filter((s) => s.value > 0);
  }, [filteredTestDrives]);

  const monthlyTrend = useMemo(() => {
    const last6Months = eachMonthOfInterval({
      start: subMonths(new Date(), 5),
      end: new Date(),
    });

    return last6Months.map((date) => {
      const count = testDrives.filter((td) => {
        const tdDate = new Date(td.startDate || td.createdAt);
        return isSameMonth(tdDate, date);
      }).length;
      return {
        name: format(date, "MMM"),
        bookings: count,
      };
    });
  }, [testDrives]);

  const vehicleInterest = useMemo(() => {
    const counts: Record<
      string,
      { name: string; bookings: number; image: string }
    > = {};
    filteredTestDrives.forEach((td) => {
      const id = td.carId?._id || "unknown";
      if (!counts[id]) {
        counts[id] = {
          name: td.carId?.title || "Unknown Car",
          bookings: 0,
          image: td.carId?.image || td.carId?.images?.[0] || "",
        };
      }
      counts[id].bookings++;
    });
    return Object.values(counts)
      .sort((a, b) => b.bookings - a.bookings)
      .slice(0, 5);
  }, [filteredTestDrives]);

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

  const years = Array.from({ length: 5 }, (_, i) => getYear(new Date()) - i);

  if (loading) return <Loading />;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Dashboard
        </h1>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="test-drives">Test Drives</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-8">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {overviewStats.map((item, index) => {
              const Icon = item.icon;
              return (
                <Card key={index} className="hover:shadow-md transition-shadow">
                  <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
                    <div className="flex-1">
                      <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        {item.name}
                      </CardTitle>
                    </div>
                    <div className="p-2.5 bg-primary/10 rounded-lg">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-1">
                    <div className="text-3xl font-bold text-foreground">
                      {item.value}
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {item.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardTitle className="text-xl">Monthly Trend</CardTitle>
                  <p className="text-xs text-muted-foreground mt-1">
                    Booking volume over the last 6 months
                  </p>
                </div>
                <div className="p-2 bg-primary/10 rounded-lg">
                  <TrendingUp className="w-4 h-4 text-primary" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full pt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={monthlyTrend}>
                      <defs>
                        <linearGradient
                          id="colorCount"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="hsl(var(--primary))"
                            stopOpacity={0.4}
                          />
                          <stop
                            offset="95%"
                            stopColor="hsl(var(--primary))"
                            stopOpacity={0.05}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="hsl(var(--none))"
                        className="stroke-muted"
                        opacity={0.4}
                      />
                      <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{
                          fill: "hsl(var(--foreground))",
                          fontSize: 12,
                          opacity: 0.7,
                        }}
                        dy={10}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{
                          fill: "hsl(var(--foreground))",
                          fontSize: 12,
                          opacity: 0.7,
                        }}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Area
                        type="monotone"
                        dataKey="bookings"
                        stroke="hsl(var(--primary))"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorCount)"
                        animationDuration={1500}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardTitle className="text-xl">Status Share</CardTitle>
                  <p className="text-xs text-muted-foreground mt-1">
                    Distribution of all bookings
                  </p>
                </div>
                <div className="p-2 bg-primary/10 rounded-lg">
                  <PieChartIcon className="w-4 h-4 text-primary" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full">
                  {allTimeStatusDistribution.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={allTimeStatusDistribution}
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {allTimeStatusDistribution.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={entry.color}
                              stroke="hsl(var(--background))"
                              strokeWidth={2}
                            />
                          ))}
                        </Pie>
                        <Tooltip content={<PieTooltip />} />
                        <Legend content={<CustomLegend />} />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-muted-foreground italic text-sm">
                      <PieChartIcon className="w-8 h-8 mb-2 opacity-20" />
                      No booking data available
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Dealership Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="grid gap-8 md:grid-cols-2">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-foreground">
                      Inventory Utilization
                    </p>
                    <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                      {cars.length > 0
                        ? (
                            (cars.filter((c) => c.status === "available")
                              .length /
                              cars.length) *
                            100
                          ).toFixed(0)
                        : 0}
                      %
                    </span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{
                        width: `${cars.length > 0 ? (cars.filter((c) => c.status === "available").length / cars.length) * 100 : 0}%`,
                      }}
                    ></div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Available vs Total Cars
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-foreground">
                      Completion Rate
                    </p>
                    <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                      {testDrives.length > 0
                        ? (
                            (testDrives.filter(
                              (td) => td.status === "COMPLETED",
                            ).length /
                              testDrives.length) *
                            100
                          ).toFixed(0)
                        : 0}
                      %
                    </span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{
                        width: `${testDrives.length > 0 ? (testDrives.filter((td) => td.status === "COMPLETED").length / testDrives.length) * 100 : 0}%`,
                      }}
                    ></div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Completed vs Total Bookings
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="test-drives" className="space-y-8">
          {/* Advanced Filter UI */}
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader className="pb-3 pt-4">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-primary" />
                <CardTitle className="text-sm font-semibold">
                  Test Drive Period Selection
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap items-end gap-6">
                <div className="space-y-1.5">
                  <Label className="text-[10px] uppercase font-bold text-muted-foreground">
                    Filter Method
                  </Label>
                  <Select
                    value={filterType}
                    onValueChange={(v: any) => setFilterType(v)}
                  >
                    <SelectTrigger className="w-[160px] h-9 bg-background">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="month">Specific Month</SelectItem>
                      <SelectItem value="month-range">Month Range</SelectItem>
                      <SelectItem value="date-range">Date Picker</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {filterType === "month" && (
                  <>
                    <div className="space-y-1.5">
                      <Label className="text-[10px] uppercase font-bold text-muted-foreground">
                        Month
                      </Label>
                      <Select
                        value={selectedMonth.toString()}
                        onValueChange={(v) => setSelectedMonth(parseInt(v))}
                      >
                        <SelectTrigger className="w-[130px] h-9 bg-background">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {months.map((m, i) => (
                            <SelectItem key={m} value={i.toString()}>
                              {m}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[10px] uppercase font-bold text-muted-foreground">
                        Year
                      </Label>
                      <Select
                        value={selectedYear.toString()}
                        onValueChange={(v) => setSelectedYear(parseInt(v))}
                      >
                        <SelectTrigger className="w-[100px] h-9 bg-background">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {years.map((y) => (
                            <SelectItem key={y} value={y.toString()}>
                              {y}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}

                {filterType === "month-range" && (
                  <div className="flex items-end gap-2">
                    <div className="space-y-1.5">
                      <Label className="text-[10px] uppercase font-bold text-muted-foreground">
                        Starting Period
                      </Label>
                      <div className="flex gap-2">
                        <Select
                          value={startMonth.toString()}
                          onValueChange={(v) => setStartMonth(parseInt(v))}
                        >
                          <SelectTrigger className="w-[110px] h-9 bg-background">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {months.map((m, i) => (
                              <SelectItem key={m} value={i.toString()}>
                                {m}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Select
                          value={startYear.toString()}
                          onValueChange={(v) => setStartYear(parseInt(v))}
                        >
                          <SelectTrigger className="w-[90px] h-9 bg-background">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {years.map((y) => (
                              <SelectItem key={y} value={y.toString()}>
                                {y}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="h-9 flex items-center text-muted-foreground">
                      —
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[10px] uppercase font-bold text-muted-foreground">
                        Ending Period
                      </Label>
                      <div className="flex gap-2">
                        <Select
                          value={endMonth.toString()}
                          onValueChange={(v) => setEndMonth(parseInt(v))}
                        >
                          <SelectTrigger className="w-[110px] h-9 bg-background">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {months.map((m, i) => (
                              <SelectItem key={m} value={i.toString()}>
                                {m}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Select
                          value={endYear.toString()}
                          onValueChange={(v) => setEndYear(parseInt(v))}
                        >
                          <SelectTrigger className="w-[90px] h-9 bg-background">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {years.map((y) => (
                              <SelectItem key={y} value={y.toString()}>
                                {y}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                )}

                {filterType === "date-range" && (
                  <>
                    <div className="space-y-1.5">
                      <Label className="text-[10px] uppercase font-bold text-muted-foreground">
                        Start Date
                      </Label>
                      <Input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="h-9 w-[150px] bg-background"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[10px] uppercase font-bold text-muted-foreground">
                        End Date
                      </Label>
                      <Input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="h-9 w-[150px] bg-background"
                      />
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
            {testDriveStatsRows.map((item, index) => {
              const Icon = item.icon;
              return (
                <Card key={index} className="hover:shadow-md transition-shadow">
                  <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
                    <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
                      {item.name}
                    </CardTitle>
                    <div className={`p-2 ${item.color} rounded-lg shadow-sm`}>
                      <Icon className="h-4 w-4 text-white" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-foreground">
                      {item.value}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {testDriveStatsRows[0].value > 0
                        ? (
                            (item.value / testDriveStatsRows[0].value) *
                            100
                          ).toFixed(0)
                        : 0}
                      % of period total
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardTitle className="text-xl">Busiest Days</CardTitle>
                  <p className="text-xs text-muted-foreground mt-1">
                    {filterType === "month"
                      ? "Booking distribution for selected month"
                      : "Booking distribution for selected range"}
                  </p>
                </div>
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Clock className="w-4 h-4 text-primary" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full pt-4">
                  {dayWiseDistribution.some((d) => d.bookings > 0) ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={dayWiseDistribution}>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          vertical={false}
                          className="stroke-muted"
                          opacity={0.4}
                        />
                        <XAxis
                          dataKey="name"
                          axisLine={false}
                          tickLine={false}
                          tick={{
                            fill: "hsl(var(--foreground))",
                            fontSize: 12,
                            opacity: 0.7,
                          }}
                          dy={8}
                        />
                        <YAxis
                          axisLine={false}
                          tickLine={false}
                          tick={{
                            fill: "hsl(var(--foreground))",
                            fontSize: 12,
                            opacity: 0.7,
                          }}
                        />
                        <Tooltip
                          content={<CustomTooltip />}
                          cursor={{
                            fill: "hsl(var(--primary) / 0.05)",
                            radius: 4,
                          }}
                        />
                        <Bar
                          dataKey="bookings"
                          fill="hsl(var(--primary))"
                          radius={[6, 6, 0, 0]}
                          barSize={32}
                          activeBar={{
                            fill: "hsl(var(--primary))",
                            opacity: 0.8,
                          }}
                          animationDuration={1500}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-muted-foreground italic text-sm">
                      <Clock className="w-8 h-8 mb-2 opacity-20" />
                      No bookings found for this period
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardTitle className="text-xl">Vehicle Hotlist</CardTitle>
                  <p className="text-xs text-muted-foreground mt-1">
                    Most requested inventory in this period
                  </p>
                </div>
                <div className="p-2 bg-primary/10 rounded-lg">
                  <TrendingUp className="w-4 h-4 text-primary" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full pt-4">
                  {vehicleInterest.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={vehicleInterest}
                        layout="vertical"
                        margin={{ left: 40, right: 30, top: 10, bottom: 10 }}
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          horizontal={false}
                          className="stroke-muted"
                          opacity={0.4}
                        />
                        <XAxis type="number" hide />
                        <YAxis
                          dataKey="name"
                          type="category"
                          width={120}
                          axisLine={false}
                          tickLine={false}
                          tick={{
                            fill: "hsl(var(--foreground))",
                            fontSize: 11,
                            opacity: 0.8,
                          }}
                        />
                        <Tooltip
                          content={<CustomTooltip />}
                          cursor={{
                            fill: "hsl(var(--primary) / 0.05)",
                            radius: 4,
                          }}
                        />
                        <Bar
                          dataKey="bookings"
                          fill="hsl(var(--primary))"
                          fillOpacity={0.8}
                          radius={[0, 6, 6, 0]}
                          barSize={24}
                          activeBar={{ fillOpacity: 1 }}
                          animationDuration={1500}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-muted-foreground italic text-sm">
                      <CarIcon className="w-8 h-8 mb-2 opacity-20" />
                      No vehicle data for this period
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Period Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-3">
                <div className="p-4 rounded-lg bg-muted/30 border border-border transition-colors hover:bg-muted/50">
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {testDriveStatsRows[0].value > 0
                      ? (
                          (testDriveStatsRows[3].value /
                            testDriveStatsRows[0].value) *
                          100
                        ).toFixed(0)
                      : 0}
                    %
                  </p>
                  <p className="text-sm font-medium text-foreground mt-1">
                    Completion Rate
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Bookings completed in this period
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-muted/30 border border-border transition-colors hover:bg-muted/50">
                  <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                    {testDriveStatsRows[0].value > 0
                      ? (
                          (testDriveStatsRows[1].value /
                            testDriveStatsRows[0].value) *
                          100
                        ).toFixed(0)
                      : 0}
                    %
                  </p>
                  <p className="text-sm font-medium text-foreground mt-1">
                    Pending Rate
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Bookings awaiting action
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-muted/30 border border-border transition-colors hover:bg-muted/50">
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {testDriveStatsRows[0].value > 0
                      ? (
                          (testDriveStatsRows[2].value /
                            testDriveStatsRows[0].value) *
                          100
                        ).toFixed(0)
                      : 0}
                    %
                  </p>
                  <p className="text-sm font-medium text-foreground mt-1">
                    Confirmation Rate
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Bookings confirmed for period
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold text-foreground">
                  Status Breakdown
                </h4>
                <div className="space-y-4">
                  {testDriveStatsRows.slice(1).map((item, index) => (
                    <div key={index}>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-foreground font-medium">
                          {item.name}
                        </span>
                        <span className="text-muted-foreground">
                          {testDriveStatsRows[0].value > 0
                            ? (
                                (item.value / testDriveStatsRows[0].value) *
                                100
                              ).toFixed(0)
                            : 0}
                          %
                        </span>
                      </div>
                      <div className="w-full bg-secondary rounded-full h-2">
                        <div
                          className={`${item.color} h-2 rounded-full`}
                          style={{
                            width: `${testDriveStatsRows[0].value > 0 ? (item.value / testDriveStatsRows[0].value) * 100 : 0}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
