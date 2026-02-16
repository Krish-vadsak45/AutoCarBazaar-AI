"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Car,
  Users,
  TrendingUp,
  ShoppingCart,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
} from "lucide-react";

const overviewData = [
  {
    name: "Total Cars",
    value: 10,
    icon: Car,
    description: "9 available, 1 sold",
  },
  {
    name: "Test Drives",
    value: 5,
    icon: Users,
    description: "2 pending, 1 confirmed",
  },
  {
    name: "Conversion Rate",
    value: "50%",
    icon: TrendingUp,
    description: "From test drives to sales",
  },
  {
    name: "Cars Sold",
    value: 1,
    icon: ShoppingCart,
    description: "10.0% of inventory",
  },
];

const testDrivesData = [
  { name: "Total Bookings", value: 5, icon: Clock, color: "bg-blue-500" },
  { name: "Pending", value: 2, icon: AlertCircle, color: "bg-orange-500" },
  { name: "Confirmed", value: 1, icon: CheckCircle, color: "bg-green-500" },
  { name: "Completed", value: 2, icon: CheckCircle, color: "bg-blue-500" },
  { name: "Cancelled", value: 0, icon: XCircle, color: "bg-red-500" },
];

export default function DashboardPage() {
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

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-8">
          {/* Stats Grid - Better Spacing */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {overviewData.map((item, index) => {
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

          {/* Dealership Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Dealership Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* Progress Bars */}
              <div className="grid gap-8 md:grid-cols-2">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-foreground">
                      Car Inventory
                    </p>
                    <span className="text-sm font-semibold text-green-600">
                      90%
                    </span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: "90%" }}
                    ></div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Available inventory capacity
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-foreground">
                      Test Drive Success
                    </p>
                    <span className="text-sm font-semibold text-blue-600">
                      40%
                    </span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: "40%" }}
                    ></div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Completed test drives
                  </p>
                </div>
              </div>

              {/* KPI Cards */}
              <div className="grid gap-6 md:grid-cols-3">
                <div className="p-4 rounded-lg bg-muted/50 border border-border">
                  <p className="text-3xl font-bold text-blue-600">1</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Cars Sold
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50 border border-border">
                  <p className="text-3xl font-bold text-orange-600">3</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Upcoming Test Drives
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50 border border-border">
                  <p className="text-3xl font-bold text-green-600">90%</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Inventory Utilization
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Test Drives Tab */}
        <TabsContent value="test-drives" className="space-y-8">
          {/* Test Drives Stats Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
            {testDrivesData.map((item, index) => {
              const Icon = item.icon;
              return (
                <Card key={index} className="hover:shadow-md transition-shadow">
                  <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
                    <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      {item.name}
                    </CardTitle>
                    <div className={`p-2.5 ${item.color} rounded-lg`}>
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-foreground">
                      {item.value}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {((item.value / 5) * 100).toFixed(0)}% of total
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Test Drive Statistics */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Test Drive Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* KPI Row */}
              <div className="grid gap-6 md:grid-cols-2">
                <div className="p-4 rounded-lg bg-muted/50 border border-border">
                  <p className="text-3xl font-bold text-blue-600">50%</p>
                  <p className="text-sm font-medium text-foreground mt-2">
                    Conversion Rate
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Test drives to purchases
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50 border border-border">
                  <p className="text-3xl font-bold text-green-600">40%</p>
                  <p className="text-sm font-medium text-foreground mt-2">
                    Completion Rate
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Successfully completed
                  </p>
                </div>
              </div>

              {/* Booking Status Breakdown */}
              <div className="space-y-4">
                <h4 className="font-semibold text-foreground">
                  Booking Status Breakdown
                </h4>
                <div className="space-y-4">
                  {[
                    { name: "Pending", percentage: 40, color: "bg-orange-500" },
                    {
                      name: "Confirmed",
                      percentage: 20,
                      color: "bg-green-500",
                    },
                    { name: "Completed", percentage: 40, color: "bg-blue-500" },
                  ].map((item, index) => (
                    <div key={index}>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-foreground font-medium">
                          {item.name}
                        </span>
                        <span className="text-muted-foreground">
                          {item.percentage}%
                        </span>
                      </div>
                      <div className="w-full bg-secondary rounded-full h-3">
                        <div
                          className={`${item.color} h-3 rounded-full`}
                          style={{ width: `${item.percentage}%` }}
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
