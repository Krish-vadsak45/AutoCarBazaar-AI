"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  Car,
  TestTube2,
  Settings,
  LogOut,
  CreditCard,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { signOut } from "next-auth/react";
import axios from "axios";

export function AdminSidebar() {
  const pathname = usePathname();

  const segments = pathname.split("/");
  const isVendorPath = segments[1] === "vendor";
  const isAdminPath = segments[1] === "admin" && segments[2] !== "login";
  const vendorId = isVendorPath || isAdminPath ? segments[2] : null;

  // Track unread messages for this user
  const [hasUnread, setHasUnread] = useState(false);

  useEffect(() => {
    if (!vendorId) return;

    let isMounted = true;
    const checkUnread = async () => {
      try {
        const role = isVendorPath ? "VENDOR" : "ADMIN";
        const res = await axios.get(`/api/messages/unread-status?vendorId=${vendorId}&role=${role}`);
        if(isMounted) setHasUnread(res.data.hasUnread);
      } catch (err) {
        console.error("Failed fetching unread status", err);
      }
    }
    
    checkUnread();
    const interval = setInterval(() => {
      if (document.visibilityState === "visible") {
        checkUnread();
      }
    }, 30000); // Check every 30 seconds, only when tab is active

    return () => {
      isMounted = false;
      clearInterval(interval);
    }
  }, [vendorId, isVendorPath]);

  const basePath = isVendorPath ? `/vendor/${vendorId}` : `/admin/${vendorId}`;

  const vendorNavItems = [
    {
      label: "Dashboard",
      href: `/vendor/${vendorId}/dashboard`,
      icon: LayoutDashboard,
    },
    {
      label: "Payment",
      href: `/vendor/${vendorId}/payment`,
      icon: CreditCard,
    },
    {
      label: "Cars",
      href: `/vendor/${vendorId}/add-car`,
      icon: Car,
    },
    {
      label: "Test Drives",
      href: `/vendor/${vendorId}/test-drives`,
      icon: TestTube2,
    },
    {
      label: "Support Q&A",
      href: `/vendor/${vendorId}/support`,
      icon: Users,
      badge: hasUnread, // Custom badge prop
    },
    {
      label: "Settings",
      href: `/vendor/${vendorId}/settings`,
      icon: Settings,
    },
  ];

  const adminNavItems = [
    {
      label: "Dashboard",
      href: `/admin/${vendorId}/dashboard`,
      icon: LayoutDashboard,
    },
    {
      label: "Vendors",
      href: `/admin/${vendorId}/vendors`,
      icon: Users,
    },
  ];

  const navItems = isVendorPath ? vendorNavItems : adminNavItems;

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-all duration-300 ease-in-out max-md:w-48">
      <div className="flex h-full flex-col overflow-y-auto">
        {/* Header */}
        <div className="border-b border-sidebar-border px-6 py-6">
          <h1 className="text-xl font-bold">
            {isVendorPath ? "Vendor Panel" : "Vehicl Admin"}
          </h1>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-2 px-4 py-6">
          {navItems.map((item: any) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group relative flex items-center gap-3 rounded-lg px-4 py-3 font-medium transition-all duration-200 overflow-hidden",
                  isActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-md"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                )}
              >
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
                {item.badge && (
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Logout Button */}
        <div className="px-4 pb-2">
          <button
            onClick={() =>
              signOut({
                callbackUrl: isVendorPath ? "/vendor/login" : "/admin/login",
              })
            }
            className="flex w-full items-center gap-3 rounded-lg px-4 py-3 font-medium text-red-500 transition-all duration-200 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/10"
          >
            <LogOut className="h-5 w-5" />
            <span>Sign Out</span>
          </button>
        </div>

        {/* Footer */}
        <div className="border-t border-sidebar-border px-6 py-4 text-sm text-sidebar-foreground/70">
          <p>© 2026 {isVendorPath ? "Vendor Panel" : "Vehicl Admin"}</p>
        </div>
      </div>
    </aside>
  );
}
