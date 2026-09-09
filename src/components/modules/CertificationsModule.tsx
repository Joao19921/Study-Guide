"use client";

import { useEffect, useState } from "react";
import { Plus, Trophy, X } from "lucide-react";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api-client";
import type { ApiCertification, ApiTheme } from "@/types/api";

function CreateCertificationModal({ onClose, onCreated }: { onClose: () => void; onCreated: (certification: ApiCertification) => void }) {
  const [name, setName] = useState("");
  const [provider, setProvider] = useState("");
  const [examDate, setExamDate] = useState("");
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!name.trim()) {
      toast.error("Informe o nome da certificação");
      return;
    }
    setSaving(true);
    try {
      const created = await apiFetch<ApiCertification>("/api/certifications", {
        method: "POST",
        body: JSON.stringify({ name, provider: provider || null, examDate: examDate || null }),
      });
      onCreated({ ...created, themes: [] });
      onClose();
      toast.success("Certificação criada");
    } catch {
      toast.error("Falha ao criar certificação");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#193a5a]/35 p-5 backdrop-blur-sm">
      <div className="w-full max-w-[420px] rounded-[22px] bg-[#fffefa] p-6 shadow-2xl">
        <div className="flex items-start justify-between">
          <h2 className="font-display text-[21px] font-bold tracking-[-0.04em] text-[#193a5a]">Nova certificação</h2>
          <button onClick={onClose} className="rounded-lg p-2 text-[#9eabad] hover:bg-[#f1f0eb]"><X size={18} /></button>
        </div>
        <label className="mt-5 block text-[10px] font-bold uppercase tracking-[0.12em] text-[#8f9ca0]">Nome</label>
        <input value={name} onChange={(event) => setName(event.target.value)} className="mt-2 w-full rounded-[11px] border border-[#e2e6e2] bg-white px-3 py-3 text-[12px] font-semibold text-[#45606d] outline-none focus:border-[#ef806e]" />
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-[0.12em] text-[#8f9ca0]">Fornecedor</label>
            <input value={provider} onChange={(event) => setProvider(event.target.value)} placeholder="AWS, Google..." className="mt-2 w-full rounded-[11px] border border-[#e2e6e2] bg-white px-3 py-3 text-[12px] font-semibold text-[#45606d] outline-none" />
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-[0.12em] text-[#8f9ca0]">Data do exame</label>
            <input type="date" value={examDate} onChange={(event) => setExamDate(event.target.value)} className="mt-2 w-full rounded-[11px] border border-[#e2e6e2] bg-white px-3 py-3 text-[12px] font-semibold text-[#45606d] outline-none" />
          </div>
        </div>
        <button disabled={saving} onClick={submit} className="mt-6 flex w-full items-center justify-center gap-2 rounded-[11px] bg-[#193a5a] py-3 text-[12px] font-bold text-white transition hover:bg-[#254f73] disabled:opacity-60">
          {saving ? "Salvando..." : "Criar certificação"}
        </button>
      </div>
    </div>
  );
}

function CertificationCard({ certification, allThemes, onLinkTheme }: { certification: ApiCertification; allThemes: ApiTheme[]; onLinkTheme: (certificationId: string, themeId: string) => void }) {
  const [themeToLink, setThemeToLink] = useState("");
  const linkableThemes = allThemes.filter((theme) => !certification.themes.some((t) => t.id === theme.id));

  return (
    <div className="rounded-[16px] border border-[#f0efe9] p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-[#e9f0f4] text-[#193a5a]"><Trophy size={16} /></div>
          <div>
            <div className="text-[12px] font-bold text-[#506773]">{certification.name}</div>
            <div className="text-[10px] font-medium text-[#a0abad]">{certification.provider ?? "—"} {certification.examDate ? `· exame em ${new Date(certification.examDate).toLocaleDateString("pt-BR")}` : ""}</div>
          </div>
        </div>
        <span className="text-[12px] font-bold text-[#70aa9c]">{certification.progress}%</span>
      </div>
      <div className="mt-3 h-1.5 rounded-full bg-[#edf0ed]"><div className="h-full rounded-full bg-[#70b8a6]" style={{ width: `${certification.progress}%` }} /></div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {certification.themes.map((theme) => (
          <span key={theme.id} className="rounded-full bg-[#f5f5f0] px-2.5 py-1 text-[10px] font-semibold text-[#819097]">{theme.name} · {theme.progress}%</span>
        ))}
      </div>
      {linkableThemes.length > 0 && (
        <div className="mt-3 flex items-center gap-2">
          <select value={themeToLink} onChange={(event) => setThemeToLink(event.target.value)} className="flex-1 rounded-[10px] border border-[#e2e6e2] bg-white px-2 py-2 text-[11px] font-semibold text-[#45606d] outline-none">
            <option value="">Relacionar tema...</option>
            {linkableThemes.map((theme) => <option key={theme.id} value={theme.id}>{theme.name}</option>)}
          </select>
          <button
            disabled={!themeToLink}
            onClick={() => {
              onLinkTheme(certification.id, themeToLink);
              setThemeToLink("");
            }}
            className="rounded-[10px] bg-[#193a5a] px-3 py-2 text-[10px] font-bold text-white disabled:opacity-40"
          >
            Vincular
          </button>
        </div>
      )}
    </div>
  );
}

export function CertificationsModule() {
  const [certifications, setCertifications] = useState<ApiCertification[]>([]);
  const [themes, setThemes] = useState<ApiTheme[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([apiFetch<ApiCertification[]>("/api/certifications"), apiFetch<ApiTheme[]>("/api/themes")])
      .then(([certificationRows, themeRows]) => {
        setCertifications(certificationRows);
        setThemes(themeRows);
      })
      .catch(() => toast.error("Não foi possível carregar as certificações"))
      .finally(() => setLoading(false));
  }, []);

  const linkTheme = async (certificationId: string, themeId: string) => {
    try {
      const linkedThemes = await apiFetch<{ id: string; name: string; progress: number }[]>(`/api/certifications/${certificationId}/themes`, {
        method: "POST",
        body: JSON.stringify({ themeId }),
      });
      setCertifications((prev) => prev.map((c) => (c.id === certificationId ? { ...c, themes: linkedThemes } : c)));
      toast.success("Tema relacionado à certificação");
    } catch {
      toast.error("Falha ao relacionar tema");
    }
  };

  return (
    <>
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="font-display text-[18px] font-bold tracking-[-0.035em] text-[#193a5a]">Certificações em foco</h2>
          <p className="mt-1 text-[11px] font-medium text-[#9aa5aa]">Relacione temas para calcular o progresso automaticamente</p>
        </div>
        <button onClick={() => setModalOpen(true)} className="flex items-center gap-2 rounded-[12px] bg-[#ef806e] px-4 py-2.5 text-[12px] font-bold text-white hover:bg-[#dd6d5f]"><Plus size={15} /> Nova certificação</button>
      </div>
      {loading ? (
        <div className="py-12 text-center text-[12px] font-semibold text-[#9da8aa]">Carregando certificações...</div>
      ) : certifications.length === 0 ? (
        <div className="py-12 text-center text-[12px] font-semibold text-[#9da8aa]">Nenhuma certificação planejada ainda.</div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {certifications.map((certification) => (
            <CertificationCard key={certification.id} certification={certification} allThemes={themes} onLinkTheme={linkTheme} />
          ))}
        </div>
      )}
      {modalOpen && <CreateCertificationModal onClose={() => setModalOpen(false)} onCreated={(certification) => setCertifications((prev) => [certification, ...prev])} />}
    </>
  );
}
