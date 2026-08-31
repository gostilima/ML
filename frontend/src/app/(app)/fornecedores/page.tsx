"use client";
import { useState } from "react";
import Link from "next/link";
import { Plus, Search, Trash2, Pencil, Truck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmptyState, ErrorState, TableSkeleton } from "@/components/ui/state";
import { SupplierFormDialog } from "@/components/suppliers/supplier-form-dialog";
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
import { useDeleteSupplier, useSuppliers } from "@/hooks/use-suppliers";
import type { Supplier } from "@/types/suppliers";
import { useToast } from "@/hooks/use-toast";

export default function FornecedoresPage() {
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Supplier | null>(null);
  const [deleting, setDeleting] = useState<Supplier | null>(null);

  const { data, isLoading, isError, refetch } = useSuppliers({ search: search || undefined });
  const deleteMutation = useDeleteSupplier();
  const { toast } = useToast();
  const suppliers = data?.items ?? [];

  async function confirmDelete() {
    if (!deleting) return;
    try {
      await deleteMutation.mutateAsync(deleting.id);
      toast({ title: "Fornecedor removido." });
    } catch {
      toast({ title: "Erro ao remover fornecedor.", variant: "destructive" });
    } finally {
      setDeleting(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Fornecedores</h1>
          <p className="text-sm text-muted-foreground">Base de fornecedores para cotações e sourcing.</p>
        </div>
        <Button
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" /> Novo fornecedor
        </Button>
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between gap-3 space-y-0">
          <CardTitle className="text-base">Lista de fornecedores</CardTitle>
          <div className="relative w-full max-w-xs">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Buscar fornecedor…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <TableSkeleton rows={5} cols={5} />
          ) : isError ? (
            <ErrorState onRetry={() => refetch()} />
          ) : suppliers.length === 0 ? (
            <EmptyState icon={Truck} title="Nenhum fornecedor encontrado." description="Tente ampliar seus filtros." />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fornecedor</TableHead>
                  <TableHead>Contato</TableHead>
                  <TableHead>E-mail</TableHead>
                  <TableHead>Localização</TableHead>
                  <TableHead>Itens</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {suppliers.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell>
                      <Link href={`/fornecedores/${s.id}`} className="font-medium hover:underline">
                        {s.name}
                      </Link>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{s.contact_name ?? "—"}</TableCell>
                    <TableCell className="text-muted-foreground">{s.email ?? "—"}</TableCell>
                    <TableCell className="text-muted-foreground">{s.location ?? "—"}</TableCell>
                    <TableCell>{s.products?.length ?? 0}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setEditing(s);
                          setFormOpen(true);
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => setDeleting(s)}>
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

      <SupplierFormDialog open={formOpen} onOpenChange={setFormOpen} supplier={editing} />

      <AlertDialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover fornecedor?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O fornecedor &quot;{deleting?.name}&quot; será removido permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
