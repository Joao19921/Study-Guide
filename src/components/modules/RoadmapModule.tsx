"use client";

import { useEffect, useState } from "react";
import { Check, Trophy } from "lucide-react";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api-client";
import type { ApiCertification } from "@/types/api";

export function RoadmapModule() {
  const [certifications, setCertifications] = useState<ApiCertification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch<ApiCertification[]>("/api/certifications")
      .then((rows) =>
        setCertifications(
          [...rows].sort((a, b) => {
            if (!a.examDate) return 1;
            if (!b.examDate) return -1;
            return new Date(a.examDate).getTime() - new Date(b.examDate).getTime();
          })
        )
      )
      .catch(() => toast.error("Não foi possível carregar o roadmap"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="rounded-[20px] border border-[#e6e5df] bg-[#fffefa] p-10 text-center text-[12px] font-semibold text-[#9da8aa]">Carregando roadmap...</div>;

  if (certifications.length === 0) {
    return <div className="rounded-[20px] border border-[#e6e5df] bg-[#fffefa] p-10 text-center text-[12px] font-semibold text-[#9da8aa]">Cadastre certificações e relacione temas para montar seu roadmap.</div>;
  }

  return (
    <div className="rounded-[20px] border border-[#e6e5df] bg-[#fffefa] p-6">
      <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-4">
        {certifications.map((certification, index) => (
          <div key={certification.id} className="relative rounded-[16px] bg-[#fbfaf7] p-5">
            <div className="flex items-center justify-between">
              <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${index === 0 ? "bg-[#fff0e8] text-[#ef806e]" : "bg-[#e9f0f4] text-[#80aeca]"}`}>{certification.examDate ? new Date(certification.examDate).toLocaleDateString("pt-BR", { month: "short", year: "numeric" }) : "Sem data"}</span>
              {index === 0 && <span className="h-2 w-2 rounded-full bg-[#ef806e]" />}
            </div>
            <h3 className="mt-5 flex items-center gap-2 font-display text-[16px] font-bold text-[#193a5a]"><Trophy size={15} className="text-[#e5b766]" /> {certification.name}</h3>
            <div className="mt-1 text-[10px] font-bold text-[#9ca7a8]">{certification.progress}% concluído</div>
            <div className="mt-3 space-y-3">
              {certification.themes.length === 0 && <div className="text-[11px] font-medium text-[#a7b0b1]">Nenhum tema relacionado ainda</div>}
              {certification.themes.map((theme) => (
                <div key={theme.id} className="flex items-center gap-2 text-[11px] font-semibold text-[#7d8d94]">
                  <span className={`flex h-4 w-4 items-center justify-center rounded-full ${theme.progress >= 100 ? "bg-[#70b8a6] text-white" : "border border-[#d7dfdc]"}`}>{theme.progress >= 100 ? <Check size={10} /> : null}</span>
                  {theme.name} <span className="text-[#aab4b5]">· {theme.progress}%</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
