import React from "react";
import Paper from "@material-ui/core/Paper";
import { useTheme } from "@material-ui/core/styles";
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

export default function DashboardChannelsBar({ data }) {
  const theme = useTheme();
  const dash = useDashboardStyles();
  const chartData = data.map((d) => ({
    ...d,
    name: i18n.t(d.nameKey),
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
      <Title>{i18n.t("dashboard.extras.channelsTitle")}</Title>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 8, right: 16, left: 8, bottom: 8 }}
        >
          <CartesianGrid strokeDasharray="3 4" stroke={theme.palette.divider} />
          <XAxis type="number" allowDecimals={false} stroke={theme.palette.text.secondary} tickLine={false} />
          <YAxis
            type="category"
            dataKey="name"
            width={100}
            stroke={theme.palette.text.secondary}
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 12 }}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: theme.palette.action.hover }} />
          <Bar dataKey="value" radius={[0, 6, 6, 0]} fill={theme.palette.primary.main} />
        </BarChart>
      </ResponsiveContainer>
    </Paper>
  );
}
