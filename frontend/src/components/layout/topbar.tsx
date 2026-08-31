"use client";
import * as React from "react";
import Link from "next/link";
import { Bell, Menu, Search, LogOut, Settings as SettingsIcon, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/layout/sheet";
import { SidebarNav } from "@/components/layout/sidebar";
import { useAuth } from "@/hooks/use-auth";
import { useAlerts } from "@/hooks/use-alerts";
import { formatDateTime } from "@/lib/utils";

function NotificationsMenu() {
  const { data, isLoading } = useAlerts({ unread_only: false });
  const alerts = data?.items ?? [];
  const unreadCount = alerts.filter((a) => !a.read).length;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Notificações" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-destructive" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel>Notificações</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className="max-h-80 overflow-y-auto">
          {isLoading ? (
            <p className="px-2 py-4 text-center text-sm text-muted-foreground">Carregando…</p>
          ) : alerts.length === 0 ? (
            <p className="px-2 py-4 text-center text-sm text-muted-foreground">Nenhuma notificação por aqui.</p>
          ) : (
            alerts.slice(0, 8).map((a) => (
              <div key={a.id} className="border-b px-2 py-2 last:border-0">
                <p className="text-sm font-medium">{a.title}</p>
                <p className="text-xs text-muted-foreground">{a.message}</p>
                <p className="mt-1 text-[10px] text-muted-foreground">{formatDateTime(a.created_at)}</p>
              </div>
            ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function initials(name?: string | null) {
  if (!name) return "U";
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase() || "U";
}

export function Topbar() {
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b bg-card px-4 md:px-6">
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent>
          <SidebarNav onNavigate={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>

      <div className="relative hidden max-w-sm flex-1 sm:block">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Buscar produtos, anúncios, concorrentes…" className="pl-9" />
      </div>

      <div className="ml-auto flex items-center gap-2">
        <NotificationsMenu />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="gap-2 px-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback>{initials(user?.name)}</AvatarFallback>
              </Avatar>
              <span className="hidden text-sm font-medium sm:inline">{user?.name ?? "Minha conta"}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>{user?.email ?? "Conta"}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/configuracoes">
                <SettingsIcon className="mr-2 h-4 w-4" /> Configurações
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/configuracoes">
                <UserIcon className="mr-2 h-4 w-4" /> Meu perfil
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => logout()}>
              <LogOut className="mr-2 h-4 w-4" /> Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
