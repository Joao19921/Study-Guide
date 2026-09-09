"use client";

import { useEffect, useState } from "react";
import { ArrowUpRight, FolderOpen, Plus, X } from "lucide-react";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api-client";
import type { ApiCategory, ApiTheme } from "@/types/api";

const THEME_COLORS = ["#ef806e", "#80aeca", "#70b8a6", "#e5b766"];

function CreateThemeModal({ categories, onClose, onCreated }: { categories: ApiCategory[]; onClose: () => void; onCreated: (theme: ApiTheme) => void }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!name.trim()) {
      toast.error("Informe um nome para o tema");
      return;
    }
    setSaving(true);
    try {
      const created = await apiFetch<ApiTheme>("/api/themes", {
        method: "POST",
        body: JSON.stringify({ name, description: description || null, categoryId: categoryId || null }),
      });
      onCreated(created);
      onClose();
      toast.success("Tema criado");
    } catch {
      toast.error("Falha ao criar tema");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#193a5a]/35 p-5 backdrop-blur-sm">
      <div className="w-full max-w-[420px] rounded-[22px] bg-[#fffefa] p-6 shadow-2xl">
        <div className="flex items-start justify-between">
          <h2 className="font-display text-[21px] font-bold tracking-[-0.04em] text-[#193a5a]">Novo tema</h2>
          <button onClick={onClose} className="rounded-lg p-2 text-[#9eabad] hover:bg-[#f1f0eb]"><X size={18} /></button>
        </div>
        <label className="mt-5 block text-[10px] font-bold uppercase tracking-[0.12em] text-[#8f9ca0]">Nome</label>
        <input value={name} onChange={(event) => setName(event.target.value)} className="mt-2 w-full rounded-[11px] border border-[#e2e6e2] bg-white px-3 py-3 text-[12px] font-semibold text-[#45606d] outline-none focus:border-[#ef806e]" />
        <label className="mt-4 block text-[10px] font-bold uppercase tracking-[0.12em] text-[#8f9ca0]">Descrição</label>
        <textarea value={description} onChange={(event) => setDescription(event.target.value)} className="mt-2 w-full rounded-[11px] border border-[#e2e6e2] bg-white px-3 py-3 text-[12px] font-semibold text-[#45606d] outline-none focus:border-[#ef806e]" rows={2} />
        <label className="mt-4 block text-[10px] font-bold uppercase tracking-[0.12em] text-[#8f9ca0]">Categoria</label>
        <select value={categoryId} onChange={(event) => setCategoryId(event.target.value)} className="mt-2 w-full rounded-[11px] border border-[#e2e6e2] bg-white px-3 py-3 text-[12px] font-semibold text-[#45606d] outline-none">
          <option value="">Sem categoria</option>
          {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
        </select>
        <button disabled={saving} onClick={submit} className="mt-6 flex w-full items-center justify-center gap-2 rounded-[11px] bg-[#193a5a] py-3 text-[12px] font-bold text-white transition hover:bg-[#254f73] disabled:opacity-60">
          {saving ? "Salvando..." : "Criar tema"}
        </button>
      </div>
    </div>
  );
}

export function ThemesModule() {
  const [themes, setThemes] = useState<ApiTheme[]>([]);
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([apiFetch<ApiTheme[]>("/api/themes"), apiFetch<ApiCategory[]>("/api/categories")])
      .then(([themeRows, categoryRows]) => {
        setThemes(themeRows);
        setCategories(categoryRows);
      })
      .catch(() => toast.error("Não foi possível carregar os temas"))
      .finally(() => setLoading(false));
  }, []);

  const categoryName = (categoryId: string | null) => categories.find((category) => category.id === categoryId)?.name ?? "Sem categoria";

  return (
    <>
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="font-display text-[18px] font-bold tracking-[-0.035em] text-[#193a5a]">Suas competências</h2>
          <p className="mt-1 text-[11px] font-medium text-[#9aa5aa]">{themes.length} tema(s) cadastrado(s)</p>
        </div>
        <button onClick={() => setModalOpen(true)} className="flex items-center gap-2 rounded-[12px] bg-[#ef806e] px-4 py-2.5 text-[12px] font-bold text-white hover:bg-[#dd6d5f]"><Plus size={15} /> Novo tema</button>
      </div>
      {loading ? (
        <div className="py-12 text-center text-[12px] font-semibold text-[#9da8aa]">Carregando temas...</div>
      ) : themes.length === 0 ? (
        <div className="py-12 text-center text-[12px] font-semibold text-[#9da8aa]">Nenhum tema cadastrado ainda.</div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {themes.map((theme, index) => {
            const color = THEME_COLORS[index % THEME_COLORS.length];
            return (
              <div key={theme.id} className="rounded-[16px] border border-[#eeece6] p-5 transition hover:-translate-y-0.5 hover:shadow-md">
                <div className="flex items-start justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-[12px]" style={{ backgroundColor: `${color}20`, color }}><FolderOpen size={18} /></div>
                  <ArrowUpRight size={16} className="text-[#aab4b3]" />
                </div>
                <h3 className="mt-5 font-display text-[17px] font-bold tracking-[-0.035em] text-[#193a5a]">{theme.name}</h3>
                <p className="mt-1 text-[11px] font-medium text-[#99a5a7]">{theme.description || categoryName(theme.categoryId)}</p>
                <div className="mt-5 flex items-center justify-between text-[10px] font-bold text-[#9ca7a8]"><span>{categoryName(theme.categoryId)}</span><span>{theme.progress}%</span></div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#eef0ed]"><div className="h-full rounded-full" style={{ width: `${theme.progress}%`, backgroundColor: color }} /></div>
              </div>
            );
          })}
        </div>
      )}
      {modalOpen && <CreateThemeModal categories={categories} onClose={() => setModalOpen(false)} onCreated={(theme) => setThemes((prev) => [theme, ...prev])} />}
    </>
  );
}
