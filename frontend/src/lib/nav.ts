import {
  LayoutDashboard,
  Search,
  Package,
  Target,
  Users,
  Truck,
  Calculator,
  Megaphone,
  Activity,
  Settings,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export const navItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Minerador", href: "/minerador", icon: Search },
  { label: "Produtos", href: "/produtos", icon: Package },
  { label: "Oportunidades", href: "/oportunidades", icon: Target },
  { label: "Concorrentes", href: "/concorrentes", icon: Users },
  { label: "Fornecedores", href: "/fornecedores", icon: Truck },
  { label: "Rentabilidade", href: "/rentabilidade", icon: Calculator },
  { label: "Anúncios", href: "/anuncios", icon: Megaphone },
  { label: "Monitoramento", href: "/monitoramento", icon: Activity },
  { label: "Configurações", href: "/configuracoes", icon: Settings },
];
