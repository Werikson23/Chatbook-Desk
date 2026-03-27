import React, { useMemo } from "react";
import { useTheme } from "@material-ui/core/styles";
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { useDashboardStyles } from "./dashboardStyles";
import CustomTooltip from "./CustomTooltip";
import { i18n } from "../../translate/i18n";

const DEFAULT_DONUT_COLORS = ["#34c759", "#ff2d55", "#007aff", "#8e8e93", "#32ade6", "#af52de", "#ff9500"];

export default function AuraOriginDonutChart({ originDonut, liveChannels }) {
  const dash = useDashboardStyles();
  const theme = useTheme();

  const chartData = useMemo(() => {
    if (liveChannels?.length) {
      return liveChannels.map((row, i) => ({
        name: row.label || row.channel,
        value: Number(row.value ?? row.count ?? 0),
        color: row.color || DEFAULT_DONUT_COLORS[i % DEFAULT_DONUT_COLORS.length],
      }));
    }
    return originDonut.data.map((v, i) => ({
      name: i18n.t(originDonut.labelsKey[i]),
      value: v,
      color: originDonut.colors[i],
    }));
  }, [originDonut, liveChannels]);

  return (
    <div className={dash.auraChartCard}>
      <div className={dash.auraChartHeader}>
        <span className={dash.auraChartTitle}>{i18n.t("dashboard.aura.chartOriginTitle")}</span>
      </div>
      <div className={dash.auraChartBody} style={{ minHeight: 260 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius="68%"
              outerRadius="88%"
              paddingAngle={1}
              dataKey="value"
            >
              {chartData.map((e, i) => (
                <Cell key={e.name} fill={e.color} stroke={theme.palette.background.paper} strokeWidth={2} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="middle"
              align="right"
              layout="vertical"
              wrapperStyle={{ fontSize: 11 }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
