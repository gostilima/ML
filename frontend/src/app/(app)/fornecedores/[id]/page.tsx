"use client";
import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Pencil, Plus, Trash2, Package } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState, ErrorState } from "@/components/ui/state";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SupplierFormDialog } from "@/components/suppliers/supplier-form-dialog";
import { SupplierProductFormDialog } from "@/components/suppliers/supplier-product-form-dialog";
import { useRemoveSupplierProduct, useSupplier } from "@/hooks/use-suppliers";
import { formatCurrency, formatNumber } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

export default function FornecedorDetailPage({ params }: { params: { id: string } }) {
  const { data: supplier, isLoading, isError, refetch } = useSupplier(params.id);
  const [editOpen, setEditOpen] = useState(false);
  const [addProductOpen, setAddProductOpen] = useState(false);
  const removeProduct = useRemoveSupplierProduct(params.id);
  const { toast } = useToast();

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <Link href="/fornecedores" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Voltar para fornecedores
      </Link>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-8 w-1/3" />
          <Skeleton className="h-64 w-full" />
        </div>
      ) : isError || !supplier ? (
        <ErrorState onRetry={() => refetch()} />
      ) : (
        <>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">{supplier.name}</h1>
              <p className="text-sm text-muted-foreground">{supplier.location ?? "Localização não informada"}</p>
            </div>
            <Button variant="outline" onClick={() => setEditOpen(true)}>
              <Pencil className="mr-2 h-4 w-4" /> Editar
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Contato</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
              <Field label="Responsável" value={supplier.contact_name} />
              <Field label="E-mail" value={supplier.email} />
              <Field label="Telefone" value={supplier.phone} />
              <Field label="Site" value={supplier.website} />
            </CardContent>
            {supplier.notes && (
              <CardContent className="pt-0 text-sm text-muted-foreground">{supplier.notes}</CardContent>
            )}
          </Card>

          <Card>
            <CardHeader className="flex-row items-center justify-between gap-3 space-y-0">
              <CardTitle className="text-base">Catálogo de produtos</CardTitle>
              <Button size="sm" onClick={() => setAddProductOpen(true)}>
                <Plus className="mr-2 h-4 w-4" /> Adicionar item
              </Button>
            </CardHeader>
            <CardContent>
              {!supplier.products || supplier.products.length === 0 ? (
                <EmptyState
                  icon={Package}
                  title="Nenhum item cadastrado."
                  description="Adicione os produtos ofertados por este fornecedor."
                />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Código</TableHead>
                      <TableHead>Preço</TableHead>
                      <TableHead>MOQ</TableHead>
                      <TableHead>Estoque</TableHead>
                      <TableHead>Frete</TableHead>
                      <TableHead>Prazo</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {supplier.products.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell className="font-medium">{p.nome}</TableCell>
                        <TableCell className="text-muted-foreground">{p.codigo ?? "—"}</TableCell>
                        <TableCell>{formatCurrency(p.preco)}</TableCell>
                        <TableCell>{formatNumber(p.moq)}</TableCell>
                        <TableCell>{formatNumber(p.estoque)}</TableCell>
                        <TableCell>{formatCurrency(p.frete)}</TableCell>
                        <TableCell>{p.prazo_dias ? `${p.prazo_dias} dias` : "—"}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={async () => {
                              try {
                                await removeProduct.mutateAsync(p.id);
                                toast({ title: "Item removido." });
                              } catch {
                                toast({ title: "Erro ao remover item.", variant: "destructive" });
                              }
                            }}
                          >
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

          <SupplierFormDialog open={editOpen} onOpenChange={setEditOpen} supplier={supplier} />
          <SupplierProductFormDialog supplierId={supplier.id} open={addProductOpen} onOpenChange={setAddProductOpen} />
        </>
      )}
    </div>
  );
}

function Field({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div>
      <p className="text-muted-foreground">{label}</p>
      <p className="font-medium">{value ?? "—"}</p>
    </div>
  );
}
