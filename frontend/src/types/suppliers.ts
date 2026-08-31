export interface SupplierProduct {
  id: string;
  nome: string;
  codigo: string | null;
  preco: number;
  moq: number | null;
  estoque: number | null;
  frete: number | null;
  prazo_dias: number | null;
}

export interface Supplier {
  id: string;
  name: string;
  contact_name: string | null;
  email: string | null;
  phone: string | null;
  website: string | null;
  location: string | null;
  rating: number | null;
  notes: string | null;
  products: SupplierProduct[];
  created_at: string;
  updated_at: string;
}

export interface SupplierPayload {
  name: string;
  contact_name?: string;
  email?: string;
  phone?: string;
  website?: string;
  location?: string;
  notes?: string;
}

export interface SupplierProductPayload {
  nome: string;
  codigo?: string;
  preco: number;
  moq?: number;
  estoque?: number;
  frete?: number;
  prazo_dias?: number;
}
