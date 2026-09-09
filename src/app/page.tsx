"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowUpRight,
  Bell,
  BookOpen,
  CalendarDays,
  Check,
  CircleHelp,
  Clock3,
  FolderOpen,
  Flame,
  FileText,
  Grid2X2,
  LayoutDashboard,
  Menu,
  Play,
  Plus,
  Search,
  Settings2,
  Sparkles,
  Target,
  Timer,
  Trophy,
  X,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api-client";
import { SessionModal } from "@/components/SessionModal";
import type { ApiCertification, ApiGoal, ApiTask, ApiTheme, ReportSummary } from "@/types/api";

const navGroups: Array<{ label: string; items: Array<{ icon: typeof LayoutDashboard; label: string; active?: boolean; count?: string }> }> = [
  { label: "Visão geral", items: [{ icon: LayoutDashboard, label: "Dashboard", active: true }, { icon: Search, label: "Busca global" }] },
  {
    label: "Meu estudo",
    items: [
      { icon: Target, label: "Metas" },
      { icon: BookOpen, label: "Biblioteca" },
      { icon: FolderOpen, label: "Temas" },
      { icon: CalendarDays, label: "Sessões" },
    ],
  },
  { label: "Planejamento", items: [{ icon: Trophy, label: "Certificações" }, { icon: Grid2X2, label: "Roadmap anual" }, { icon: FileText, label: "Relatórios" }] },
];

const WEEKDAY_LABELS = ["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SÁB"];

function formatMinutes(totalMinutes: number) {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}h${String(minutes).padStart(2, "0")}`;
}

function AppLogo() {
  return (
    <div className="flex items-center gap-3">
      <div className="relative flex h-10 w-10 items-center justify-center rounded-[14px] bg-[#193a5a] text-white shadow-[0_8px_18px_rgba(25,58,90,0.22)]">
        <BookOpen size={18} strokeWidth={2.4} />
        <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full border-[2px] border-[#f7f6f1] bg-[#f38b73]" />
      </div>
      <div className="leading-none">
        <div className="font-display text-[19px] font-bold tracking-[-0.04em] text-[#163955]">study<span className="text-[#ef806e]">hub</span></div>
        <div className="mt-1 text-[9px] font-semibold uppercase tracking-[0.18em] text-[#8c9aa4]">keep moving</div>
      </div>
    </div>
  );
}

function Sidebar({ onClose, onNavigate }: { onClose?: () => void; onNavigate: (label: string) => void }) {
  return (
    <aside className="flex h-full w-[256px] shrink-0 flex-col border-r border-[#e6e5df] bg-[#fbfaf7] px-5 py-6">
      <div className="mb-10 flex items-center justify-between">
        <AppLogo />
        {onClose && <button aria-label="Fechar menu" onClick={onClose} className="rounded-lg p-2 text-[#8a99a4] hover:bg-[#f0eee8]"><X size={18} /></button>}
      </div>

      <nav className="space-y-7">
        {navGroups.map((group) => (
          <div key={group.label}>
            <div className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-[#aab2b4]">{group.label}</div>
            <div className="space-y-1">
              {group.items.map((item) => (
                <button key={item.label} onClick={() => onNavigate(item.label)} className={`group flex w-full items-center gap-3 rounded-[12px] px-3 py-2.5 text-left text-[13px] font-semibold transition-all duration-200 ${item.active ? "bg-[#e9f0f4] text-[#193a5a] shadow-[inset_3px_0_0_#ef806e]" : "text-[#7b8a94] hover:bg-[#f0eee8] hover:text-[#193a5a]"}`}>
                  <item.icon size={17} strokeWidth={item.active ? 2.3 : 1.9} className={item.active ? "text-[#ef806e]" : "text-[#99a7ae] group-hover:text-[#193a5a]"} />
                  <span className="flex-1">{item.label}</span>
                  {item.count && <span className="rounded-full bg-white px-2 py-0.5 text-[10px] text-[#8b9aa3] shadow-sm">{item.count}</span>}
                </button>
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="mt-auto">
        <div className="relative mb-5 overflow-hidden rounded-[18px] bg-[#193a5a] p-4 text-white shadow-[0_14px_26px_rgba(25,58,90,0.2)]">
          <div className="absolute -right-7 -top-7 h-24 w-24 rounded-full border-[13px] border-[#ef806e]/30" />
          <Sparkles size={18} className="mb-8 text-[#f7c870]" />
          <div className="relative text-[12px] font-medium leading-5 text-white/70">Seu ritmo está consistente. Pequenos passos viram grandes resultados.</div>
          <button onClick={() => onNavigate("Metas")} className="relative mt-3 flex items-center gap-1 text-[11px] font-bold text-[#f7c870]">Ajustar metas <ArrowUpRight size={13} /></button>
        </div>
        <button onClick={() => onNavigate("Configurações")} className="flex w-full items-center gap-3 rounded-[12px] px-3 py-2.5 text-left text-[13px] font-semibold text-[#7b8a94] transition hover:bg-[#f0eee8] hover:text-[#193a5a]"><Settings2 size={17} /> Configurações</button>
        <button onClick={() => toast("Central de ajuda em breve")} className="flex w-full items-center gap-3 rounded-[12px] px-3 py-2.5 text-left text-[13px] font-semibold text-[#7b8a94] transition hover:bg-[#f0eee8] hover:text-[#193a5a]"><CircleHelp size={17} /> Central de ajuda</button>
      </div>
    </aside>
  );
}

function StatCard({ icon: Icon, label, value, detail, accent, progress }: { icon: typeof Clock3; label: string; value: string; detail: string; accent: string; progress?: number }) {
  return (
    <div className="group relative overflow-hidden rounded-[18px] border border-[#e6e5df] bg-[#fffefa] p-5 shadow-[0_5px_20px_rgba(36,50,58,0.035)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_10px_26px_rgba(36,50,58,0.08)]">
      <div className={`mb-5 flex h-9 w-9 items-center justify-center rounded-[11px] ${accent}`}><Icon size={17} /></div>
      <div className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#9aa5aa]">{label}</div>
      <div className="mt-1 flex items-end gap-2"><span className="font-display text-[28px] font-bold tracking-[-0.06em] text-[#193a5a]">{value}</span><span className="mb-1 text-[11px] font-semibold text-[#93a0a6]">{detail}</span></div>
      {progress !== undefined && <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-[#e9eeec]"><div className="h-full rounded-full bg-[#70b8a6]" style={{ width: `${progress}%` }} /></div>}
      <div className="absolute -bottom-9 -right-7 h-20 w-20 rounded-full bg-[#f7f6f1] opacity-70 transition group-hover:scale-125" />
    </div>
  );
}

function FocusCard({ task, onStart }: { task: ApiTask | undefined; onStart: () => void }) {
  return (
    <div className="relative min-h-[245px] overflow-hidden rounded-[20px] bg-[#f5d7ca] p-6 shadow-[0_9px_26px_rgba(239,128,110,0.12)]">
      <div className="absolute -right-14 -top-20 h-[245px] w-[245px] rounded-full border-[28px] border-[#fff4eb]/60" />
      <div className="absolute -bottom-20 -right-2 h-[170px] w-[170px] rounded-full border-[20px] border-[#ef806e]/20" />
      <div className="relative z-10 flex items-start justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-[#9b6557]"><Zap size={13} fill="currentColor" /> Foco sugerido</div>
          <h3 className="font-display max-w-[270px] text-[25px] font-bold leading-[1.03] tracking-[-0.045em] text-[#643e37]">{task ? task.title : "Nenhuma tarefa pendente"}</h3>
        </div>
        {task && <div className="rounded-full bg-[#fff4eb]/75 px-2.5 py-1 text-[10px] font-bold text-[#9b6557]">Prioridade {task.priority}</div>}
      </div>
      {task?.subtitle && <div className="relative z-10 mt-5 flex items-center gap-4 text-[12px] font-semibold text-[#8b5c51]"><span>{task.subtitle}</span></div>}
      <button onClick={onStart} className="relative z-10 mt-6 flex items-center gap-2 rounded-[11px] bg-[#193a5a] px-4 py-2.5 text-[12px] font-bold text-white shadow-[0_7px_15px_rgba(25,58,90,0.18)] transition hover:bg-[#254f73] active:scale-[0.97]"><Play size={14} fill="currentColor" /> Começar sessão</button>
    </div>
  );
}

function WeeklyChart({ summary }: { summary: ReportSummary | null }) {
  const days = summary?.last7Days ?? [];
  const maxMinutes = Math.max(...days.map((day) => day.minutes), 60);
  const totalMinutes = days.reduce((total, day) => total + day.minutes, 0);
  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="rounded-[20px] border border-[#e6e5df] bg-[#fffefa] p-6 shadow-[0_5px_20px_rgba(36,50,58,0.035)]">
      <div className="flex items-start justify-between"><div><h2 className="font-display text-[18px] font-bold tracking-[-0.035em] text-[#193a5a]">Ritmo de estudos</h2><p className="mt-1 text-[11px] font-medium text-[#9aa5aa]">Horas focadas nos últimos 7 dias</p></div></div>
      <div className="mt-7 flex h-[150px] items-end justify-between gap-2 px-1">
        {days.map((day) => {
          const isToday = day.date === today;
          return (
            <div key={day.date} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
              <div className="relative flex h-full w-full items-end justify-center">
                <div className={`w-full max-w-[28px] rounded-t-[8px] transition-all duration-300 ${isToday ? "bg-[#ef806e] shadow-[0_6px_13px_rgba(239,128,110,0.2)]" : day.minutes ? "bg-[#a9d2c7]" : "bg-[#edf0ed]"}`} style={{ height: `${day.minutes ? Math.max((day.minutes / maxMinutes) * 100, 16) : 9}%` }}>
                  {isToday && day.minutes > 0 && <span className="absolute -top-7 left-1/2 -translate-x-1/2 rounded-md bg-[#193a5a] px-1.5 py-1 text-[9px] font-bold text-white">{formatMinutes(day.minutes)}</span>}
                </div>
              </div>
              <span className={`text-[9px] font-bold ${isToday ? "text-[#193a5a]" : "text-[#a6b0b3]"}`}>{WEEKDAY_LABELS[new Date(day.date + "T00:00:00").getDay()]}</span>
            </div>
          );
        })}
      </div>
      <div className="mt-5 flex items-center justify-between border-t border-[#f0efe9] pt-4"><div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-[#ef806e]" /><span className="text-[11px] font-semibold text-[#8f9ba0]">Últimos 7 dias</span></div><div className="text-right"><span className="font-display text-[20px] font-bold tracking-[-0.04em] text-[#193a5a]">{formatMinutes(totalMinutes)}</span></div></div>
    </div>
  );
}

function TasksCard({ tasks, toggleTask, onAdd }: { tasks: ApiTask[]; toggleTask: (id: string) => void; onAdd: () => void }) {
  const [filter, setFilter] = useState("Todas");
  const filters = ["Todas", "Pendentes", "Concluídas"];
  const filteredTasks = useMemo(
    () => (filter === "Todas" ? tasks : filter === "Pendentes" ? tasks.filter((task) => !task.done) : tasks.filter((task) => task.done)),
    [filter, tasks]
  );
  return (
    <div className="rounded-[20px] border border-[#e6e5df] bg-[#fffefa] p-6 shadow-[0_5px_20px_rgba(36,50,58,0.035)]">
      <div className="flex items-start justify-between"><div><h2 className="font-display text-[18px] font-bold tracking-[-0.035em] text-[#193a5a]">Próximas tarefas</h2><p className="mt-1 text-[11px] font-medium text-[#9aa5aa]">Priorizadas automaticamente</p></div><button onClick={onAdd} className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-[#e9f0f4] text-[#193a5a] transition hover:bg-[#dce8ee] active:scale-95" aria-label="Adicionar tarefa"><Plus size={16} /></button></div>
      <div className="mt-5 flex gap-1 rounded-[10px] bg-[#f7f6f1] p-1">{filters.map((item) => <button key={item} onClick={() => setFilter(item)} className={`flex-1 rounded-lg py-1.5 text-[10px] font-bold transition ${filter === item ? "bg-white text-[#193a5a] shadow-sm" : "text-[#a1abad] hover:text-[#61737e]"}`}>{item}</button>)}</div>
      <div className="mt-4 space-y-1">
        {filteredTasks.length === 0 && <div className="py-6 text-center text-[11px] font-semibold text-[#a1abad]">Nenhuma tarefa aqui.</div>}
        {filteredTasks.map((task) => (
          <div key={task.id} className={`group flex items-center gap-3 rounded-[12px] px-2 py-2.5 transition hover:bg-[#f8f7f3] ${task.done ? "opacity-55" : ""}`}>
            <button onClick={() => toggleTask(task.id)} aria-label={`Marcar ${task.title}`} className={`flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border-2 transition ${task.done ? "border-[#70b8a6] bg-[#70b8a6] text-white" : "border-[#d2dcd9] hover:border-[#ef806e]"}`}>{task.done && <Check size={11} strokeWidth={3} />}</button>
            <div className="min-w-0 flex-1">
              <div className={`truncate text-[12px] font-bold text-[#425966] ${task.done ? "line-through" : ""}`}>{task.title}</div>
              <div className="mt-0.5 flex items-center gap-2 text-[10px] font-medium text-[#a2adaf]"><span>{task.subtitle}</span><span className={`h-1 w-1 rounded-full ${task.priority === "alta" ? "bg-[#ef806e]" : task.priority === "media" ? "bg-[#80aeca]" : "bg-[#70b8a6]"}`} /><span>{task.dueDate ? new Date(task.dueDate).toLocaleDateString("pt-BR") : "Sem prazo"}</span></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function RoadmapCard({ certification, onOpen }: { certification: ApiCertification | undefined; onOpen: () => void }) {
  if (!certification) {
    return (
      <div className="flex flex-col items-center justify-center rounded-[20px] bg-[#193a5a] p-6 text-center text-white shadow-[0_12px_30px_rgba(25,58,90,0.16)]">
        <Trophy size={22} className="mb-3 text-[#f7c870]" />
        <div className="text-[13px] font-semibold">Nenhuma certificação planejada ainda</div>
        <button onClick={onOpen} className="mt-4 rounded-[11px] border border-white/15 bg-white/10 px-4 py-2 text-[11px] font-bold text-white transition hover:bg-white/15">Ver certificações</button>
      </div>
    );
  }
  return (
    <div className="rounded-[20px] bg-[#193a5a] p-6 text-white shadow-[0_12px_30px_rgba(25,58,90,0.16)]">
      <div className="flex items-start justify-between"><div><div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.15em] text-[#8fb6c7]"><Trophy size={14} /> Próximo marco</div><h2 className="mt-3 font-display text-[21px] font-bold tracking-[-0.04em]">{certification.name}</h2></div><div className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-[#315977]"><Trophy size={19} className="text-[#f7c870]" /></div></div>
      <div className="mt-6 flex items-end justify-between"><div><div className="text-[10px] font-semibold text-[#91aebd]">Progresso</div><div className="mt-1 font-display text-[26px] font-bold tracking-[-0.05em]">{certification.progress}<span className="text-[15px] text-[#91aebd]">%</span></div></div>{certification.examDate && <div className="text-right text-[10px] font-semibold text-[#91aebd]">Exame em<br /><span className="text-[12px] text-white">{new Date(certification.examDate).toLocaleDateString("pt-BR")}</span></div>}</div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#315977]"><div className="h-full rounded-full bg-[#f7c870]" style={{ width: `${certification.progress}%` }} /></div>
      <button onClick={onOpen} className="mt-5 flex w-full items-center justify-center gap-2 rounded-[11px] border border-white/15 bg-white/10 py-2.5 text-[11px] font-bold text-white transition hover:bg-white/15">Ver roadmap <ArrowUpRight size={14} /></button>
    </div>
  );
}

export default function Home() {
  const router = useRouter();
  const [tasks, setTasks] = useState<ApiTask[]>([]);
  const [themes, setThemes] = useState<ApiTheme[]>([]);
  const [goals, setGoals] = useState<ApiGoal[]>([]);
  const [certifications, setCertifications] = useState<ApiCertification[]>([]);
  const [summary, setSummary] = useState<ReportSummary | null>(null);
  const [mobileNav, setMobileNav] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [sessionOpen, setSessionOpen] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    let mounted = true;
    Promise.all([
      apiFetch<ApiTask[]>("/api/tasks"),
      apiFetch<ApiTheme[]>("/api/themes"),
      apiFetch<ApiGoal[]>("/api/goals"),
      apiFetch<ApiCertification[]>("/api/certifications"),
      apiFetch<ReportSummary>("/api/reports/summary"),
    ])
      .then(([taskRows, themeRows, goalRows, certificationRows, summaryData]) => {
        if (!mounted) return;
        setTasks(taskRows);
        setThemes(themeRows);
        setGoals(goalRows);
        setCertifications(certificationRows);
        setSummary(summaryData);
      })
      .catch(() => toast.error("Não foi possível carregar o dashboard"));
    return () => {
      mounted = false;
    };
  }, []);

  const toggleTask = async (id: string) => {
    const current = tasks.find((task) => task.id === id);
    if (!current) return;
    setTasks((prev) => prev.map((task) => (task.id === id ? { ...task, done: !task.done } : task)));
    try {
      await apiFetch(`/api/tasks/${id}`, { method: "PATCH", body: JSON.stringify({ done: !current.done }) });
    } catch {
      setTasks((prev) => prev.map((task) => (task.id === id ? { ...task, done: current.done } : task)));
      toast.error("Falha ao atualizar tarefa");
    }
  };

  const addTask = async () => {
    try {
      const created = await apiFetch<ApiTask>("/api/tasks", {
        method: "POST",
        body: JSON.stringify({ title: "Nova tarefa", priority: "media" }),
      });
      setTasks((prev) => [created, ...prev]);
      toast.success("Tarefa criada");
    } catch {
      toast.error("Falha ao criar tarefa");
    }
  };

  const handleNavigate = (label: string) => {
    const routes: Record<string, string> = {
      Dashboard: "/",
      Metas: "/metas",
      Biblioteca: "/biblioteca",
      Temas: "/temas",
      Sessões: "/sessoes",
      Certificações: "/certificacoes",
      "Roadmap anual": "/roadmap",
      "Relatórios": "/relatorios",
      "Busca global": "/busca",
      Configurações: "/configuracoes",
    };
    if (routes[label]) router.push(routes[label]);
  };

  const pendingCount = tasks.filter((task) => !task.done).length;
  const nextTask = tasks.find((task) => !task.done);
  const goalsOnTrack = goals.filter((goal) => goal.progress >= 60).length;
  const overallProgress = themes.length > 0 ? Math.round(themes.reduce((sum, theme) => sum + theme.progress, 0) / themes.length) : 0;
  const nextCertification = [...certifications].sort((a, b) => {
    if (!a.examDate) return 1;
    if (!b.examDate) return -1;
    return new Date(a.examDate).getTime() - new Date(b.examDate).getTime();
  })[0];

  return (
    <div className="min-h-screen bg-[#f7f6f1] text-[#193a5a]">
      <div className="flex min-h-screen">
        <div className="hidden lg:block"><Sidebar onNavigate={handleNavigate} /></div>
        {mobileNav && <div className="fixed inset-0 z-50 flex lg:hidden"><button aria-label="Fechar navegação" className="flex-1 bg-[#193a5a]/30 backdrop-blur-[2px]" onClick={() => setMobileNav(false)} /><div className="w-[280px] shadow-2xl"><Sidebar onClose={() => setMobileNav(false)} onNavigate={handleNavigate} /></div></div>}
        <main className="min-w-0 flex-1">
          <header className="flex h-[82px] items-center justify-between border-b border-[#e6e5df] bg-[#fbfaf7]/85 px-5 backdrop-blur-xl sm:px-8 lg:px-11">
            <div className="flex items-center gap-3"><button onClick={() => setMobileNav(true)} className="rounded-xl p-2 text-[#70828d] hover:bg-[#efeee8] lg:hidden" aria-label="Abrir navegação"><Menu size={21} /></button><div className="hidden h-9 w-px bg-[#e3e4df] lg:block" /></div>
            <div className="flex items-center gap-2 sm:gap-4"><button onClick={() => setSearchOpen((value) => !value)} className={`flex items-center gap-2 rounded-[11px] px-2.5 py-2 text-[#92a0a4] transition hover:bg-[#efeee8] ${searchOpen ? "bg-[#efeee8]" : ""}`} aria-label="Buscar"><Search size={18} /><span className="hidden text-[11px] font-semibold sm:block">Buscar</span></button><button onClick={() => toast("Você está em dia! Nenhuma nova notificação.")} className="relative rounded-[11px] p-2 text-[#92a0a4] transition hover:bg-[#efeee8]" aria-label="Notificações"><Bell size={18} /></button></div>
          </header>
          {searchOpen && (
            <div className="border-b border-[#e6e5df] bg-[#fbfaf7] px-5 py-3 sm:px-8 lg:px-11">
              <div className="flex max-w-[520px] items-center gap-3 rounded-xl border border-[#dfe5e1] bg-white px-3 py-2 shadow-sm">
                <Search size={16} className="text-[#a4b0b2]" />
                <input
                  autoFocus
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && search.trim()) router.push(`/busca?q=${encodeURIComponent(search)}`);
                  }}
                  placeholder="Buscar temas, tarefas, materiais... (Enter para abrir)"
                  className="flex-1 bg-transparent text-[12px] font-semibold text-[#193a5a] outline-none placeholder:text-[#b1bcbd]"
                />
                <button onClick={() => { setSearch(""); setSearchOpen(false); }} className="text-[#a4b0b2] hover:text-[#193a5a]"><X size={15} /></button>
              </div>
            </div>
          )}
          <div className="mx-auto max-w-[1440px] px-5 pb-12 pt-8 sm:px-8 lg:px-11">
            <section className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><div className="mb-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-[#ef806e]"><span className="h-1.5 w-1.5 rounded-full bg-[#ef806e]" /> Seu painel pessoal</div><h1 className="font-display text-[35px] font-bold leading-none tracking-[-0.065em] text-[#193a5a] sm:text-[42px]">Bom dia <span className="inline-block origin-bottom-left animate-[wave_1.8s_ease-in-out_infinite]">👋</span></h1><p className="mt-3 text-[13px] font-medium text-[#8e9da1]">Você está construindo algo incrível. Vamos dar mais um passo hoje?</p></div><button onClick={() => setSessionOpen(true)} className="flex w-fit items-center gap-2 rounded-[12px] bg-[#ef806e] px-4 py-3 text-[12px] font-bold text-white shadow-[0_8px_17px_rgba(239,128,110,0.2)] transition hover:bg-[#dd6d5f] active:scale-[0.97]"><Timer size={16} /> Registrar sessão</button></section>
            <section className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard icon={Clock3} label="Tempo estudado" value={formatMinutes(summary?.totalMinutesLast30Days ?? 0)} detail="últimos 30 dias" accent="bg-[#e6f1ef] text-[#70aa9c]" />
              <StatCard icon={Flame} label="Sequência atual" value={`${summary?.streakDays ?? 0} dias`} detail="mantenha o ritmo" accent="bg-[#fff0e8] text-[#ef806e]" />
              <StatCard icon={Target} label="Metas em dia" value={`${goalsOnTrack}/${goals.length}`} detail="acima de 60%" accent="bg-[#e9f0f4] text-[#80aeca]" />
              <StatCard icon={Trophy} label="Progresso geral" value={`${overallProgress}%`} detail={`${pendingCount} tarefas pendentes`} accent="bg-[#fff5dc] text-[#d8a84e]" progress={overallProgress} />
            </section>
            <section className="mb-6 grid gap-5 xl:grid-cols-[1.2fr_0.8fr]"><FocusCard task={nextTask} onStart={() => setSessionOpen(true)} /><WeeklyChart summary={summary} /></section>
            <section className="grid gap-5 xl:grid-cols-[1.12fr_0.88fr]"><TasksCard tasks={tasks} toggleTask={toggleTask} onAdd={addTask} /><RoadmapCard certification={nextCertification} onOpen={() => router.push("/roadmap")} /></section>
            <footer className="mt-8 flex flex-col justify-between gap-2 border-t border-[#e7e5df] pt-5 text-[10px] font-semibold text-[#a3adae] sm:flex-row"><span>StudyHub · seu ritmo, seu próximo nível</span><span className="flex items-center gap-1">Feito para aprender melhor <span className="text-[#ef806e]">✦</span></span></footer>
          </div>
        </main>
      </div>
      {sessionOpen && <SessionModal themes={themes} onClose={() => setSessionOpen(false)} onCreated={(session) => toast.success(`Sessão registrada! +${session.durationMinutes} min no seu progresso.`)} />}
    </div>
  );
}

