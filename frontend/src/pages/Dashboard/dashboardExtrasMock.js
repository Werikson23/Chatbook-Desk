/**
 * Dados de demonstração para o painel “Aura” até os endpoints existirem.
 * Trocar `fetchDashboardExtras` para `api.get("/dashboard/extras")` quando o back estiver pronto.
 */

export const DASHBOARD_EXTRAS_MOCK = {
  insight: {
    titleKey: "dashboard.extras.insightTitle",
    bodyKey: "dashboard.extras.insightBody",
    variant: "info",
  },
  sla: [
    {
      id: "firstResponse",
      labelKey: "dashboard.extras.slaFirstResponse",
      targetPct: 92,
      currentPct: 78,
    },
    {
      id: "resolution",
      labelKey: "dashboard.extras.slaResolution",
      targetPct: 88,
      currentPct: 84,
    },
    {
      id: "reopen",
      labelKey: "dashboard.extras.slaReopen",
      targetPct: 95,
      currentPct: 91,
    },
  ],
  channels: [
    { nameKey: "dashboard.extras.channelWhatsapp", value: 412 },
    { nameKey: "dashboard.extras.channelInstagram", value: 128 },
    { nameKey: "dashboard.extras.channelMessenger", value: 64 },
    { nameKey: "dashboard.extras.channelWebchat", value: 47 },
    { nameKey: "dashboard.extras.channelEmail", value: 31 },
  ],
  csatTrend: [
    { dayKey: "dashboard.extras.weekdayMon", score: 3.8 },
    { dayKey: "dashboard.extras.weekdayTue", score: 4.1 },
    { dayKey: "dashboard.extras.weekdayWed", score: 4.0 },
    { dayKey: "dashboard.extras.weekdayThu", score: 4.3 },
    { dayKey: "dashboard.extras.weekdayFri", score: 4.2 },
    { dayKey: "dashboard.extras.weekdaySat", score: 4.5 },
    { dayKey: "dashboard.extras.weekdaySun", score: 4.4 },
  ],
  demandPeaks: [
    { hour: "08", volume: 12 },
    { hour: "09", volume: 28 },
    { hour: "10", volume: 45 },
    { hour: "11", volume: 38 },
    { hour: "12", volume: 22 },
    { hour: "13", volume: 18 },
    { hour: "14", volume: 36 },
    { hour: "15", volume: 41 },
    { hour: "16", volume: 33 },
    { hour: "17", volume: 25 },
  ],
  geo: {
    centerLabelKey: "dashboard.extras.geoCenterLabel",
    points: [
      { id: "sp", label: "São Paulo", leftPct: 52, topPct: 68, volume: 184 },
      { id: "rj", label: "Rio", leftPct: 58, topPct: 62, volume: 96 },
      { id: "bh", label: "BH", leftPct: 48, topPct: 55, volume: 71 },
      { id: "bsb", label: "Brasília", leftPct: 45, topPct: 48, volume: 54 },
      { id: "poa", label: "Porto Alegre", leftPct: 42, topPct: 82, volume: 43 },
    ],
  },
  responseMix: [
    { nameKey: "dashboard.extras.mixHuman", value: 72, color: "#007aff" },
    { nameKey: "dashboard.extras.mixBot", value: 21, color: "#5ac8fa" },
    { nameKey: "dashboard.extras.mixTransferred", value: 7, color: "#8e8e93" },
  ],

  /** Layout “Intelligence Hub” (mock HTML Aura Pro) — Recharts no React */
  aura: {
    kpis: [
      { id: "openChats", labelKey: "dashboard.aura.kpiOpenChats", value: "124", trend: "down", trendKey: "dashboard.aura.trendHighLoad" },
      { id: "newToday", labelKey: "dashboard.aura.kpiNewToday", value: "32", trend: "up", trendKey: "dashboard.aura.trendVsYesterday" },
      { id: "avgResponse", labelKey: "dashboard.aura.kpiAvgResponse", value: "2m 14s", trend: "up", trendKey: "dashboard.aura.trendExcellent" },
      { id: "slaMet", labelKey: "dashboard.aura.kpiSlaMet", value: "94.2%", trend: "up", trendKey: "dashboard.aura.trendGoalMet" },
      { id: "resolutionRate", labelKey: "dashboard.aura.kpiResolutionRate", value: "88%", trend: "up", trendKey: "dashboard.aura.trendVsYesterday3" },
      { id: "avgResolution", labelKey: "dashboard.aura.kpiAvgResolution", value: "14m 30s", trend: "neutral", trendKey: "dashboard.aura.trendStable" },
      { id: "csat", labelKey: "dashboard.aura.kpiCsat", value: "4.8", trend: "neutral", trendKey: "dashboard.aura.trendHighSat", suffix: "/5" },
      { id: "conversions", labelKey: "dashboard.aura.kpiConversions", value: "R$ 12.4k", trend: "up", trendKey: "dashboard.aura.trendClosedDeals" },
    ],
    volumeLine: {
      labelKeys: [
        "dashboard.extras.weekdayMon",
        "dashboard.extras.weekdayTue",
        "dashboard.extras.weekdayWed",
        "dashboard.extras.weekdayThu",
        "dashboard.extras.weekdayFri",
        "dashboard.extras.weekdaySat",
        "dashboard.extras.weekdaySun",
      ],
      newContacts: [45, 60, 38, 90, 110, 50, 40],
      resolved: [40, 55, 40, 85, 100, 45, 38],
    },
    responseTimeLine: {
      labels: ["08h", "10h", "12h", "14h", "16h", "18h"],
      waitMinutes: [1.2, 1.5, 3.0, 4.5, 2.1, 1.1],
    },
    originDonut: {
      labelsKey: [
        "dashboard.extras.channelWhatsapp",
        "dashboard.aura.channelInstagram",
        "dashboard.aura.channelSite",
        "dashboard.extras.channelEmail",
        "dashboard.aura.channelTelegram",
      ],
      data: [62, 18, 12, 5, 3],
      colors: ["#34c759", "#ff2d55", "#007aff", "#8e8e93", "#32ade6"],
    },
    statusBars: {
      labelsKey: [
        "dashboard.aura.statusOpen",
        "dashboard.aura.statusInProgress",
        "dashboard.aura.statusAwaiting",
        "dashboard.aura.statusResolved",
        "dashboard.aura.statusClosed",
      ],
      values: [35, 42, 18, 85, 120],
      colors: ["#ff3b30", "#007aff", "#ff9500", "#34c759", "#8e8e93"],
    },
    realtime: {
      queueWaiting: "18",
      avgWait: "1m 12s",
      agentsOnline: "6",
      busyPause: "5 / 1",
    },
    slaAlerts: [
      { id: "a1", variant: "danger", messageKey: "dashboard.aura.alertSlaBreach", actionKey: "dashboard.aura.alertView" },
      { id: "a2", variant: "warn", messageKey: "dashboard.aura.alertQueueSales", actionKey: "dashboard.aura.alertOk" },
    ],
    queues: [
      { nameKey: "dashboard.aura.queueSales", waiting: 12, agents: 3, waitingHighlight: true },
      { nameKey: "dashboard.aura.queueSupport", waiting: 6, agents: 2 },
      { nameKey: "dashboard.aura.queueFinance", waiting: 0, agents: 1 },
    ],
    agents: [
      { name: "João Silva", tickets: 32, csat: "4.9", status: "online" },
      { name: "Maria Souza", tickets: 28, csat: "4.8", status: "online" },
      { name: "Ana Paula", tickets: 15, csat: "4.5", status: "pause" },
    ],
    closeReasons: {
      labelsKey: [
        "dashboard.aura.reasonResolved",
        "dashboard.aura.reasonSale",
        "dashboard.aura.reasonQuote",
        "dashboard.aura.reasonNoReply",
        "dashboard.aura.reasonSpam",
      ],
      values: [120, 85, 45, 20, 5],
    },
    followup: [
      { labelKey: "dashboard.aura.followAwaiting", valueKey: "dashboard.aura.followAwaitingVal" },
      { labelKey: "dashboard.aura.followPostSale", valueKey: "dashboard.aura.followPostSaleVal" },
      { labelKey: "dashboard.aura.followQuote", valueKey: "dashboard.aura.followQuoteVal" },
      { labelKey: "dashboard.aura.followAi", valueKey: "dashboard.aura.followAiVal" },
    ],
    aiInsight: {
      titleKey: "dashboard.aura.aiTitle",
      bodyKey: "dashboard.aura.aiBody",
    },
  },
};

export function fetchDashboardExtras() {
  return Promise.resolve({
    ...DASHBOARD_EXTRAS_MOCK,
    _mock: true,
    fetchedAt: new Date().toISOString(),
  });
}
