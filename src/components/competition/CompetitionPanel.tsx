"use client";

import { useEffect, useState } from "react";

type Season = { id: string; name: string; startsAt: string; endsAt: string; status: string };
type Result = {
  userId: string;
  userName?: string | null;
  position: number;
  score: number;
  certificates: number;
  performancePoints: number;
  certificatePoints: number;
  consistencyPoints?: number;
};

export default function CompetitionPanel() {
  const [season, setSeason] = useState<Season | null>(null);
  const [ranking, setRanking] = useState<Result[]>([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function load() {
      const currentResponse = await fetch("/api/competition/current", { cache: "no-store" });
      if (!currentResponse.ok) {
        const data = await currentResponse.json().catch(() => ({}));
        setMessage(data.error ?? "Nenhuma temporada ativa.");
        return;
      }
      const current = await currentResponse.json();
      setSeason(current);
      const rankingResponse = await fetch(`/api/competition/seasons/${current.id}/ranking`, { cache: "no-store" });
      if (rankingResponse.ok) setRanking(await rankingResponse.json());
    }
    void load();
  }, []);

  return (
    <main className="mx-auto max-w-4xl space-y-6 p-6">
      <header>
        <h1 className="text-3xl font-bold">Competição</h1>
        {season ? (
          <p className="text-muted-foreground">{season.name} · {season.status}</p>
        ) : (
          <p className="text-muted-foreground">{message}</p>
        )}
      </header>

      <section className="rounded-lg border p-5">
        <div className="mb-4 grid grid-cols-3 gap-3 text-center text-sm">
          <div className="rounded-md border p-3"><strong>50%</strong><br />desempenho</div>
          <div className="rounded-md border p-3"><strong>30%</strong><br />certificados</div>
          <div className="rounded-md border p-3"><strong>20%</strong><br />consistência</div>
        </div>

        <div className="space-y-2">
          {ranking.map((result) => (
            <div key={result.userId} className="grid grid-cols-[48px_1fr_auto] items-center gap-3 rounded-md border p-3">
              <span className="text-center font-bold">{result.position}</span>
              <div>
                <p className="font-medium">{result.userName || "Usuário"}</p>
                <p className="text-xs text-muted-foreground">{result.certificates} certificado(s) · desempenho {result.performancePoints} · certificados {result.certificatePoints}</p>
              </div>
              <strong>{result.score} pts</strong>
            </div>
          ))}
          {season && ranking.length === 0 && <p className="text-sm text-muted-foreground">Ainda não há participantes com atividade.</p>}
        </div>
      </section>
    </main>
  );
}
