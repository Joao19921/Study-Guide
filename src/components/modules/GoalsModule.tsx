"use client";

import { useEffect, useState } from "react";
import { Check, MoreHorizontal, Plus, Target, X } from "lucide-react";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api-client";
import { goalPeriods } from "@/validations/goal";
import type { ApiGoal } from "@/types/api";

const PERIOD_LABEL: Record<string, string> = { weekly: "Meta semanal", monthly: "Meta mensal", quarterly: "Meta trimestral", yearly: "Meta anual" };

function CreateGoalModal({ onClose, onCreated }: { onClose: () => void; onCreated: (goal: ApiGoal) => void }) {
  const [title, setTitle] = useState("");
  const [period, setPeriod] = useState<(typeof goalPeriods)[number]>("weekly");
  const [targetHours, setTargetHours] = useState<number | "">("");
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!title.trim()) {
      toast.error("Informe um título para a meta");
      return;
    }
    setSaving(true);
    try {
      const created = await apiFetch<ApiGoal>("/api/goals", {
        method: "POST",
        body: JSON.stringify({ title, period, targetHours: targetHours === "" ? null : targetHours }),
      });
      onCreated(created);
      onClose();
      toast.success("Meta criada");
    } catch {
      toast.error("Falha ao criar meta");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#193a5a]/35 p-5 backdrop-blur-sm">
      <div className="w-full max-w-[420px] rounded-[22px] bg-[#fffefa] p-6 shadow-2xl">
        <div className="flex items-start justify-between">
          <h2 className="font-display text-[21px] font-bold tracking-[-0.04em] text-[#193a5a]">Nova meta</h2>
          <button onClick={onClose} className="rounded-lg p-2 text-[#9eabad] hover:bg-[#f1f0eb]"><X size={18} /></button>
        </div>
        <label className="mt-5 block text-[10px] font-bold uppercase tracking-[0.12em] text-[#8f9ca0]">Título</label>
        <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Ex: Estudar 12 horas esta semana" className="mt-2 w-full rounded-[11px] border border-[#e2e6e2] bg-white px-3 py-3 text-[12px] font-semibold text-[#45606d] outline-none focus:border-[#ef806e]" />
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-[0.12em] text-[#8f9ca0]">Período</label>
            <select value={period} onChange={(event) => setPeriod(event.target.value as typeof period)} className="mt-2 w-full rounded-[11px] border border-[#e2e6e2] bg-white px-3 py-3 text-[12px] font-semibold text-[#45606d] outline-none">
              {goalPeriods.map((option) => <option key={option} value={option}>{PERIOD_LABEL[option]}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-[0.12em] text-[#8f9ca0]">Meta de horas</label>
            <input type="number" min={0} value={targetHours} onChange={(event) => setTargetHours(event.target.value === "" ? "" : Number(event.target.value))} placeholder="opcional" className="mt-2 w-full rounded-[11px] border border-[#e2e6e2] bg-white px-3 py-3 text-[12px] font-semibold text-[#45606d] outline-none" />
          </div>
        </div>
        <button disabled={saving} onClick={submit} className="mt-6 flex w-full items-center justify-center gap-2 rounded-[11px] bg-[#193a5a] py-3 text-[12px] font-bold text-white transition hover:bg-[#254f73] disabled:opacity-60">
          {saving ? "Salvando..." : "Criar meta"}
        </button>
      </div>
    </div>
  );
}

export function GoalsModule() {
  const [goals, setGoals] = useState<ApiGoal[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch<ApiGoal[]>("/api/goals")
      .then(setGoals)
      .catch(() => toast.error("Não foi possível carregar as metas"))
      .finally(() => setLoading(false));
  }, []);

  const remove = async (id: string) => {
    try {
      await apiFetch(`/api/goals/${id}`, { method: "DELETE" });
      setGoals((prev) => prev.filter((goal) => goal.id !== id));
    } catch {
      toast.error("Falha ao remover meta");
    }
  };

  return (
    <>
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="font-display text-[18px] font-bold tracking-[-0.035em] text-[#193a5a]">Suas metas</h2>
          <p className="mt-1 text-[11px] font-medium text-[#9aa5aa]">Progresso calculado a partir das horas estudadas</p>
        </div>
        <button onClick={() => setModalOpen(true)} className="flex items-center gap-2 rounded-[12px] bg-[#ef806e] px-4 py-2.5 text-[12px] font-bold text-white hover:bg-[#dd6d5f]"><Plus size={15} /> Nova meta</button>
      </div>
      {loading ? (
        <div className="py-12 text-center text-[12px] font-semibold text-[#9da8aa]">Carregando metas...</div>
      ) : goals.length === 0 ? (
        <div className="py-12 text-center text-[12px] font-semibold text-[#9da8aa]">Nenhuma meta cadastrada ainda.</div>
      ) : (
        <div className="mt-2 space-y-2">
          {goals.map((goal) => (
            <div key={goal.id} className="flex items-center gap-4 rounded-[13px] border border-[#f0efe9] px-3 py-3 transition hover:bg-[#fbfaf7]">
              <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${goal.progress >= 100 ? "bg-[#70b8a6] text-white" : "bg-[#e9f0f4] text-[#80aeca]"}`}>{goal.progress >= 100 ? <Check size={16} strokeWidth={3} /> : <Target size={16} />}</div>
              <div className="min-w-0 flex-1">
                <div className="text-[12px] font-bold text-[#506773]">{goal.title}</div>
                <div className="mt-1 text-[10px] font-medium text-[#a0abad]">
                  {PERIOD_LABEL[goal.period]}
                  {goal.targetHours ? ` · meta de ${goal.targetHours}h · ${Math.round(goal.minutesLogged / 60)}h estudadas` : ""}
                  {goal.dueDate ? ` · vence em ${new Date(goal.dueDate).toLocaleDateString("pt-BR")}` : ""}
                </div>
                <div className="mt-2 h-1.5 w-full max-w-[220px] overflow-hidden rounded-full bg-[#edf0ed]"><div className="h-full rounded-full bg-[#70b8a6]" style={{ width: `${goal.progress}%` }} /></div>
              </div>
              <div className="text-[12px] font-bold text-[#70aa9c]">{goal.progress}%</div>
              <button onClick={() => remove(goal.id)} className="text-[#b4bcba] hover:text-[#ef806e]"><MoreHorizontal size={16} /></button>
            </div>
          ))}
        </div>
      )}
      {modalOpen && <CreateGoalModal onClose={() => setModalOpen(false)} onCreated={(goal) => setGoals((prev) => [goal, ...prev])} />}
    </>
  );
}
