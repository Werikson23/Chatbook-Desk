import React, { useMemo } from "react";
import Grid from "@material-ui/core/Grid";
import Paper from "@material-ui/core/Paper";
import Typography from "@material-ui/core/Typography";
import { useTheme } from "@material-ui/core/styles";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useDashboardStyles } from "./dashboardStyles";
import { i18n } from "../../translate/i18n";

function TagsBarTooltip({ active, payload }) {
  const theme = useTheme();
  if (!active || !payload?.length) return null;
  const row = payload[0].payload;
  return (
    <Paper
      elevation={4}
      style={{
        padding: "10px 12px",
        borderRadius: 8,
        border: `1px solid ${theme.palette.divider}`,
        backgroundColor: theme.palette.background.paper,
      }}
    >
      <Typography variant="subtitle2" style={{ fontWeight: 600, marginBottom: 4 }}>
        {row.fullName}
      </Typography>
      <Typography variant="body2" color="textSecondary">
        {i18n.t("dashboard.aura.tagsTicketsLabel")}: <strong>{row.value}</strong>
      </Typography>
    </Paper>
  );
}

const CHART_MAX = 24;

function truncateLabel(s, max = 22) {
  if (!s || s.length <= max) return s || "";
  return `${s.slice(0, max)}…`;
}

export default function DashboardTagsSection({ tags }) {
  const dash = useDashboardStyles();
  const theme = useTheme();

  const sorted = useMemo(() => {
    if (!tags?.length) return [];
    return [...tags]
      .map((t) => ({
        ...t,
        n: Number(t.ticketsCount ?? 0),
        c: Number(t.contactsCount ?? 0),
      }))
      .sort((a, b) => b.n - a.n);
  }, [tags]);

  const chartRows = useMemo(() => {
    return sorted.slice(0, CHART_MAX).map((t) => ({
      name: truncateLabel(t.name),
      fullName: t.name,
      value: t.n,
      fill: t.color || theme.palette.primary.main,
    }));
  }, [sorted, theme.palette.primary.main]);

  const maxBar = useMemo(() => {
    if (!chartRows.length) return 1;
    return Math.max(...chartRows.map((r) => r.value), 1);
  }, [chartRows]);

  if (!tags?.length) {
    return (
      <Paper className={dash.tagsCardsPanel} elevation={0} style={{ minHeight: 120 }}>
        <Typography className={dash.sectionLabel} component="p" variant="body2" style={{ marginBottom: 8 }}>
          {i18n.t("dashboard.aura.tagsLiveTitle")}
        </Typography>
        <Typography variant="body2" color="textSecondary">
          {i18n.t("dashboard.aura.tagsEmpty")}
        </Typography>
      </Paper>
    );
  }

  return (
    <div className={dash.tagsSectionRoot}>
      <Typography className={dash.sectionLabel} component="p" variant="body2" style={{ marginBottom: 12 }}>
        {i18n.t("dashboard.aura.tagsLiveTitle")}
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} lg={7}>
          <Paper className={dash.auraChartCard} elevation={0} style={{ minHeight: 340 }}>
            <div className={dash.auraChartHeader}>
              <span className={dash.auraChartTitle}>{i18n.t("dashboard.aura.tagsChartTitle")}</span>
            </div>
            <div className={dash.auraChartBody}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartRows}
                  layout="vertical"
                  margin={{ top: 4, right: 12, left: 4, bottom: 4 }}
                  barCategoryGap={4}
                >
                  <CartesianGrid strokeDasharray="3 4" stroke={theme.palette.divider} horizontal={false} />
                  <XAxis
                    type="number"
                    domain={[0, maxBar]}
                    tickLine={false}
                    axisLine={false}
                    stroke={theme.palette.text.secondary}
                    tick={{ fontSize: 10 }}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={108}
                    tickLine={false}
                    axisLine={false}
                    stroke={theme.palette.text.secondary}
                    tick={{ fontSize: 10 }}
                  />
                  <Tooltip content={<TagsBarTooltip />} cursor={{ fill: theme.palette.action.hover }} />
                  <Bar dataKey="value" radius={[0, 6, 6, 0]} maxBarSize={22}>
                    {chartRows.map((entry, i) => (
                      <Cell key={`c-${i}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Paper>
        </Grid>
        <Grid item xs={12} lg={5}>
          <Paper className={dash.tagsCardsPanel} elevation={0}>
            <Typography className={dash.auraChartTitle} component="h3" variant="subtitle1" style={{ marginBottom: 4 }}>
              {i18n.t("dashboard.aura.tagsCardsTitle")}
            </Typography>
            <Typography variant="caption" color="textSecondary" display="block" style={{ marginBottom: 8 }}>
              {i18n.t("dashboard.aura.tagsCardsHint")}
            </Typography>
            <div className={dash.tagsCardsGrid}>
              {sorted.map((t) => (
                <Paper
                  key={t.id}
                  className={dash.tagStatCard}
                  elevation={0}
                  style={{
                    borderLeft: `4px solid ${t.color || theme.palette.primary.main}`,
                  }}
                >
                  <Typography className={dash.tagStatName} component="p" title={t.name}>
                    {t.name}
                  </Typography>
                  <Typography className={dash.tagStatValue} style={{ color: t.color || theme.palette.text.primary }}>
                    {t.n}
                  </Typography>
                  <Typography className={dash.tagStatMeta}>
                    {i18n.t("dashboard.aura.tagsTicketsLabel")}
                    {t.c > 0 ? ` · ${i18n.t("dashboard.aura.tagsContactsLabel")}: ${t.c}` : ""}
                  </Typography>
                </Paper>
              ))}
            </div>
          </Paper>
        </Grid>
      </Grid>
    </div>
  );
}
