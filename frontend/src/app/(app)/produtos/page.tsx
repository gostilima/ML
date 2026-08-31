"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Plus, Search, Trash2, Pencil, Package } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmptyState, ErrorState, TableSkeleton } from "@/components/ui/state";
import { ProductFormDialog } from "@/components/products/product-form-dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useDeleteProduct, useProducts } from "@/hooks/use-products";
import { formatCurrency, formatNumber, formatPercent } from "@/lib/utils";
import type { Product } from "@/types/products";
import { useToast } from "@/hooks/use-toast";

export default function ProdutosPage() {
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState<Product | null>(null);

  const { data, isLoading, isError, refetch } = useProducts({ search: search || undefined });
  const deleteMutation = useDeleteProduct();
  const { toast } = useToast();

  const products = data?.items ?? [];

  async function confirmDelete() {
    if (!deleting) return;
    try {
      await deleteMutation.mutateAsync(deleting.id);
      toast({ title: "Produto removido." });
    } catch {
      toast({ title: "Erro ao remover produto.", variant: "destructive" });
    } finally {
      setDeleting(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Produtos</h1>
          <p className="text-sm text-muted-foreground">Catálogo de produtos monitorados.</p>
        </div>
        <Button
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" /> Novo produto
        </Button>
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between gap-3 space-y-0">
          <CardTitle className="text-base">Lista de produtos</CardTitle>
          <div className="relative w-full max-w-xs">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome, SKU…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <TableSkeleton rows={6} cols={7} />
          ) : isError ? (
            <ErrorState onRetry={() => refetch()} />
          ) : products.length === 0 ? (
            <EmptyState
              icon={Package}
              title="Nenhum produto encontrado."
              description="Tente ampliar seus filtros."
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produto</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Preço</TableHead>
                  <TableHead>Vendas/mês</TableHead>
                  <TableHead>Margem</TableHead>
                  <TableHead>ROI</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>
                      <Link href={`/produtos/${p.id}`} className="flex items-center gap-3 hover:underline">
                        <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md bg-muted">
                          {p.image_url && (
                            <Image src={p.image_url} alt={p.name} fill sizes="40px" className="object-cover" />
                          )}
                        </div>
                        <span className="max-w-[220px] truncate font-medium">{p.name}</span>
                      </Link>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{p.sku ?? "—"}</TableCell>
                    <TableCell>{formatCurrency(p.price)}</TableCell>
                    <TableCell>{formatNumber(p.monthly_sales)}</TableCell>
                    <TableCell>{formatPercent(p.margin)}</TableCell>
                    <TableCell>{formatPercent(p.roi)}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setEditing(p);
                          setFormOpen(true);
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => setDeleting(p)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <ProductFormDialog open={formOpen} onOpenChange={setFormOpen} product={editing} />

      <AlertDialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover produto?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O produto &quot;{deleting?.name}&quot; será removido permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
