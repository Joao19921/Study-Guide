"use client";

import { useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { toast } from "sonner";
import {
  ArrowLeft,
  ArrowUpRight,
  Bell,
  BookOpen,
  CalendarDays,
  CircleHelp,
  FolderOpen,
  Grid2X2,
  LayoutDashboard,
  Menu,
  FileText,
  Search,
  Settings2,
  Sparkles,
  Target,
  Trophy,
  X,
} from "lucide-react";
import { GoalsModule } from "@/components/modules/GoalsModule";
import { LibraryModule } from "@/components/modules/LibraryModule";
import { ThemesModule } from "@/components/modules/ThemesModule";
import { SessionsModule } from "@/components/modules/SessionsModule";
import { CertificationsModule } from "@/components/modules/CertificationsModule";
import { RoadmapModule } from "@/components/modules/RoadmapModule";
import { ReportsModule } from "@/components/modules/ReportsModule";
import { SearchModule } from "@/components/modules/SearchModule";

const routes: Record<string, string> = {
  Dashboard: "/",
  Metas: "/metas",
  Biblioteca: "/biblioteca",
  Temas: "/temas",
  Sessões: "/sessoes",
  Certificações: "/certificacoes",
  "Roadmap anual": "/roadmap",
  Configurações: "/configuracoes",
  "Relatórios": "/relatorios",
  "Busca global": "/busca",
};

const navGroups = [
  { label: "Visão geral", items: [{ icon: LayoutDashboard, label: "Dashboard" }, { icon: Search, label: "Busca global" }] },
  { label: "Meu estudo", items: [{ icon: Target, label: "Metas" }, { icon: BookOpen, label: "Biblioteca" }, { icon: FolderOpen, label: "Temas" }, { icon: CalendarDays, label: "Sessões" }] },
  { label: "Planejamento", items: [{ icon: Trophy, label: "Certificações" }, { icon: Grid2X2, label: "Roadmap anual" }, { icon: FileText, label: "Relatórios" }] },
];

const moduleData: Record<string, { eyebrow: string; title: string; description: string }> = {
  "/metas": { eyebrow: "PLANEJAMENTO PESSOAL", title: "Metas", description: "Transforme intenção em pequenos compromissos que cabem na sua semana." },
  "/biblioteca": { eyebrow: "SEU ACERVO", title: "Biblioteca", description: "Todos os materiais, links e referências para estudar sem perder o foco." },
  "/temas": { eyebrow: "MAPA DE COMPETÊNCIAS", title: "Temas", description: "Organize o que você precisa dominar e acompanhe sua evolução por assunto." },
  "/sessoes": { eyebrow: "HISTÓRICO DE FOCO", title: "Sessões de estudo", description: "Registre o tempo investido e entenda onde sua energia está indo." },
  "/certificacoes": { eyebrow: "PRÓXIMOS MARCOS", title: "Certificações", description: "Planeje suas provas, conecte competências e chegue preparado ao dia do exame." },
  "/roadmap": { eyebrow: "VISÃO DE LONGO PRAZO", title: "Roadmap anual", description: "Uma visão clara dos seus próximos passos, certificação por certificação." },
  "/configuracoes": { eyebrow: "PREFERÊNCIAS", title: "Configurações", description: "Ajuste seu espaço de estudos para trabalhar do seu jeito." },
  "/relatorios": { eyebrow: "INSIGHTS DE APRENDIZADO", title: "Relatórios", description: "Entenda seu ritmo, encontre padrões e tome decisões melhores sobre sua rotina." },
  "/busca": { eyebrow: "ENCONTRE RÁPIDO", title: "Busca global", description: "Pesquise temas, materiais, tarefas e certificações em um único lugar." },
};

function Logo() {
  return (
    <Link href="/" className="flex items-center gap-3">
      <div className="relative flex h-10 w-10 items-center justify-center rounded-[14px] bg-[#193a5a] text-white shadow-[0_8px_18px_rgba(25,58,90,0.22)]"><BookOpen size={18} /><span className="absolute -right-1 -top-1 h-3 w-3 rounded-full border-2 border-[#fbfaf7] bg-[#f38b73]" /></div>
      <div className="leading-none"><div className="font-display text-[19px] font-bold tracking-[-0.04em] text-[#163955]">study<span className="text-[#ef806e]">hub</span></div><div className="mt-1 text-[9px] font-semibold uppercase tracking-[0.18em] text-[#8c9aa4]">keep moving</div></div>
    </Link>
  );
}

function Sidebar({ close }: { close?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const navigate = (label: string) => {
    const path = routes[label];
    if (path) router.push(path);
    if (close) close();
  };
  return (
    <aside className="flex h-full w-[256px] shrink-0 flex-col border-r border-[#e6e5df] bg-[#fbfaf7] px-5 py-6">
      <div className="mb-10 flex items-center justify-between"><Logo />{close && <button onClick={close} className="rounded-lg p-2 text-[#8a99a4]"><X size={18} /></button>}</div>
      <nav className="space-y-7">
        {navGroups.map((group) => (
          <div key={group.label}>
            <div className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-[#aab2b4]">{group.label}</div>
            <div className="space-y-1">
              {group.items.map((item) => {
                const active = pathname === routes[item.label];
                return (
                  <button key={item.label} onClick={() => navigate(item.label)} className={`group flex w-full items-center gap-3 rounded-[12px] px-3 py-2.5 text-left text-[13px] font-semibold transition ${active ? "bg-[#e9f0f4] text-[#193a5a] shadow-[inset_3px_0_0_#ef806e]" : "text-[#7b8a94] hover:bg-[#f0eee8] hover:text-[#193a5a]"}`}>
                    <item.icon size={17} className={active ? "text-[#ef806e]" : "text-[#99a7ae]"} /><span className="flex-1">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
      <div className="mt-auto">
        <div className="relative mb-5 overflow-hidden rounded-[18px] bg-[#193a5a] p-4 text-white">
          <Sparkles size={18} className="mb-8 text-[#f7c870]" />
          <div className="text-[12px] font-medium leading-5 text-white/70">Seu ritmo está consistente. Pequenos passos viram grandes resultados.</div>
          <button onClick={() => navigate("Metas")} className="mt-3 text-[11px] font-bold text-[#f7c870]">Ajustar metas <ArrowUpRight size={13} className="inline" /></button>
        </div>
        <button onClick={() => navigate("Configurações")} className="flex w-full items-center gap-3 rounded-[12px] px-3 py-2.5 text-left text-[13px] font-semibold text-[#7b8a94] hover:bg-[#f0eee8]"><Settings2 size={17} /> Configurações</button>
        <button onClick={() => toast("Central de ajuda em breve")} className="flex w-full items-center gap-3 rounded-[12px] px-3 py-2.5 text-left text-[13px] font-semibold text-[#7b8a94] hover:bg-[#f0eee8]"><CircleHelp size={17} /> Central de ajuda</button>
      </div>
    </aside>
  );
}

function Header({ onMenu, title }: { onMenu: () => void; title: string }) {
  const { data: session } = useSession();
  const displayName = session?.user?.name ?? session?.user?.email ?? "Você";
  const initials = displayName.split(" ").filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
  return (
    <header className="flex h-[82px] items-center justify-between border-b border-[#e6e5df] bg-[#fbfaf7]/85 px-5 backdrop-blur-xl sm:px-8 lg:px-11">
      <div className="flex items-center gap-3"><button onClick={onMenu} className="rounded-xl p-2 text-[#70828d] lg:hidden"><Menu size={21} /></button><div className="hidden h-9 w-px bg-[#e3e4df] lg:block" /><div className="text-[12px] font-bold text-[#94a1a5]">{title.toUpperCase()}</div></div>
      <div className="flex items-center gap-2 sm:gap-4">
        <button onClick={() => toast("Você está em dia! Nenhuma nova notificação.")} className="relative rounded-[11px] p-2 text-[#92a0a4]"><Bell size={18} /></button>
        <div className="hidden h-7 w-px bg-[#e3e4df] sm:block" />
        <button onClick={() => signOut({ callbackUrl: "/login" })} className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#f3b5a4] text-[11px] font-bold text-[#754b43]">{initials || "?"}</div>
          <div className="hidden text-left sm:block"><div className="text-[11px] font-bold text-[#375668]">{displayName}</div><div className="text-[9px] font-semibold text-[#a0adaf]">Sair</div></div>
        </button>
      </div>
    </header>
  );
}

function SettingsPanel() {
  const { data: session } = useSession();
  return (
    <div className="rounded-[20px] bg-[#193a5a] p-6 text-white">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#f3b5a4] text-[16px] font-bold text-[#754b43]">{(session?.user?.name ?? "?").slice(0, 2).toUpperCase()}</div>
      <h2 className="mt-5 font-display text-[23px] font-bold tracking-[-0.04em]">{session?.user?.name ?? "Sua conta"}</h2>
      <p className="mt-1 text-[12px] text-[#9eb9c4]">{session?.user?.email}</p>
      <div className="mt-4 inline-block rounded-full bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.1em] text-[#e7c98d]">
        {(session?.user as { role?: string } | undefined)?.role === "admin" ? "Administrador" : "Usuário"}
      </div>
      <div className="mt-8 border-t border-white/10 pt-5 text-[11px] leading-5 text-[#a8c0c9]">Seu perfil organiza preferências, metas padrão e a forma como o StudyHub te ajuda a manter consistência.</div>
      <button onClick={() => signOut({ callbackUrl: "/login" })} className="mt-6 text-[11px] font-bold text-[#f7c870]">Sair da conta</button>
    </div>
  );
}

function ModuleContent({ path }: { path: string }) {
  const data = moduleData[path] || moduleData["/metas"];
  const searchParams = useSearchParams();

  return (
    <div className="mx-auto max-w-[1440px] px-5 pb-12 pt-8 sm:px-8 lg:px-11">
      <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <Link href="/" className="mb-3 flex w-fit items-center gap-1 text-[11px] font-bold text-[#9aa6a9] hover:text-[#193a5a]"><ArrowLeft size={14} /> Voltar ao dashboard</Link>
          <div className="mb-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-[#ef806e]"><span className="h-1.5 w-1.5 rounded-full bg-[#ef806e]" /> {data.eyebrow}</div>
          <h1 className="font-display text-[35px] font-bold leading-none tracking-[-0.065em] text-[#193a5a] sm:text-[42px]">{data.title}</h1>
          <p className="mt-3 max-w-[650px] text-[13px] font-medium text-[#8e9da1]">{data.description}</p>
        </div>
      </div>

      {path === "/configuracoes" ? (
        <SettingsPanel />
      ) : path === "/roadmap" ? (
        <RoadmapModule />
      ) : path === "/certificacoes" ? (
        <CertificationsModule />
      ) : path === "/relatorios" ? (
        <ReportsModule />
      ) : path === "/busca" ? (
        <SearchModule initialQuery={searchParams.get("q") ?? ""} />
      ) : path === "/biblioteca" ? (
        <div className="rounded-[20px] border border-[#e6e5df] bg-[#fffefa] p-5 shadow-[0_5px_20px_rgba(36,50,58,0.035)] sm:p-6"><LibraryModule /></div>
      ) : path === "/temas" ? (
        <div className="rounded-[20px] border border-[#e6e5df] bg-[#fffefa] p-5 shadow-[0_5px_20px_rgba(36,50,58,0.035)] sm:p-6"><ThemesModule /></div>
      ) : path === "/sessoes" ? (
        <SessionsModule />
      ) : (
        <div className="rounded-[20px] border border-[#e6e5df] bg-[#fffefa] p-5 shadow-[0_5px_20px_rgba(36,50,58,0.035)] sm:p-6"><GoalsModule /></div>
      )}
    </div>
  );
}

export default function StudyModule({ path }: { path: string }) {
  const [mobile, setMobile] = useState(false);
  const data = moduleData[path] || moduleData["/metas"];
  return (
    <div className="min-h-screen bg-[#f7f6f1] text-[#193a5a]">
      <div className="flex min-h-screen">
        <div className="hidden lg:block"><Sidebar /></div>
        {mobile && <div className="fixed inset-0 z-50 flex lg:hidden"><button onClick={() => setMobile(false)} className="flex-1 bg-[#193a5a]/30" /><div className="w-[280px]"><Sidebar close={() => setMobile(false)} /></div></div>}
        <main className="min-w-0 flex-1">
          <Header onMenu={() => setMobile(true)} title={data.title} />
          <ModuleContent path={path} />
        </main>
      </div>
    </div>
  );
}
