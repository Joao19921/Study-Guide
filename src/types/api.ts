export type ApiCategory = { id: string; name: string; color: string };

export type ApiTheme = {
  id: string;
  name: string;
  description: string | null;
  progress: number;
  categoryId: string | null;
};

export type ApiTask = {
  id: string;
  title: string;
  subtitle: string | null;
  priority: "alta" | "media" | "baixa";
  done: boolean;
  dueDate: string | null;
  themeId: string | null;
};

export type ApiResource = {
  id: string;
  title: string;
  type: "curso" | "livro" | "link" | "plataforma" | "artigo";
  url: string | null;
  themeId: string | null;
  status: "nao_iniciado" | "em_andamento" | "concluido";
  progress: number;
};

export type ApiGoal = {
  id: string;
  title: string;
  period: "weekly" | "monthly" | "quarterly" | "yearly";
  targetHours: number | null;
  progress: number;
  dueDate: string | null;
  minutesLogged: number;
};

export type ApiStudySession = {
  id: string;
  title: string;
  durationMinutes: number;
  themeId: string | null;
  occurredAt: string;
};

export type ApiCertification = {
  id: string;
  name: string;
  provider: string | null;
  examDate: string | null;
  progress: number;
  themes: { id: string; name: string; progress: number }[];
};

export type ReportSummary = {
  totalMinutesLast30Days: number;
  last7Days: { date: string; minutes: number }[];
  distributionByTheme: { theme: string; minutes: number }[];
  streakDays: number;
};

export type SearchResult = {
  id: string;
  type: "tema" | "tarefa" | "material" | "certificacao";
  title: string;
};
