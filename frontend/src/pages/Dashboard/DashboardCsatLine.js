import React from "react";
import Paper from "@material-ui/core/Paper";
import { useTheme } from "@material-ui/core/styles";
import { useDashboardStyles } from "./dashboardStyles";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import Title from "./Title";
import CustomTooltip from "./CustomTooltip";
import { i18n } from "../../translate/i18n";

export default function DashboardCsatLine({ data }) {
  const theme = useTheme();
  const dash = useDashboardStyles();
  const chartData = data.map((d) => ({
    ...d,
    label: i18n.t(d.dayKey),
  }));

  return (
    <Paper
      elevation={0}
      className={dash.extrasCard}
      style={{
        padding: theme.spacing(2.5),
        height: "100%",
        minHeight: 320,
      }}
    >
      <Title>{i18n.t("dashboard.extras.csatTitle")}</Title>
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 4" stroke={theme.palette.divider} />
          <XAxis dataKey="label" tickLine={false} axisLine={false} stroke={theme.palette.text.secondary} tick={{ fontSize: 11 }} />
          <YAxis domain={[0, 5]} tickLine={false} axisLine={false} stroke={theme.palette.text.secondary} width={32} />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="monotone"
            dataKey="score"
            stroke={theme.palette.primary.main}
            strokeWidth={2.5}
            dot={{ r: 4, fill: theme.palette.primary.main, strokeWidth: 0 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </Paper>
  );
}
