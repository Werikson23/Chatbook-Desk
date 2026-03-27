import React, { useMemo } from "react";
import { alpha } from "@material-ui/core/styles";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import CustomTooltip from "./CustomTooltip";
import { i18n } from "../../translate/i18n";

export default function AuraCloseReasonsBar({ closeReasons, liveStats, height = 160 }) {
  const chartData = useMemo(() => {
    if (liveStats != null) {
      return liveStats.map((r) => ({
        name: r.name,
        v: Number(r.count ?? 0),
      }));
    }
    return closeReasons.values.map((v, i) => ({
      name: i18n.t(closeReasons.labelsKey[i]),
      v,
    }));
  }, [closeReasons, liveStats]);

  return (
    <div style={{ height, marginBottom: 16 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} layout="vertical" margin={{ top: 4, right: 8, left: 8, bottom: 4 }}>
          <XAxis type="number" hide />
          <YAxis
            type="category"
            dataKey="name"
            width={88}
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 10 }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="v" radius={[0, 4, 4, 0]} fill={alpha("#af52de", 0.95)} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
