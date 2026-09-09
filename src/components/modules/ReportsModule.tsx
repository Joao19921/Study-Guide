"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api-client";
import type { ReportSummary } from "@/types/api";

const DISTRIBUTION_COLORS = ["#ef806e", "#80aeca", "#70b8a6", "#e5b766", "#a89bd1"];

export function ReportsModule() {
  const [summary, setSummary] = useState<ReportSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch<ReportSummary>("/api/reports/summary")
      .then(setSummary)
      .catch(() => toast.error("Não foi possível carregar os relatórios"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="rounded-[20px] border border-[#e6e5df] bg-[#fffefa] p-10 text-center text-[12px] font-semibold text-[#9da8aa]">Carregando relatórios...</div>;
  if (!summary) return null;

  const maxMinutes = Math.max(...summary.last7Days.map((day) => day.minutes), 60);
  const totalDistribution = summary.distributionByTheme.reduce((total, item) => total + item.minutes, 0) || 1;

  return (
    <div className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
      <div className="rounded-[20px] border border-[#e6e5df] bg-[#fffefa] p-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="font-display text-[18px] font-bold text-[#193a5a]">Horas focadas</h2>
            <p className="mt-1 text-[11px] font-medium text-[#9aa5aa]">Últimos 7 dias</p>
          </div>
        </div>
        <div className="mt-8 flex h-[200px] items-end gap-2 border-b border-[#efeee8] px-2">
          {summary.last7Days.map((day) => (
            <div key={day.date} className="group flex flex-1 flex-col items-center justify-end gap-2">
              <div className="w-full max-w-[24px] shrink-0 rounded-t-[7px] bg-[#a9d2c7] transition group-hover:bg-[#ef806e]" style={{ height: `${Math.max((day.minutes / maxMinutes) * 180, 4)}px` }} />
              <span className="text-[9px] font-bold text-[#a9b2b2]">{new Date(day.date + "T00:00:00").getDate()}</span>
            </div>
          ))}
        </div>
        <div className="mt-5 flex items-end justify-between">
          <div>
            <span className="font-display text-[28px] font-bold tracking-[-0.06em] text-[#193a5a]">{Math.floor(summary.totalMinutesLast30Days / 60)}h{String(summary.totalMinutesLast30Days % 60).padStart(2, "0")}</span>
            <span className="ml-2 text-[10px] font-semibold text-[#70aa9c]">últimos 30 dias</span>
          </div>
        </div>
      </div>
      <div className="space-y-5">
        <div className="rounded-[20px] bg-[#193a5a] p-6 text-white">
          <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#91b7c8]">SEQUÊNCIA ATUAL</div>
          <div className="mt-4 flex items-end gap-3"><span className="font-display text-[40px] font-bold tracking-[-0.07em]">{summary.streakDays}</span><span className="mb-2 text-[10px] font-semibold text-[#a9c1cb]">dias seguidos com foco</span></div>
        </div>
        <div className="rounded-[20px] border border-[#e6e5df] bg-[#fffefa] p-6">
          <h2 className="font-display text-[17px] font-bold text-[#193a5a]">Onde você investe tempo</h2>
          {summary.distributionByTheme.length === 0 ? (
            <div className="mt-5 text-[11px] font-medium text-[#a7b0b1]">Registre sessões para ver a distribuição por tema.</div>
          ) : (
            <div className="mt-5 space-y-4">
              {summary.distributionByTheme.slice(0, 5).map((item, index) => {
                const percent = Math.round((item.minutes / totalDistribution) * 100);
                const color = DISTRIBUTION_COLORS[index % DISTRIBUTION_COLORS.length];
                return (
                  <div key={item.theme}>
                    <div className="flex justify-between text-[10px] font-bold text-[#788b93]"><span>{item.theme}</span><span>{percent}%</span></div>
                    <div className="mt-2 h-1.5 rounded-full bg-[#edf0ed]"><div className="h-full rounded-full" style={{ width: `${percent}%`, backgroundColor: color }} /></div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
