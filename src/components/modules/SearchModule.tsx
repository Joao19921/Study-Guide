"use client";

import { useDeferredValue, useEffect, useState } from "react";
import { BookOpen, ChevronRight, FileText, FolderOpen, Search, Trophy } from "lucide-react";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api-client";
import type { SearchResult } from "@/types/api";

const TYPE_ICON: Record<SearchResult["type"], typeof Search> = {
  tema: FolderOpen,
  tarefa: FileText,
  material: BookOpen,
  certificacao: Trophy,
};

const TYPE_LABEL: Record<SearchResult["type"], string> = {
  tema: "Tema",
  tarefa: "Tarefa",
  material: "Material",
  certificacao: "Certificação",
};

export function SearchModule({ initialQuery = "" }: { initialQuery?: string }) {
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<SearchResult[]>([]);

  const trimmedQuery = query.trim();
  // Debounces the query via React's own scheduling instead of a manual timer.
  const deferredQuery = useDeferredValue(trimmedQuery);
  const loading = trimmedQuery !== deferredQuery;

  useEffect(() => {
    if (!deferredQuery) return;
    let cancelled = false;
    apiFetch<SearchResult[]>(`/api/search?q=${encodeURIComponent(deferredQuery)}`)
      .then((data) => {
        if (!cancelled) setResults(data);
      })
      .catch(() => {
        if (!cancelled) toast.error("Falha na busca");
      });
    return () => {
      cancelled = true;
    };
  }, [deferredQuery]);

  const visibleResults = deferredQuery ? results : [];

  return (
    <div className="rounded-[20px] border border-[#e6e5df] bg-[#fffefa] p-6">
      <div className="flex max-w-[680px] items-center gap-3 rounded-[13px] border border-[#e0e6e2] bg-white px-4 py-3 focus-within:border-[#ef806e]">
        <Search size={18} className="text-[#9eabad]" />
        <input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Digite para buscar no StudyHub..." className="w-full bg-transparent text-[13px] font-semibold text-[#45606d] outline-none placeholder:text-[#b2bcbd]" />
      </div>
      <div className="mt-7 flex items-center justify-between">
        <h2 className="font-display text-[18px] font-bold text-[#193a5a]">{trimmedQuery ? "Resultados encontrados" : "Digite para buscar"}</h2>
        {trimmedQuery && <span className="text-[10px] font-bold text-[#a0abad]">{visibleResults.length} itens</span>}
      </div>
      {loading && <div className="mt-4 text-[12px] font-semibold text-[#9da8aa]">Buscando...</div>}
      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {visibleResults.map((result) => {
          const Icon = TYPE_ICON[result.type];
          return (
            <div key={`${result.type}-${result.id}`} className="group flex items-center gap-3 rounded-[13px] border border-[#f0efe9] p-4 text-left transition hover:-translate-y-0.5 hover:bg-[#fbfaf7] hover:shadow-sm">
              <div className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-[#e9f0f4] text-[#80aeca]"><Icon size={15} /></div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-[12px] font-bold text-[#506773]">{result.title}</div>
                <div className="mt-1 text-[10px] font-medium text-[#a0abad]">{TYPE_LABEL[result.type]}</div>
              </div>
              <ChevronRight size={15} className="text-[#b2bbba] transition group-hover:translate-x-1" />
            </div>
          );
        })}
      </div>
      {trimmedQuery && !loading && visibleResults.length === 0 && <div className="py-12 text-center text-[12px] font-semibold text-[#9da8aa]">Nenhum resultado encontrado. Tente outro termo.</div>}
    </div>
  );
}
