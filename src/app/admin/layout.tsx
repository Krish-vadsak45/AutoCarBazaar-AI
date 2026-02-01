import { AdminSidebar } from "@/components/admin-sidebar";
import ThemeToggle from "@/components/ThemeToggle";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />

      <main className="ml-64 flex-1 max-md:ml-48">
        {/* Header */}
        <header className="border-b border-border bg-card">
          <div className="flex items-center justify-between px-8 py-4 max-md:px-4">
            <h2 className="text-xl font-semibold text-foreground">admin</h2>
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
