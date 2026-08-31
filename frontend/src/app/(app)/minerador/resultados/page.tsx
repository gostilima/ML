"use client";
import { useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpDown, Heart, Search, SlidersHorizontal, Columns3 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmptyState, ErrorState, TableSkeleton } from "@/components/ui/state";
import { EstimatedBadge } from "@/components/ui/estimated-badge";
import { OpportunityScoreBadge } from "@/components/mining/opportunity-score";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useMiningSearch, useToggleFavorite } from "@/hooks/use-mining";
import { decodeMiningFilters } from "@/lib/mining-filters";
import { formatCurrency, formatNumber, formatPercent } from "@/lib/utils";
import type { MiningResultItem } from "@/types/mining";
import { useToast } from "@/hooks/use-toast";

type SortKey = "price" | "monthly_sales" | "monthly_revenue" | "profit" | "margin" | "roi" | "score";

export default function MineradorResultadosPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const filters = useMemo(() => decodeMiningFilters(searchParams.get("f")), [searchParams]);

  const { data, isLoading, isError, refetch } = useMiningSearch(filters);
  const toggleFavorite = useToggleFavorite();
  const { toast } = useToast();

  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("score");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [compareOpen, setCompareOpen] = useState(false);

  const items = useMemo(() => data?.items ?? [], [data]);

  const filtered = useMemo(() => {
    let list = items;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((i) => i.name.toLowerCase().includes(q));
    }
    const sorted = [...list].sort((a, b) => {
      const va = sortKey === "score" ? a.opportunity_score.score : (a[sortKey] ?? 0);
      const vb = sortKey === "score" ? b.opportunity_score.score : (b[sortKey] ?? 0);
      return sortDir === "asc" ? va - vb : vb - va;
    });
    return sorted;
  }, [items, search, sortKey, sortDir]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  }

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function handleFavorite(item: MiningResultItem) {
    try {
      await toggleFavorite.mutateAsync({ id: item.id, favorite: !item.is_favorite });
    } catch {
      toast({ title: "Erro ao favoritar produto.", variant: "destructive" });
    }
  }

  const selectedItems = items.filter((i) => selected.has(i.id));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Resultados da mineração</h1>
          <p className="text-sm text-muted-foreground">
            {data ? `${data.total} produtos encontrados` : "Ajuste os filtros para refinar a busca."}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push("/minerador")}>
            <SlidersHorizontal className="mr-2 h-4 w-4" /> Ajustar filtros
          </Button>
          <Button variant="outline" disabled={selected.size < 2} onClick={() => setCompareOpen(true)}>
            <Columns3 className="mr-2 h-4 w-4" /> Comparar ({selected.size})
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between gap-3 space-y-0">
          <CardTitle className="text-base">Produtos</CardTitle>
          <div className="relative w-full max-w-xs">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Filtrar por nome…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <TableSkeleton rows={8} cols={9} />
          ) : isError ? (
            <ErrorState onRetry={() => refetch()} />
          ) : filtered.length === 0 ? (
            <EmptyState icon={Search} title="Nenhum produto encontrado." description="Tente ampliar seus filtros." />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-8" />
                  <TableHead>Produto</TableHead>
                  <SortableHead label="Preço" sortKey="price" active={sortKey} dir={sortDir} onClick={toggleSort} />
                  <SortableHead label="Vendas/mês" sortKey="monthly_sales" active={sortKey} dir={sortDir} onClick={toggleSort} />
                  <SortableHead label="Faturamento/mês" sortKey="monthly_revenue" active={sortKey} dir={sortDir} onClick={toggleSort} />
                  <TableHead>Custo fornecedor</TableHead>
                  <SortableHead label="Lucro" sortKey="profit" active={sortKey} dir={sortDir} onClick={toggleSort} />
                  <SortableHead label="Margem" sortKey="margin" active={sortKey} dir={sortDir} onClick={toggleSort} />
                  <SortableHead label="ROI" sortKey="roi" active={sortKey} dir={sortDir} onClick={toggleSort} />
                  <SortableHead label="Score" sortKey="score" active={sortKey} dir={sortDir} onClick={toggleSort} />
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <Checkbox checked={selected.has(item.id)} onCheckedChange={() => toggleSelect(item.id)} />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md bg-muted">
                          {item.image_url && (
                            <Image src={item.image_url} alt={item.name} fill sizes="40px" className="object-cover" />
                          )}
                        </div>
                        <Link href={`/minerador/produto/${item.id}`} className="max-w-[220px] truncate font-medium hover:underline">
                          {item.name}
                        </Link>
                      </div>
                    </TableCell>
                    <TableCell>{formatCurrency(item.price)}</TableCell>
                    <TableCell>
                      {formatNumber(item.monthly_sales)}{" "}
                      <EstimatedBadge dataType={item.monthly_sales_data_type} />
                    </TableCell>
                    <TableCell>{formatCurrency(item.monthly_revenue)}</TableCell>
                    <TableCell>{formatCurrency(item.supplier_cost)}</TableCell>
                    <TableCell>{formatCurrency(item.profit)}</TableCell>
                    <TableCell>{formatPercent(item.margin)}</TableCell>
                    <TableCell>{formatPercent(item.roi)}</TableCell>
                    <TableCell>
                      <OpportunityScoreBadge {...item.opportunity_score} />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => handleFavorite(item)}>
                          <Heart className={item.is_favorite ? "h-4 w-4 fill-destructive text-destructive" : "h-4 w-4"} />
                        </Button>
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/minerador/produto/${item.id}`}>Detalhes</Link>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={compareOpen} onOpenChange={setCompareOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Comparar produtos</DialogTitle>
          </DialogHeader>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produto</TableHead>
                  <TableHead>Preço</TableHead>
                  <TableHead>Margem</TableHead>
                  <TableHead>ROI</TableHead>
                  <TableHead>Score</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {selectedItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="max-w-[200px] truncate font-medium">{item.name}</TableCell>
                    <TableCell>{formatCurrency(item.price)}</TableCell>
                    <TableCell>{formatPercent(item.margin)}</TableCell>
                    <TableCell>{formatPercent(item.roi)}</TableCell>
                    <TableCell>
                      <OpportunityScoreBadge {...item.opportunity_score} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function SortableHead({
  label,
  sortKey,
  active,
  dir,
  onClick,
}: {
  label: string;
  sortKey: SortKey;
  active: SortKey;
  dir: "asc" | "desc";
  onClick: (key: SortKey) => void;
}) {
  return (
    <TableHead>
      <button type="button" onClick={() => onClick(sortKey)} className="inline-flex items-center gap-1 hover:text-foreground">
        {label}
        <ArrowUpDown className={active === sortKey ? "h-3.5 w-3.5 text-primary" : "h-3.5 w-3.5 opacity-40"} />
      </button>
    </TableHead>
  );
}
