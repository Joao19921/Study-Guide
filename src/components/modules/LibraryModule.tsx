"use client";

import { useEffect, useMemo, useState } from "react";
import { FileText, MoreHorizontal, Plus, Search, X } from "lucide-react";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api-client";
import { resourceTypes } from "@/validations/resource";
import type { ApiResource, ApiTheme } from "@/types/api";

const STATUS_LABEL: Record<string, string> = { nao_iniciado: "Não iniciado", em_andamento: "Em andamento", concluido: "Concluído" };

function CreateResourceModal({ themes, onClose, onCreated }: { themes: ApiTheme[]; onClose: () => void; onCreated: (resource: ApiResource) => void }) {
  const [title, setTitle] = useState("");
  const [type, setType] = useState<(typeof resourceTypes)[number]>("link");
  const [url, setUrl] = useState("");
  const [themeId, setThemeId] = useState("");
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!title.trim()) {
      toast.error("Informe um título para o material");
      return;
    }
    setSaving(true);
    try {
      const created = await apiFetch<ApiResource>("/api/resources", {
        method: "POST",
        body: JSON.stringify({ title, type, url: url || null, themeId: themeId || null }),
      });
      onCreated(created);
      onClose();
      toast.success("Material adicionado");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Falha ao adicionar material");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#193a5a]/35 p-5 backdrop-blur-sm">
      <div className="w-full max-w-[420px] rounded-[22px] bg-[#fffefa] p-6 shadow-2xl">
        <div className="flex items-start justify-between">
          <h2 className="font-display text-[21px] font-bold tracking-[-0.04em] text-[#193a5a]">Adicionar recurso</h2>
          <button onClick={onClose} className="rounded-lg p-2 text-[#9eabad] hover:bg-[#f1f0eb]"><X size={18} /></button>
        </div>
        <label className="mt-5 block text-[10px] font-bold uppercase tracking-[0.12em] text-[#8f9ca0]">Título</label>
        <input value={title} onChange={(event) => setTitle(event.target.value)} className="mt-2 w-full rounded-[11px] border border-[#e2e6e2] bg-white px-3 py-3 text-[12px] font-semibold text-[#45606d] outline-none focus:border-[#ef806e]" />
        <label className="mt-4 block text-[10px] font-bold uppercase tracking-[0.12em] text-[#8f9ca0]">Link (opcional)</label>
        <input value={url} onChange={(event) => setUrl(event.target.value)} placeholder="https://..." className="mt-2 w-full rounded-[11px] border border-[#e2e6e2] bg-white px-3 py-3 text-[12px] font-semibold text-[#45606d] outline-none focus:border-[#ef806e]" />
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-[0.12em] text-[#8f9ca0]">Tipo</label>
            <select value={type} onChange={(event) => setType(event.target.value as typeof type)} className="mt-2 w-full rounded-[11px] border border-[#e2e6e2] bg-white px-3 py-3 text-[12px] font-semibold text-[#45606d] outline-none">
              {resourceTypes.map((option) => <option key={option} value={option}>{option}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-[0.12em] text-[#8f9ca0]">Tema</label>
            <select value={themeId} onChange={(event) => setThemeId(event.target.value)} className="mt-2 w-full rounded-[11px] border border-[#e2e6e2] bg-white px-3 py-3 text-[12px] font-semibold text-[#45606d] outline-none">
              <option value="">Nenhum</option>
              {themes.map((theme) => <option key={theme.id} value={theme.id}>{theme.name}</option>)}
            </select>
          </div>
        </div>
        <button disabled={saving} onClick={submit} className="mt-6 flex w-full items-center justify-center gap-2 rounded-[11px] bg-[#193a5a] py-3 text-[12px] font-bold text-white transition hover:bg-[#254f73] disabled:opacity-60">
          {saving ? "Salvando..." : "Adicionar material"}
        </button>
      </div>
    </div>
  );
}

export function LibraryModule() {
  const [resources, setResources] = useState<ApiResource[]>([]);
  const [themes, setThemes] = useState<ApiTheme[]>([]);
  const [query, setQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([apiFetch<ApiResource[]>("/api/resources"), apiFetch<ApiTheme[]>("/api/themes")])
      .then(([resourceRows, themeRows]) => {
        setResources(resourceRows);
        setThemes(themeRows);
      })
      .catch(() => toast.error("Não foi possível carregar a biblioteca"))
      .finally(() => setLoading(false));
  }, []);

  const themeNameById = useMemo(() => new Map(themes.map((theme) => [theme.id, theme.name])), [themes]);
  const themeName = (themeId: string | null) => (themeId ? (themeNameById.get(themeId) ?? "Geral") : "Geral");

  const filtered = useMemo(() => {
    const lowerQuery = query.toLowerCase();
    return resources.filter((resource) => {
      const themeLabel = resource.themeId ? (themeNameById.get(resource.themeId) ?? "Geral") : "Geral";
      return `${resource.title} ${themeLabel}`.toLowerCase().includes(lowerQuery);
    });
  }, [resources, query, themeNameById]);

  const advanceStatus = async (resource: ApiResource) => {
    const nextStatus = resource.status === "nao_iniciado" ? "em_andamento" : resource.status === "em_andamento" ? "concluido" : "nao_iniciado";
    const nextProgress = nextStatus === "concluido" ? 100 : nextStatus === "nao_iniciado" ? 0 : Math.max(resource.progress, 25);
    try {
      const updated = await apiFetch<ApiResource>(`/api/resources/${resource.id}`, {
        method: "PATCH",
        body: JSON.stringify({ status: nextStatus, progress: nextProgress }),
      });
      setResources((prev) => prev.map((r) => (r.id === resource.id ? updated : r)));
    } catch {
      toast.error("Falha ao atualizar material");
    }
  };

  return (
    <>
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <h2 className="font-display text-[18px] font-bold tracking-[-0.035em] text-[#193a5a]">Materiais salvos</h2>
          <p className="mt-1 text-[11px] font-medium text-[#9aa5aa]">{resources.length} recurso(s) na biblioteca</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 rounded-xl border border-[#e2e6e2] bg-white px-3 py-2">
            <Search size={15} className="text-[#a5b0b1]" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar recurso" className="w-[150px] bg-transparent text-[11px] font-semibold outline-none placeholder:text-[#b1bcbd]" />
          </div>
          <button onClick={() => setModalOpen(true)} className="flex items-center gap-2 rounded-[12px] bg-[#ef806e] px-4 py-2.5 text-[12px] font-bold text-white hover:bg-[#dd6d5f]"><Plus size={15} /> Adicionar recurso</button>
        </div>
      </div>
      {loading ? (
        <div className="py-12 text-center text-[12px] font-semibold text-[#9da8aa]">Carregando biblioteca...</div>
      ) : filtered.length === 0 ? (
        <div className="py-12 text-center text-[12px] font-semibold text-[#9da8aa]">Nenhum material encontrado.</div>
      ) : (
        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[650px] border-collapse">
            <thead>
              <tr className="border-b border-[#efeee8] text-left text-[10px] font-bold uppercase tracking-[0.1em] text-[#a4adae]">
                <th className="pb-3 pl-2">Recurso</th><th className="pb-3">Tipo</th><th className="pb-3">Tema</th><th className="pb-3">Status</th><th className="pb-3">Progresso</th><th />
              </tr>
            </thead>
            <tbody>
              {filtered.map((resource) => (
                <tr key={resource.id} className="group border-b border-[#f3f2ed] text-[12px] font-semibold text-[#516773] last:border-0 hover:bg-[#fbfaf7]">
                  <td className="py-4 pl-2">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-[9px] bg-[#e9f0f4] text-[#80aeca]"><FileText size={15} /></div>
                      {resource.url ? <a href={resource.url} target="_blank" rel="noreferrer" className="hover:underline">{resource.title}</a> : resource.title}
                    </div>
                  </td>
                  <td className="py-4 text-[#91a0a4]">{resource.type}</td>
                  <td className="py-4"><span className="rounded-full bg-[#f5f5f0] px-2.5 py-1 text-[10px] text-[#819097]">{themeName(resource.themeId)}</span></td>
                  <td className="py-4">
                    <button onClick={() => advanceStatus(resource)} className={`flex items-center gap-1.5 text-[10px] ${resource.status === "nao_iniciado" ? "text-[#a8b1b1]" : "text-[#70aa9c]"}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${resource.status === "nao_iniciado" ? "bg-[#c5ccca]" : "bg-[#70b8a6]"}`} />{STATUS_LABEL[resource.status]}
                    </button>
                  </td>
                  <td className="py-4">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-[56px] overflow-hidden rounded-full bg-[#edf0ed]"><div className="h-full rounded-full bg-[#70b8a6]" style={{ width: `${resource.progress}%` }} /></div>
                      <span className="text-[10px] text-[#9aa5a8]">{resource.progress}%</span>
                    </div>
                  </td>
                  <td className="py-4"><MoreHorizontal size={16} className="text-[#b2bbba]" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {modalOpen && <CreateResourceModal themes={themes} onClose={() => setModalOpen(false)} onCreated={(resource) => setResources((prev) => [resource, ...prev])} />}
    </>
  );
}
