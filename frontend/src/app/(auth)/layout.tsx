import { BarChart3 } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="flex items-center justify-center gap-2">
          <BarChart3 className="h-7 w-7 text-primary" />
          <span className="text-lg font-semibold">Marketplace Intelligence</span>
        </div>
        {children}
      </div>
    </div>
  );
}
