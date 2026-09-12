import { ApiError } from "@/lib/api-error";
import { competitionRepository } from "@/repositories/competitionRepository";
import { createCompetitionSeasonSchema } from "@/validations/competition";

const SCORE_SCALE = 1000;
const PERFORMANCE_WEIGHT = 0.5;
const CERTIFICATE_WEIGHT = 0.3;
const CONSISTENCY_WEIGHT = 0.2;

function normalize(value: number, max: number) {
  if (max <= 0 || value <= 0) return 0;
  return Math.round((value / max) * 100);
}

export const competitionService = {
  async createSeason(input: unknown) {
    const data = createCompetitionSeasonSchema.parse(input);
    const now = new Date();
    const status = data.startsAt <= now && data.endsAt > now ? "active" : "scheduled";
    return competitionRepository.createSeason({ ...data, status } as never);
  },

  async listSeasons() {
    return competitionRepository.listSeasons();
  },

  async getSeason(id: string) {
    const season = await competitionRepository.findSeasonById(id);
    if (!season) throw new ApiError(404, "Competition season not found");
    return season;
  },

  async getCurrentSeason() {
    const season = await competitionRepository.findCurrentSeason();
    if (!season) throw new ApiError(404, "No active competition season");
    return season;
  },

  async ranking(seasonId: string) {
    const season = await this.getSeason(seasonId);

    if (season.status === "closed") {
      return competitionRepository.listResults(seasonId);
    }

    const [users, study, task, certificates] = await Promise.all([
      competitionRepository.activeUsers(),
      competitionRepository.studyMetrics(season.startsAt, season.endsAt),
      competitionRepository.taskMetrics(season.startsAt, season.endsAt),
      competitionRepository.certificateMetrics(),
    ]);

    const studyMap = new Map(study.map((item) => [item.userId, item]));
    const taskMap = new Map(task.map((item) => [item.userId, item]));
    const certificateMap = new Map(certificates.map((item) => [item.userId, item]));

    const raw = users.map((user) => {
      const studyData = studyMap.get(user.id);
      const taskData = taskMap.get(user.id);
      const certificateData = certificateMap.get(user.id);
      const minutes = Number(studyData?.minutes ?? 0);
      const completedTasks = Number(taskData?.completed ?? 0);
      const activeDays = Number(studyData?.activeDays ?? 0);
      const certificatePoints = Number(certificateData?.points ?? 0);
      const certificateCount = Number(certificateData?.certificates ?? 0);
      const performanceRaw = minutes + completedTasks * 30;

      return {
        userId: user.id,
        userName: user.name,
        performanceRaw,
        activeDays,
        certificatePointsRaw: certificatePoints,
        certificates: certificateCount,
      };
    });

    const maxPerformance = Math.max(0, ...raw.map((item) => item.performanceRaw));
    const maxConsistency = Math.max(0, ...raw.map((item) => item.activeDays));
    const maxCertificates = Math.max(0, ...raw.map((item) => item.certificatePointsRaw));

    const ranked = raw
      .map((item) => {
        const performanceScore = normalize(item.performanceRaw, maxPerformance);
        const certificateScore = normalize(item.certificatePointsRaw, maxCertificates);
        const consistencyScore = normalize(item.activeDays, maxConsistency);
        const performancePoints = Math.round(
          performanceScore * SCORE_SCALE * (PERFORMANCE_WEIGHT / 100) +
            consistencyScore * SCORE_SCALE * (CONSISTENCY_WEIGHT / 100),
        );
        const certificatePoints = Math.round(
          certificateScore * SCORE_SCALE * (CERTIFICATE_WEIGHT / 100),
        );
        const score = performancePoints + certificatePoints;

        return {
          ...item,
          score,
          performancePoints,
          certificatePoints,
          consistencyPoints: Math.round(
            consistencyScore * SCORE_SCALE * (CONSISTENCY_WEIGHT / 100),
          ),
        };
      })
      .sort(
        (a, b) =>
          b.score - a.score ||
          b.performancePoints - a.performancePoints ||
          b.certificatePoints - a.certificatePoints ||
          a.userId.localeCompare(b.userId),
      )
      .map((item, index) => ({ ...item, position: index + 1 }));

    return ranked;
  },

  async me(userId: string) {
    const season = await this.getCurrentSeason();
    const ranking = await this.ranking(season.id);
    return {
      season,
      result: ranking.find((item) => item.userId === userId) ?? {
        userId,
        position: null,
        score: 0,
        performancePoints: 0,
        certificatePoints: 0,
        consistencyPoints: 0,
        certificates: 0,
      },
    };
  },

  async closeSeason(id: string) {
    const season = await this.getSeason(id);
    if (season.status === "closed") return season;

    const ranking = await this.ranking(id);
    await competitionRepository.snapshotResults(
      id,
      ranking.map((item) => ({
        userId: item.userId,
        score: item.score,
        position: item.position,
        certificates: item.certificates,
        performancePoints: item.performancePoints,
        certificatePoints: item.certificatePoints,
      })),
    );

    return competitionRepository.closeSeason(id);
  },
};
