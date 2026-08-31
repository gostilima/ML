"use client";
import { useState } from "react";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useMiningCategories } from "@/hooks/use-mining";
import { cn } from "@/lib/utils";

export function CategoryCombobox({
  value,
  onChange,
}: {
  value?: string;
  onChange: (value: string | undefined) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const { data: categories, isLoading } = useMiningCategories(query);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" role="combobox" className="w-full justify-between font-normal">
          <span className={cn("truncate", !value && "text-muted-foreground")}>{value || "Todas as categorias"}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-2" align="start">
        <Input
          placeholder="Pesquisar categoria…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="mb-2"
          autoFocus
        />
        <div className="max-h-56 overflow-y-auto">
          <button
            type="button"
            className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm hover:bg-accent"
            onClick={() => {
              onChange(undefined);
              setOpen(false);
            }}
          >
            <Check className={cn("h-4 w-4", !value ? "opacity-100" : "opacity-0")} />
            Todas as categorias
          </button>
          {isLoading && (
            <div className="flex items-center justify-center py-4 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
            </div>
          )}
          {!isLoading && categories?.length === 0 && (
            <p className="px-2 py-3 text-sm text-muted-foreground">Nenhuma categoria encontrada.</p>
          )}
          {categories?.map((c) => (
            <button
              key={c.id}
              type="button"
              className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm hover:bg-accent"
              onClick={() => {
                onChange(c.name);
                setOpen(false);
              }}
            >
              <Check className={cn("h-4 w-4", value === c.name ? "opacity-100" : "opacity-0")} />
              {c.name}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
