import { ProtectedRoute } from "@/hooks/use-auth";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <div className="min-h-screen">
        <Sidebar />
        <div className="md:pl-64">
          <Topbar />
          <main className="p-4 md:p-6">{children}</main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
