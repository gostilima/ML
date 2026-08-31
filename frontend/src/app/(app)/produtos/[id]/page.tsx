"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Pencil } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/ui/state";
import { ProductFormDialog } from "@/components/products/product-form-dialog";
import { OpportunityScorePanel } from "@/components/mining/opportunity-score";
import { useProduct } from "@/hooks/use-products";
import { formatCurrency, formatNumber, formatPercent } from "@/lib/utils";

export default function ProdutoDetailPage({ params }: { params: { id: string } }) {
  const { data: product, isLoading, isError, refetch } = useProduct(params.id);
  const [editOpen, setEditOpen] = useState(false);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <Link href="/produtos" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Voltar para produtos
      </Link>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-8 w-1/3" />
          <Skeleton className="h-64 w-full" />
        </div>
      ) : isError || !product ? (
        <ErrorState onRetry={() => refetch()} />
      ) : (
        <>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-muted">
                {product.image_url && (
                  <Image src={product.image_url} alt={product.name} fill sizes="80px" className="object-cover" />
                )}
              </div>
              <div>
                <h1 className="text-2xl font-semibold tracking-tight">{product.name}</h1>
                <p className="text-sm text-muted-foreground">
                  {product.brand ?? "Sem marca"} · {product.category ?? "Sem categoria"}
                </p>
              </div>
            </div>
            <Button variant="outline" onClick={() => setEditOpen(true)}>
              <Pencil className="mr-2 h-4 w-4" /> Editar
            </Button>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="text-base">Dados cadastrais</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
                <Field label="SKU" value={product.sku} />
                <Field label="ID anúncio ML" value={product.ml_item_id} />
                <Field label="EAN" value={product.ean} />
                <Field label="Peso" value={product.weight_kg ? `${product.weight_kg} kg` : null} />
                <Field
                  label="Dimensões"
                  value={
                    product.dimensions
                      ? `${product.dimensions.length_cm ?? "—"} × ${product.dimensions.width_cm ?? "—"} × ${
                          product.dimensions.height_cm ?? "—"
                        } cm`
                      : null
                  }
                />
              </CardContent>

              <CardHeader className="pt-0">
                <CardTitle className="text-base">Desempenho</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
                <Field label="Preço" value={formatCurrency(product.price)} />
                <Field label="Vendas/mês" value={formatNumber(product.monthly_sales)} />
                <Field label="Faturamento/mês" value={formatCurrency(product.monthly_revenue)} />
                <Field label="Custo fornecedor" value={formatCurrency(product.supplier_cost)} />
                <Field label="Lucro" value={formatCurrency(product.profit)} />
                <Field label="Margem" value={formatPercent(product.margin)} />
                <Field label="ROI" value={formatPercent(product.roi)} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Opportunity Score</CardTitle>
              </CardHeader>
              <CardContent>
                {product.opportunity_score ? (
                  <OpportunityScorePanel {...product.opportunity_score} />
                ) : (
                  <p className="text-sm text-muted-foreground">Score ainda não calculado para este produto.</p>
                )}
              </CardContent>
            </Card>
          </div>

          <ProductFormDialog open={editOpen} onOpenChange={setEditOpen} product={product} />
        </>
      )}
    </div>
  );
}

function Field({ label, value }: { label: string; value: string | number | null | undefined }) {
  return (
    <div>
      <p className="text-muted-foreground">{label}</p>
      <p className="font-medium">{value ?? "—"}</p>
    </div>
  );
}
