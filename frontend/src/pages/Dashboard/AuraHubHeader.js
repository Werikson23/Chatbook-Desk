import React from "react";
import Typography from "@material-ui/core/Typography";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";
import TodayIcon from "@material-ui/icons/Today";
import { useDashboardStyles } from "./dashboardStyles";
import { i18n } from "../../translate/i18n";

/**
 * quickFilter: 'today' | 7 | 30
 */
export default function AuraHubHeader({
  quickFilter,
  onQuickFilter,
  channelFilter,
  onChannelFilter,
  queueFilter,
  onQueueFilter,
  queueOptions = [],
}) {
  const dash = useDashboardStyles();

  return (
    <div className={dash.auraHeaderRow}>
      <div>
        <Typography className={dash.auraEyebrow} component="p">
          {i18n.t("dashboard.aura.eyebrow")}
        </Typography>
        <Typography className={dash.auraHubTitle} component="h1" variant="h4">
          {i18n.t("dashboard.aura.hubTitle")}
        </Typography>
      </div>
      <div className={dash.auraFilterCluster}>
        <div className={dash.auraSegment}>
          <button
            type="button"
            className={`${dash.auraSegBtn} ${quickFilter === "today" ? dash.auraSegBtnActive : ""}`}
            onClick={() => onQuickFilter("today")}
          >
            {i18n.t("dashboard.aura.filterToday")}
          </button>
          <button
            type="button"
            className={`${dash.auraSegBtn} ${quickFilter === 7 ? dash.auraSegBtnActive : ""}`}
            onClick={() => onQuickFilter(7)}
          >
            {i18n.t("dashboard.aura.filter7d")}
          </button>
          <button
            type="button"
            className={`${dash.auraSegBtn} ${quickFilter === 30 ? dash.auraSegBtnActive : ""}`}
            onClick={() => onQuickFilter(30)}
          >
            {i18n.t("dashboard.aura.filter30d")}
          </button>
          <button
            type="button"
            className={`${dash.auraSegBtn} ${quickFilter === "custom" ? dash.auraSegBtnActive : ""}`}
            onClick={() => onQuickFilter("custom")}
            title={i18n.t("dashboard.aura.filterCustomHint")}
          >
            <TodayIcon style={{ fontSize: 18, opacity: 0.85 }} />
          </button>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
          <FormControl size="small" className={dash.auraSelect}>
            <Select
              variant="outlined"
              value={channelFilter}
              onChange={(e) => onChannelFilter(e.target.value)}
              displayEmpty
              style={{
                fontSize: "0.75rem",
                borderRadius: 8,
              }}
            >
              <MenuItem value="all">{i18n.t("dashboard.aura.channelAll")}</MenuItem>
              <MenuItem value="whatsapp">{i18n.t("dashboard.extras.channelWhatsapp")}</MenuItem>
              <MenuItem value="instagram">{i18n.t("dashboard.aura.channelInstagram")}</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" className={dash.auraSelect}>
            <Select
              variant="outlined"
              value={queueFilter}
              onChange={(e) => onQueueFilter(e.target.value)}
              displayEmpty
              style={{
                fontSize: "0.75rem",
                borderRadius: 8,
              }}
            >
              <MenuItem value="all">{i18n.t("dashboard.aura.queueAll")}</MenuItem>
              {queueOptions.map((q) => (
                <MenuItem key={q.id} value={String(q.id)}>
                  {q.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>
      </div>
    </div>
  );
}
