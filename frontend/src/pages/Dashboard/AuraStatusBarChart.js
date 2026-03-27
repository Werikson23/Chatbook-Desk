import React, { useMemo } from "react";
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
import CustomTooltip from "./CustomTooltip";
import { i18n } from "../../translate/i18n";

export default function AuraStatusBarChart({ statusBars }) {
  const dash = useDashboardStyles();
  const theme = useTheme();

  const chartData = useMemo(
    () =>
      statusBars.values.map((v, i) => ({
        name: i18n.t(statusBars.labelsKey[i]),
        volume: v,
        fill: statusBars.colors[i],
      })),
    [statusBars]
  );

  return (
    <div className={dash.auraChartCard}>
      <div className={dash.auraChartHeader}>
        <span className={dash.auraChartTitle}>{i18n.t("dashboard.aura.chartStatusTitle")}</span>
      </div>
      <div className={dash.auraChartBody}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 4" stroke={theme.palette.divider} vertical={false} />
            <XAxis dataKey="name" tickLine={false} axisLine={false} stroke={theme.palette.text.secondary} tick={{ fontSize: 10 }} interval={0} angle={-15} textAnchor="end" height={60} />
            <YAxis tickLine={false} axisLine={false} stroke={theme.palette.text.secondary} width={32} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: theme.palette.action.hover }} />
            <Bar dataKey="volume" radius={[6, 6, 0, 0]}>
              {chartData.map((e, i) => (
                <Cell key={i} fill={e.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
