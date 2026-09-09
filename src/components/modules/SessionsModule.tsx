"use client";

import { useEffect, useState } from "react";
import { Clock3, MoreHorizontal, Plus } from "lucide-react";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api-client";
import { SessionModal } from "@/components/SessionModal";
import type { ApiStudySession, ApiTheme } from "@/types/api";

export function SessionsModule() {
  const [sessions, setSessions] = useState<ApiStudySession[]>([]);
  const [themes, setThemes] = useState<ApiTheme[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([apiFetch<ApiStudySession[]>("/api/study_sessions"), apiFetch<ApiTheme[]>("/api/themes")])
      .then(([sessionRows, themeRows]) => {
        setSessions(sessionRows.sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime()));
        setThemes(themeRows);
      })
      .catch(() => toast.error("Não foi possível carregar as sessões"))
      .finally(() => setLoading(false));
  }, []);

  const themeName = (themeId: string | null) => themes.find((theme) => theme.id === themeId)?.name ?? "Sem tema";
  const totalMinutes = sessions.reduce((total, session) => total + session.durationMinutes, 0);

  const remove = async (id: string) => {
    try {
      await apiFetch(`/api/study_sessions/${id}`, { method: "DELETE" });
      setSessions((prev) => prev.filter((session) => session.id !== id));
    } catch {
      toast.error("Falha ao remover sessão");
    }
  };

  return (
    <>
      <div className="mb-5 grid gap-4 sm:grid-cols-3">
        <div className="rounded-[18px] border border-[#e6e5df] bg-[#fffefa] p-5">
          <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-[11px] bg-[#e6f1ef] text-[#70aa9c]"><Clock3 size={16} /></div>
          <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#9aa5aa]">Horas registradas</div>
          <div className="mt-1 font-display text-[27px] font-bold tracking-[-0.06em] text-[#193a5a]">{Math.floor(totalMinutes / 60)}h{String(totalMinutes % 60).padStart(2, "0")}</div>
        </div>
      </div>
      <div className="rounded-[20px] border border-[#e6e5df] bg-[#fffefa] p-5 shadow-[0_5px_20px_rgba(36,50,58,0.035)] sm:p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-[18px] font-bold tracking-[-0.035em] text-[#193a5a]">Atividade recente</h2>
            <p className="mt-1 text-[11px] font-medium text-[#9aa5aa]">{sessions.length} sessão(ões) registrada(s)</p>
          </div>
          <button onClick={() => setModalOpen(true)} className="flex items-center gap-2 rounded-[12px] bg-[#ef806e] px-4 py-2.5 text-[12px] font-bold text-white hover:bg-[#dd6d5f]"><Plus size={15} /> Registrar sessão</button>
        </div>
        {loading ? (
          <div className="py-12 text-center text-[12px] font-semibold text-[#9da8aa]">Carregando sessões...</div>
        ) : sessions.length === 0 ? (
          <div className="py-12 text-center text-[12px] font-semibold text-[#9da8aa]">Nenhuma sessão registrada ainda.</div>
        ) : (
          <div className="mt-6 space-y-2">
            {sessions.map((session) => (
              <div key={session.id} className="flex items-center gap-4 rounded-[13px] border border-[#f0efe9] px-3 py-3 transition hover:bg-[#fbfaf7]">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#e9f0f4] text-[#80aeca]"><Clock3 size={16} /></div>
                <div className="min-w-0 flex-1">
                  <div className="text-[12px] font-bold text-[#506773]">{session.title}</div>
                  <div className="mt-1 text-[10px] font-medium text-[#a0abad]">{new Date(session.occurredAt).toLocaleDateString("pt-BR")} · {session.durationMinutes} min · {themeName(session.themeId)}</div>
                </div>
                <div className="text-[12px] font-bold text-[#70aa9c]">+{session.durationMinutes}m</div>
                <button onClick={() => remove(session.id)} className="text-[#b4bcba] hover:text-[#ef806e]"><MoreHorizontal size={16} /></button>
              </div>
            ))}
          </div>
        )}
      </div>
      {modalOpen && (
        <SessionModal
          themes={themes}
          onClose={() => setModalOpen(false)}
          onCreated={(session) => {
            setSessions((prev) => [session, ...prev]);
            toast.success("Sessão registrada!");
          }}
        />
      )}
    </>
  );
}
