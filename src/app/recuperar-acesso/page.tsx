"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

export default function RecoverAccountPage() {
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (password !== confirmation) {
      setError("As senhas não coincidem.");
      return;
    }
    setLoading(true);
    const response = await fetch("/api/account-recovery", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, password }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      setError(data.error ?? "Não foi possível recuperar o acesso.");
      setLoading(false);
      return;
    }
    setDone(true);
    setLoading(false);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f7f6f1] px-5 py-10 text-[#193a5a]">
      <div className="w-full max-w-[420px] rounded-[18px] bg-white p-7 shadow-sm sm:p-9">
        <div className="mb-8">
          <div className="mb-2 text-[11px] font-bold uppercase tracking-[0.15em] text-[#ef806e]">RECUPERAÇÃO DE ACESSO</div>
          <h1 className="font-display text-[31px] font-bold tracking-[-0.06em]">Defina uma nova senha.</h1>
          <p className="mt-3 text-[13px] leading-5 text-[#8e9da1]">Use o código de recuperação fornecido para recuperar seu único usuário.</p>
        </div>

        {done ? (
          <div className="space-y-5">
            <p className="rounded-[10px] bg-[#eef8f1] px-3 py-3 text-[12px] font-semibold text-[#3f7a55]">Senha redefinida com sucesso.</p>
            <Link href="/login" className="block w-full rounded-[12px] bg-[#193a5a] py-3.5 text-center text-[12px] font-bold text-white">Ir para o login</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="block"><span className="mb-2 block text-[11px] font-bold uppercase tracking-[0.12em] text-[#70828d]">Código de recuperação</span><input required type="password" value={code} onChange={(event) => setCode(event.target.value)} className="w-full rounded-[12px] border border-[#e1e6e2] bg-white px-4 py-3.5 text-[13px] outline-none focus:border-[#193a5a] focus:ring-2 focus:ring-[#193a5a]/10" /></label>
            <label className="block"><span className="mb-2 block text-[11px] font-bold uppercase tracking-[0.12em] text-[#70828d]">Nova senha</span><input required minLength={8} maxLength={128} type="password" autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} className="w-full rounded-[12px] border border-[#e1e6e2] bg-white px-4 py-3.5 text-[13px] outline-none focus:border-[#193a5a] focus:ring-2 focus:ring-[#193a5a]/10" /></label>
            <label className="block"><span className="mb-2 block text-[11px] font-bold uppercase tracking-[0.12em] text-[#70828d]">Confirmar senha</span><input required minLength={8} maxLength={128} type="password" autoComplete="new-password" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} className="w-full rounded-[12px] border border-[#e1e6e2] bg-white px-4 py-3.5 text-[13px] outline-none focus:border-[#193a5a] focus:ring-2 focus:ring-[#193a5a]/10" /></label>
            {error && <p role="alert" className="rounded-[10px] bg-[#fff0ed] px-3 py-2 text-[12px] font-semibold text-[#c85f50]">{error}</p>}
            <button disabled={loading} type="submit" className="w-full rounded-[12px] bg-[#193a5a] py-3.5 text-[12px] font-bold text-white disabled:opacity-70">{loading ? "Salvando..." : "Redefinir senha"}</button>
            <Link href="/login" className="block text-center text-[11px] font-semibold text-[#8e9da1]">Voltar para o login</Link>
          </form>
        )}
      </div>
    </main>
  );
}
