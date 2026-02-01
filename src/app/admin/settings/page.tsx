"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Clock, Users, Search, Shield, MoreVertical } from "lucide-react";
import { useState } from "react";

const workingHours = [
  { day: "Monday", isOpen: true, openTime: "09:00 AM", closeTime: "06:00 PM" },
  { day: "Tuesday", isOpen: true, openTime: "09:00 AM", closeTime: "06:00 PM" },
  {
    day: "Wednesday",
    isOpen: true,
    openTime: "09:00 AM",
    closeTime: "06:00 PM",
  },
  {
    day: "Thursday",
    isOpen: true,
    openTime: "09:00 AM",
    closeTime: "06:00 PM",
  },
  { day: "Friday", isOpen: true, openTime: "09:00 AM", closeTime: "06:00 PM" },
  {
    day: "Saturday",
    isOpen: true,
    openTime: "10:00 AM",
    closeTime: "04:00 PM",
  },
  { day: "Sunday", isOpen: false, openTime: "—", closeTime: "—" },
];

const adminUsers = [
  {
    id: 1,
    name: "Algo Agarwal",
    email: "algo@example.com",
    role: "USER",
    avatar: "AA",
  },
  {
    id: 2,
    name: "Roadside Coder",
    email: "coder@example.com",
    role: "USER",
    avatar: "RC",
  },
  {
    id: 3,
    name: "Piyush Agarwal",
    email: "piyush@example.com",
    role: "ADMIN",
    avatar: "PA",
  },
];

export default function SettingsPage() {
  const [hours, setHours] = useState(workingHours);
  const [users, setUsers] = useState(adminUsers);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleToggleDay = (index: number) => {
    const updated = [...hours];
    updated[index].isOpen = !updated[index].isOpen;
    setHours(updated);
  };

  const handleTimeChange = (
    index: number,
    field: "openTime" | "closeTime",
    value: string
  ) => {
    const updated = [...hours];
    updated[index][field] = value;
    setHours(updated);
  };

  const handlePromoteUser = (userId: number) => {
    setUsers(users.map((u) => (u.id === userId ? { ...u, role: "ADMIN" } : u)));
  };

  const handleDemoteUser = (userId: number) => {
    setUsers(users.map((u) => (u.id === userId ? { ...u, role: "USER" } : u)));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Settings
        </h1>
        <p className="text-muted-foreground mt-2">
          Manage your dealership configuration and admin access
        </p>
      </div>

      <Tabs defaultValue="working-hours" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:w-96">
          <TabsTrigger
            value="working-hours"
            className="flex items-center gap-2"
          >
            <Clock className="h-4 w-4" />
            <span className="hidden sm:inline">Working Hours</span>
          </TabsTrigger>
          <TabsTrigger value="admin-users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Admin Users</span>
          </TabsTrigger>
        </TabsList>

        {/* Working Hours Tab */}
        <TabsContent value="working-hours" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Working Hours</CardTitle>
              <CardDescription>
                Set your dealership's working hours for each day of the week
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {hours.map((hour, index) => (
                <div
                  key={index}
                  className="flex flex-col sm:flex-row sm:items-center gap-4 pb-4 border-b border-border last:border-0 last:pb-0"
                >
                  <div className="w-32 flex items-center gap-3">
                    <Checkbox
                      id={`day-${index}`}
                      checked={hour.isOpen}
                      onCheckedChange={() => handleToggleDay(index)}
                    />
                    <Label
                      htmlFor={`day-${index}`}
                      className="font-medium text-foreground cursor-pointer"
                    >
                      {hour.day}
                    </Label>
                  </div>

                  <div className="flex-1 flex flex-col sm:flex-row sm:items-center gap-3">
                    {hour.isOpen ? (
                      <>
                        <span className="text-sm font-medium text-green-600">
                          Open
                        </span>
                        <div className="flex items-center gap-2 flex-1">
                          <Input
                            type="time"
                            value={hour.openTime}
                            onChange={(e) =>
                              handleTimeChange(
                                index,
                                "openTime",
                                e.target.value
                              )
                            }
                            className="w-28"
                          />
                          <span className="text-muted-foreground text-sm">
                            to
                          </span>
                          <Input
                            type="time"
                            value={hour.closeTime}
                            onChange={(e) =>
                              handleTimeChange(
                                index,
                                "closeTime",
                                e.target.value
                              )
                            }
                            className="w-28"
                          />
                        </div>
                      </>
                    ) : (
                      <span className="text-sm text-muted-foreground italic">
                        Closed all day
                      </span>
                    )}
                  </div>
                </div>
              ))}

              <div className="pt-4">
                <Button className="w-full sm:w-auto">Save Changes</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Admin Users Tab */}
        <TabsContent value="admin-users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Admin Users</CardTitle>
              <CardDescription>
                Manage users with admin privileges
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Users Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-muted/50">
                      <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
                        User
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
                        Email
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
                        Role
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user) => (
                      <tr
                        key={user.id}
                        className="border-b border-border hover:bg-muted/50 transition-colors"
                      >
                        <td className="px-4 py-4 text-sm">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage
                                src={`https://avatar.vercel.sh/${user.avatar}`}
                              />
                              <AvatarFallback>{user.avatar}</AvatarFallback>
                            </Avatar>
                            <span className="font-medium text-foreground">
                              {user.name}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-sm text-muted-foreground">
                          {user.email}
                        </td>
                        <td className="px-4 py-4 text-sm">
                          <Badge
                            variant={
                              user.role === "ADMIN" ? "default" : "secondary"
                            }
                          >
                            {user.role}
                          </Badge>
                        </td>
                        <td className="px-4 py-4 text-sm">
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
                              {user.role === "USER" ? (
                                <DropdownMenuItem
                                  onClick={() => handlePromoteUser(user.id)}
                                >
                                  <Shield className="h-4 w-4 mr-2" />
                                  Make Admin
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem
                                  onClick={() => handleDemoteUser(user.id)}
                                >
                                  Remove Admin
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {filteredUsers.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">
                    No users found matching your search.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
