"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { signIn } from "next-auth/react";
import { BookOpen, Loader2, Sparkles } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);
    const result = await signIn("credentials", { email, password, redirect: false });
    if (result?.error) {
      setError("E-mail ou senha incorretos.");
      setLoading(false);
      return;
    }
    window.location.assign("/");
  }

  return (
    <div className="min-h-screen bg-[#f7f6f1] text-[#193a5a]">
      <div className="grid min-h-screen lg:grid-cols-[0.92fr_1.08fr]">
        <section className="relative hidden overflow-hidden bg-[#193a5a] p-10 text-white lg:flex lg:flex-col lg:justify-between">
          <div className="absolute -right-32 -top-28 h-[430px] w-[430px] rounded-full border-[55px] border-[#315977]" />
          <div className="absolute -bottom-32 -left-28 h-[360px] w-[360px] rounded-full border-[42px] border-[#ef806e]/20" />
          <Link href="/" className="relative z-10 flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-white/10"><BookOpen size={19} /></div><div className="font-display text-[19px] font-bold tracking-[-0.04em]">study<span className="text-[#f4a08f]">hub</span></div></Link>
          <div className="relative z-10 max-w-[460px] pb-10">
            <div className="mb-5 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-[#f7c870]"><Sparkles size={15} /> Seu ritmo, seu próximo nível</div>
            <h1 className="font-display text-[48px] font-bold leading-[1.02] tracking-[-0.07em]">Aprender melhor começa com um plano claro.</h1>
            <p className="mt-6 max-w-[380px] text-[14px] leading-6 text-[#a9c1cb]">Centralize suas metas, materiais e sessões de estudo em um espaço feito para manter você em movimento.</p>
            <div className="mt-8 flex flex-wrap gap-2 text-[11px] font-semibold text-[#d6e2e4]"><span className="rounded-full bg-white/10 px-3 py-2">Foco diário</span><span className="rounded-full bg-white/10 px-3 py-2">Roadmap visual</span><span className="rounded-full bg-white/10 px-3 py-2">Progresso real</span></div>
          </div>
          <div className="relative z-10 flex items-center justify-between text-[10px] font-semibold text-[#87a7b4]"><span>© 2026 StudyHub</span><span>Feito para quem continua</span></div>
        </section>
        <section className="flex items-center justify-center px-5 py-10 sm:px-10">
          <div className="w-full max-w-[400px]">
            <Link href="/" className="mb-12 flex items-center gap-3 lg:hidden"><div className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-[#193a5a] text-white"><BookOpen size={18} /></div><div className="font-display text-[19px] font-bold tracking-[-0.04em] text-[#193a5a]">study<span className="text-[#ef806e]">hub</span></div></Link>
            <div className="mb-9"><div className="mb-3 text-[11px] font-bold uppercase tracking-[0.15em] text-[#ef806e]">BEM-VINDA DE VOLTA</div><h2 className="font-display text-[35px] font-bold tracking-[-0.065em] text-[#193a5a]">Entre no seu espaço.</h2><p className="mt-3 text-[13px] font-medium text-[#8e9da1]">Continue de onde parou e mantenha seu ritmo.</p></div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <label className="block"><span className="mb-2 block text-[11px] font-bold uppercase tracking-[0.12em] text-[#70828d]">E-mail</span><input required type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} className="w-full rounded-[12px] border border-[#e1e6e2] bg-white px-4 py-3.5 text-[13px] outline-none transition focus:border-[#193a5a] focus:ring-2 focus:ring-[#193a5a]/10" placeholder="voce@exemplo.com" /></label>
              <label className="block"><span className="mb-2 block text-[11px] font-bold uppercase tracking-[0.12em] text-[#70828d]">Senha</span><input required type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} className="w-full rounded-[12px] border border-[#e1e6e2] bg-white px-4 py-3.5 text-[13px] outline-none transition focus:border-[#193a5a] focus:ring-2 focus:ring-[#193a5a]/10" placeholder="••••••••" /></label>
              {error && <p role="alert" className="rounded-[10px] bg-[#fff0ed] px-3 py-2 text-[12px] font-semibold text-[#c85f50]">{error}</p>}
              <button disabled={loading} type="submit" className="flex w-full items-center justify-center gap-2 rounded-[12px] bg-[#193a5a] py-3.5 text-[12px] font-bold text-white transition hover:bg-[#254f73] disabled:cursor-wait disabled:opacity-70">{loading && <Loader2 size={16} className="animate-spin" />} {loading ? "Entrando..." : "Entrar"}</button>
            </form>
            <div className="mt-5 flex items-center justify-between text-[11px] font-semibold">
              <Link href="/recuperar-acesso" className="text-[#ef806e] hover:underline">Esqueci minha senha</Link>
              <Link href="/cadastro" className="text-[#193a5a] hover:text-[#ef806e]">Criar cadastro</Link>
            </div>
            <p className="mt-8 text-center text-[11px] font-semibold text-[#9aa5a7]">Ao entrar, você concorda com os termos de uso do StudyHub.</p>
          </div>
        </section>
      </div>
    </div>
  );
}
