"use client";

import { AdminSidebar } from "@/components/admin-sidebar";
import ThemeToggle from "@/components/ThemeToggle";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const isLoginPage = pathname === "/admin/login";

  if (isLoginPage) {
    return <>{children}</>;
  }
  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />

      <main className="md:ml-64 flex-1 min-w-0 flex flex-col">
        {/* Header */}
        <header className="border-b border-border bg-card relative">
          <div className="flex items-center justify-between px-8 py-4 max-md:px-4 max-md:pl-14">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-semibold text-foreground">admin</h2>
            </div>
            <div className="flex items-center gap-4">
              <ThemeToggle />
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-8 max-md:p-4">{children}</div>
      </main>
    </div>
  );
}
