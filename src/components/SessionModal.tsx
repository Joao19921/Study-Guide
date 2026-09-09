"use client";

import { useState } from "react";
import { Check, Clock3, Timer, X } from "lucide-react";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api-client";
import type { ApiStudySession, ApiTheme } from "@/types/api";

export function SessionModal({
  themes,
  onClose,
  onCreated,
}: {
  themes: ApiTheme[];
  onClose: () => void;
  onCreated: (session: ApiStudySession) => void;
}) {
  const [themeId, setThemeId] = useState(themes[0]?.id ?? "");
  const [duration, setDuration] = useState(45);
  const [title, setTitle] = useState(themes[0]?.name ?? "Sessão de estudo");
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    setSaving(true);
    try {
      const created = await apiFetch<ApiStudySession>("/api/study_sessions", {
        method: "POST",
        body: JSON.stringify({ title, durationMinutes: duration, themeId: themeId || null }),
      });
      onCreated(created);
      onClose();
    } catch {
      toast.error("Falha ao registrar sessão");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#193a5a]/35 p-5 backdrop-blur-sm">
      <div className="w-full max-w-[420px] rounded-[22px] bg-[#fffefa] p-6 shadow-2xl">
        <div className="flex items-start justify-between">
          <div>
            <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-[12px] bg-[#e9f0f4] text-[#193a5a]"><Timer size={19} /></div>
            <h2 className="font-display text-[23px] font-bold tracking-[-0.045em] text-[#193a5a]">Registrar sessão</h2>
            <p className="mt-1 text-[12px] font-medium text-[#98a4a7]">Dê crédito ao tempo que você investiu.</p>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 text-[#9eabad] hover:bg-[#f1f0eb]"><X size={18} /></button>
        </div>
        <label className="mt-6 block text-[10px] font-bold uppercase tracking-[0.12em] text-[#8f9ca0]">Título</label>
        <input value={title} onChange={(event) => setTitle(event.target.value)} className="mt-2 w-full rounded-[11px] border border-[#e2e6e2] bg-white px-3 py-3 text-[12px] font-semibold text-[#45606d] outline-none focus:border-[#ef806e]" />
        <label className="mt-4 block text-[10px] font-bold uppercase tracking-[0.12em] text-[#8f9ca0]">Tema estudado</label>
        <select
          value={themeId}
          onChange={(event) => {
            setThemeId(event.target.value);
            const theme = themes.find((t) => t.id === event.target.value);
            if (theme) setTitle(theme.name);
          }}
          className="mt-2 w-full rounded-[11px] border border-[#e2e6e2] bg-white px-3 py-3 text-[12px] font-semibold text-[#45606d] outline-none focus:border-[#ef806e]"
        >
          <option value="">Sem tema específico</option>
          {themes.map((theme) => <option key={theme.id} value={theme.id}>{theme.name}</option>)}
        </select>
        <div className="mt-4">
          <label className="block text-[10px] font-bold uppercase tracking-[0.12em] text-[#8f9ca0]">Duração</label>
          <div className="mt-2 flex items-center gap-2 rounded-[11px] border border-[#e2e6e2] px-3 py-3">
            <Clock3 size={15} className="text-[#a4b0b0]" />
            <input type="number" min={1} value={duration} onChange={(event) => setDuration(Number(event.target.value) || 0)} className="w-full bg-transparent text-[12px] font-bold text-[#45606d] outline-none" />
            <span className="text-[11px] text-[#a4b0b0]">min</span>
          </div>
        </div>
        <button disabled={saving || duration <= 0} onClick={submit} className="mt-6 flex w-full items-center justify-center gap-2 rounded-[11px] bg-[#193a5a] py-3 text-[12px] font-bold text-white transition hover:bg-[#254f73] active:scale-[0.98] disabled:opacity-60">
          <Check size={15} /> {saving ? "Salvando..." : "Salvar sessão"}
        </button>
      </div>
    </div>
  );
}
