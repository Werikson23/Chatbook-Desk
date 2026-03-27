import React from "react";
import Paper from "@material-ui/core/Paper";
import { alpha, useTheme } from "@material-ui/core/styles";
import { useDashboardStyles } from "./dashboardStyles";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import Title from "./Title";
import CustomTooltip from "./CustomTooltip";
import { i18n } from "../../translate/i18n";

export default function DashboardDemandPeaks({ data }) {
  const theme = useTheme();
  const dash = useDashboardStyles();
  const chartData = data.map((d) => ({
    ...d,
    label: `${d.hour}h`,
  }));

  return (
    <Paper
      elevation={0}
      className={dash.extrasCard}
      style={{
        padding: theme.spacing(2.5),
        minHeight: 300,
      }}
    >
      <Title>{i18n.t("dashboard.extras.demandPeaksTitle")}</Title>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 4" stroke={theme.palette.divider} vertical={false} />
          <XAxis dataKey="label" tickLine={false} axisLine={false} stroke={theme.palette.text.secondary} tick={{ fontSize: 11 }} />
          <YAxis allowDecimals={false} tickLine={false} axisLine={false} stroke={theme.palette.text.secondary} width={32} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: theme.palette.action.hover }} />
          <Bar dataKey="volume" radius={[6, 6, 0, 0]} fill={alpha(theme.palette.primary.main, 0.9)} />
        </BarChart>
      </ResponsiveContainer>
    </Paper>
  );
}
