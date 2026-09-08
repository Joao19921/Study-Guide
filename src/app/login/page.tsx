import Link from "next/link";
import { BookOpen, Sparkles } from "lucide-react";
import { signIn } from "@/auth";

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.5H42V20.4H24v7.2h11.3c-1.6 4.5-5.9 7.7-11.3 7.7-6.9 0-12.5-5.6-12.5-12.5S17.1 10.3 24 10.3c3.2 0 6.1 1.2 8.3 3.2l5.1-5.1C34.3 5.3 29.4 3.2 24 3.2 12.5 3.2 3.2 12.5 3.2 24S12.5 44.8 24 44.8 44.8 35.5 44.8 24c0-1.2-.1-2.4-.2-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l5.9 4.3C13.8 15.3 18.5 12.3 24 12.3c3.2 0 6.1 1.2 8.3 3.2l5.1-5.1C34.3 7.3 29.4 5.2 24 5.2c-7.5 0-14 4.2-17.7 10.5z" />
      <path fill="#4CAF50" d="M24 44.8c5.3 0 10.1-2 13.7-5.3l-6.3-5.3c-2 1.4-4.6 2.3-7.4 2.3-5.4 0-9.9-3.4-11.6-8.2l-6.1 4.7C9.9 40.4 16.4 44.8 24 44.8z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20.4H24v7.2h11.3c-.8 2.2-2.2 4.1-4.1 5.4l6.3 5.3C40.8 35.6 44.8 30.4 44.8 24c0-1.2-.1-2.4-.2-3.5z" />
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.09 3.29 9.4 7.86 10.93.57.1.79-.25.79-.55 0-.27-.01-1.17-.02-2.12-3.2.7-3.88-1.36-3.88-1.36-.52-1.33-1.28-1.68-1.28-1.68-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11.05 11.05 0 0 1 5.79 0c2.2-1.49 3.18-1.18 3.18-1.18.63 1.59.23 2.76.11 3.05.74.81 1.18 1.83 1.18 3.09 0 4.42-2.69 5.4-5.25 5.68.41.36.78 1.06.78 2.14 0 1.55-.01 2.79-.01 3.17 0 .3.21.66.79.55A10.52 10.52 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z" />
    </svg>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#f7f6f1] text-[#193a5a]">
      <div className="grid min-h-screen lg:grid-cols-[0.92fr_1.08fr]">
        <section className="relative hidden overflow-hidden bg-[#193a5a] p-10 text-white lg:flex lg:flex-col lg:justify-between">
          <div className="absolute -right-32 -top-28 h-[430px] w-[430px] rounded-full border-[55px] border-[#315977]" />
          <div className="absolute -bottom-32 -left-28 h-[360px] w-[360px] rounded-full border-[42px] border-[#ef806e]/20" />
          <Link href="/" className="relative z-10 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-white/10"><BookOpen size={19} /></div>
            <div className="font-display text-[19px] font-bold tracking-[-0.04em]">study<span className="text-[#f4a08f]">hub</span></div>
          </Link>
          <div className="relative z-10 max-w-[460px] pb-10">
            <div className="mb-5 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-[#f7c870]"><Sparkles size={15} /> Seu ritmo, seu próximo nível</div>
            <h1 className="font-display text-[48px] font-bold leading-[1.02] tracking-[-0.07em]">Aprender melhor começa com um plano claro.</h1>
            <p className="mt-6 max-w-[380px] text-[14px] leading-6 text-[#a9c1cb]">Centralize suas metas, materiais e sessões de estudo em um espaço feito para manter você em movimento.</p>
            <div className="mt-8 flex flex-wrap gap-2 text-[11px] font-semibold text-[#d6e2e4]">
              <span className="rounded-full bg-white/10 px-3 py-2">Foco diário</span>
              <span className="rounded-full bg-white/10 px-3 py-2">Roadmap visual</span>
              <span className="rounded-full bg-white/10 px-3 py-2">Progresso real</span>
            </div>
          </div>
          <div className="relative z-10 flex items-center justify-between text-[10px] font-semibold text-[#87a7b4]">
            <span>© 2026 StudyHub</span>
            <span>Feito para quem continua</span>
          </div>
        </section>
        <section className="flex items-center justify-center px-5 py-10 sm:px-10">
          <div className="w-full max-w-[400px]">
            <Link href="/" className="mb-12 flex items-center gap-3 lg:hidden">
              <div className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-[#193a5a] text-white"><BookOpen size={18} /></div>
              <div className="font-display text-[19px] font-bold tracking-[-0.04em] text-[#193a5a]">study<span className="text-[#ef806e]">hub</span></div>
            </Link>
            <div className="mb-9">
              <div className="mb-3 text-[11px] font-bold uppercase tracking-[0.15em] text-[#ef806e]">BEM-VINDA DE VOLTA</div>
              <h2 className="font-display text-[35px] font-bold tracking-[-0.065em] text-[#193a5a]">Entre no seu espaço.</h2>
              <p className="mt-3 text-[13px] font-medium text-[#8e9da1]">Continue de onde parou e mantenha seu ritmo.</p>
            </div>
            <div className="space-y-3">
              <form
                action={async () => {
                  "use server";
                  await signIn("google", { redirectTo: "/" });
                }}
              >
                <button type="submit" className="flex w-full items-center justify-center gap-3 rounded-[12px] border border-[#e1e6e2] bg-white py-3.5 text-[12px] font-bold text-[#506773] transition hover:bg-[#fbfaf7]">
                  <GoogleIcon /> Continuar com Google
                </button>
              </form>
              <form
                action={async () => {
                  "use server";
                  await signIn("github", { redirectTo: "/" });
                }}
              >
                <button type="submit" className="flex w-full items-center justify-center gap-3 rounded-[12px] bg-[#193a5a] py-3.5 text-[12px] font-bold text-white transition hover:bg-[#254f73]">
                  <GitHubIcon /> Continuar com GitHub
                </button>
              </form>
            </div>
            <p className="mt-8 text-center text-[11px] font-semibold text-[#9aa5a7]">Ao entrar, você concorda com os termos de uso do StudyHub.</p>
          </div>
        </section>
      </div>
    </div>
  );
}
