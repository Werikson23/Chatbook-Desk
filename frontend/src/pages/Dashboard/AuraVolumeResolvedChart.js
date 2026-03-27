import React, { useMemo, useState } from "react";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";
import { useTheme } from "@material-ui/core/styles";
import { makeStyles } from "@material-ui/core/styles";
import {
  CartesianGrid,
  Legend,
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

const useSel = makeStyles(() => ({
  root: {
    fontSize: "0.75rem",
    fontWeight: 600,
    color: "#007aff",
  },
}));

function formatLiveLabel(key, field) {
  if (!key) return "";
  if (field === "day" && key.length <= 10) {
    try {
      const d = new Date(`${key}T12:00:00`);
      return d.toLocaleDateString(undefined, { month: "short", day: "2-digit" });
    } catch (_) {
      return key;
    }
  }
  if (key.includes("T")) {
    try {
      const d = new Date(key);
      return d.toLocaleString(undefined, { month: "short", day: "2-digit", hour: "2-digit", minute: "2-digit" });
    } catch (_) {
      return key;
    }
  }
  return key;
}

export default function AuraVolumeResolvedChart({ volumeLine, liveVolume }) {
  const dash = useDashboardStyles();
  const theme = useTheme();
  const sel = useSel();
  const [granularity, setGranularity] = useState("daily");

  const chartData = useMemo(() => {
    if (granularity === "daily" && liveVolume?.chartData?.length) {
      return liveVolume.chartData.map((row) => ({
        ...row,
        label: formatLiveLabel(row.label, liveVolume.field),
      }));
    }
    const labels = (volumeLine.labelKeys || []).map((k) => i18n.t(k));
    if (granularity === "hourly") {
      return ["08h", "10h", "12h", "14h", "16h", "18h"].map((h, i) => ({
        label: h,
        novos: [12, 22, 28, 35, 30, 18][i],
        resolvidos: [10, 20, 25, 32, 27, 15][i],
      }));
    }
    return labels.map((label, i) => ({
      label,
      novos: volumeLine.newContacts[i],
      resolvidos: volumeLine.resolved[i],
    }));
  }, [volumeLine, granularity, liveVolume]);

  return (
    <div className={dash.auraChartCard}>
      <div className={dash.auraChartHeader}>
        <span className={dash.auraChartTitle}>{i18n.t("dashboard.aura.chartVolumeTitle")}</span>
        <FormControl size="small">
          <Select
            value={granularity}
            onChange={(e) => setGranularity(e.target.value)}
            classes={{ root: sel.root }}
            disableUnderline
          >
            <MenuItem value="daily">{i18n.t("dashboard.aura.granularityDaily")}</MenuItem>
            <MenuItem value="hourly">{i18n.t("dashboard.aura.granularityHourly")}</MenuItem>
          </Select>
        </FormControl>
      </div>
      <div className={dash.auraChartBody}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 4" stroke={theme.palette.divider} vertical={false} />
            <XAxis dataKey="label" tickLine={false} axisLine={false} stroke={theme.palette.text.secondary} tick={{ fontSize: 11 }} />
            <YAxis tickLine={false} axisLine={false} stroke={theme.palette.text.secondary} width={32} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Line
              type="monotone"
              dataKey="novos"
              name={i18n.t("dashboard.aura.legendNewContacts")}
              stroke="#007aff"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 5 }}
            />
            <Line
              type="monotone"
              dataKey="resolvidos"
              name={i18n.t("dashboard.aura.legendResolved")}
              stroke="#34c759"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
