"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, Car, TestTube2, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

export function AdminSidebar() {
  const pathname = usePathname();

  const segments = pathname.split("/");
  console.log(segments);
  const isVendorPath = segments[1] === "vendor";
  const isAdminPath = segments[1] === "admin" && segments[2] !== "login";
  const vendorId = isVendorPath || isAdminPath ? segments[2] : null;

  const basePath = isVendorPath ? `/vendor/${vendorId}` : `/admin/${vendorId}`;

  const navItems = [
    {
      label: "Dashboard",
      href: `${basePath}/dashboard`,
      icon: LayoutDashboard,
    },
    {
      label: "Cars",
      href: `${basePath}/add-car`,
      icon: Car,
    },
    {
      label: "Test Drives",
      href: `${basePath}/test-drives`,
      icon: TestTube2,
    },
    {
      label: "Settings",
      href: `${basePath}/settings`,
      icon: Settings,
    },
  ];

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
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group flex items-center gap-3 rounded-lg px-4 py-3 font-medium transition-all duration-200",
                  isActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-md"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
              >
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-sidebar-border px-6 py-4 text-sm text-sidebar-foreground/70">
          <p>© 2026 {isVendorPath ? "Vendor Panel" : "Vehicl Admin"}</p>
        </div>
      </div>
    </aside>
  );
}
