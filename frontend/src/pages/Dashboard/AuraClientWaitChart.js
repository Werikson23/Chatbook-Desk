import React, { useMemo } from "react";
import { useTheme } from "@material-ui/core/styles";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useDashboardStyles } from "./dashboardStyles";
import CustomTooltip from "./CustomTooltip";
import { i18n } from "../../translate/i18n";

export default function AuraClientWaitChart({ responseTimeLine }) {
  const dash = useDashboardStyles();
  const theme = useTheme();

  const chartData = useMemo(
    () =>
      responseTimeLine.labels.map((label, i) => ({
        label,
        minutos: responseTimeLine.waitMinutes[i],
      })),
    [responseTimeLine]
  );

  return (
    <div className={dash.auraChartCard}>
      <div className={dash.auraChartHeader}>
        <span className={dash.auraChartTitle}>{i18n.t("dashboard.aura.chartWaitTitle")}</span>
      </div>
      <div className={dash.auraChartBody}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData.length ? chartData : [{ label: "-", minutos: 0 }]} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 4" stroke={theme.palette.divider} vertical={false} />
            <XAxis dataKey="label" tickLine={false} axisLine={false} stroke={theme.palette.text.secondary} tick={{ fontSize: 11 }} />
            <YAxis tickLine={false} axisLine={false} stroke={theme.palette.text.secondary} width={36} />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="minutos"
              name={i18n.t("dashboard.aura.legendWaitMinutes")}
              stroke="#ff9500"
              strokeWidth={2}
              dot={{ r: 4, fill: "#ff9500" }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
