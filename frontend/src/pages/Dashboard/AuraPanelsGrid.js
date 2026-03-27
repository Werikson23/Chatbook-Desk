import React from "react";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import { useDashboardStyles } from "./dashboardStyles";
import AuraCloseReasonsBar from "./AuraCloseReasonsBar";
import { i18n } from "../../translate/i18n";

export default function AuraPanelsGrid({
  realtime,
  slaAlerts,
  queues,
  agents,
  closeReasons,
  closeReasonsLive,
  followup,
}) {
  const dash = useDashboardStyles();

  const badgeClass = (status) => {
    if (status === "online") return `${dash.auraBadge} ${dash.auraBadgeOnline}`;
    if (status === "pause") return `${dash.auraBadge} ${dash.auraBadgePause}`;
    return `${dash.auraBadge} ${dash.auraBadgeOffline}`;
  };

  const badgeLabel = (status) => {
    if (status === "online") return i18n.t("dashboard.aura.badgeOnline");
    if (status === "pause") return i18n.t("dashboard.aura.badgePause");
    return i18n.t("dashboard.aura.badgeOffline");
  };

  return (
    <section className={dash.auraPanelsGrid}>
      <div className={dash.auraPanel}>
        <Typography className={dash.auraPanelTitle} component="h3" variant="subtitle1">
          {i18n.t("dashboard.aura.panelRealtimeTitle")}
        </Typography>
        <div className={dash.auraRtGrid}>
          <div className={dash.auraRtBox}>
            <span className={dash.auraRtLabel}>{i18n.t("dashboard.aura.rtCurrentQueue")}</span>
            <span className={dash.auraRtValue} style={{ color: "#ff3b30" }}>
              {realtime.queueWaiting} {i18n.t("dashboard.aura.rtWaitingSuffix")}
            </span>
          </div>
          <div className={dash.auraRtBox}>
            <span className={dash.auraRtLabel}>{i18n.t("dashboard.aura.rtAvgWait")}</span>
            <span className={dash.auraRtValue}>{realtime.avgWait}</span>
          </div>
          <div className={dash.auraRtBox}>
            <span className={dash.auraRtLabel}>{i18n.t("dashboard.aura.rtAgentsOnline")}</span>
            <span className={dash.auraRtValue} style={{ color: "#1db440" }}>
              {realtime.agentsOnline} {i18n.t("dashboard.aura.rtAvailableSuffix")}
            </span>
          </div>
          <div className={dash.auraRtBox}>
            <span className={dash.auraRtLabel}>{i18n.t("dashboard.aura.rtAgentsOnOff")}</span>
            <span className={dash.auraRtValue}>{realtime.busyPause}</span>
          </div>
        </div>
        <Typography style={{ fontSize: 12, color: "#86868b", margin: "16px 0 8px", textTransform: "uppercase", fontWeight: 600 }}>
          {i18n.t("dashboard.aura.alertsHeading")}
        </Typography>
        {slaAlerts.map((a) => (
          <div
            key={a.id}
            className={dash.auraAlertStrip}
            style={{
              background: a.variant === "danger" ? "#fff1f0" : "#fff9e6",
              borderLeft: `4px solid ${a.variant === "danger" ? "#ff3b30" : "#ffcc00"}`,
            }}
          >
            <span style={{ color: a.variant === "danger" ? "#1d1d1f" : "#856404" }}>
              {i18n.t(a.messageKey)}
            </span>
            <Button size="small" style={{ fontWeight: 700, color: a.variant === "danger" ? "#ff3b30" : "#856404" }}>
              {i18n.t(a.actionKey)}
            </Button>
          </div>
        ))}
      </div>

      <div className={dash.auraPanel}>
        <Typography className={dash.auraPanelTitle} component="h3" variant="subtitle1">
          {i18n.t("dashboard.aura.panelQueuesTitle")}
        </Typography>
        <table className={dash.auraTable} style={{ marginBottom: 20 }}>
          <thead>
            <tr>
              <th>{i18n.t("dashboard.aura.thQueue")}</th>
              <th>{i18n.t("dashboard.aura.thWaiting")}</th>
              <th>{i18n.t("dashboard.aura.thAgents")}</th>
            </tr>
          </thead>
          <tbody>
            {queues.map((q, i) => (
              <tr key={q.nameKey || q.name || i}>
                <td>{q.name != null ? q.name : i18n.t(q.nameKey)}</td>
                <td>
                  <strong style={{ color: q.waitingHighlight ? "#ff3b30" : undefined }}>{q.waiting}</strong>
                </td>
                <td>{q.agents}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <Typography className={dash.auraPanelTitle} component="h3" variant="subtitle1">
          {i18n.t("dashboard.aura.panelAgentsTitle")}
        </Typography>
        <table className={dash.auraTable}>
          <thead>
            <tr>
              <th>{i18n.t("dashboard.aura.thAgent")}</th>
              <th>{i18n.t("dashboard.aura.thTickets")}</th>
              <th>CSAT</th>
              <th>{i18n.t("dashboard.aura.thStatus")}</th>
            </tr>
          </thead>
          <tbody>
            {agents.map((ag) => (
              <tr key={ag.name}>
                <td>{ag.name}</td>
                <td>{ag.tickets}</td>
                <td>{ag.csat}</td>
                <td>
                  <span className={badgeClass(ag.status)}>{badgeLabel(ag.status)}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className={dash.auraPanel}>
        <Typography className={dash.auraPanelTitle} component="h3" variant="subtitle1">
          {i18n.t("dashboard.aura.panelReasonsTitle")}
        </Typography>
        <AuraCloseReasonsBar closeReasons={closeReasons} liveStats={closeReasonsLive} />
        <Typography className={dash.auraPanelTitle} component="h3" variant="subtitle1">
          {i18n.t("dashboard.aura.panelFollowupTitle")}
        </Typography>
        <table className={dash.auraTable}>
          <tbody>
            {followup.map((f, i) => (
              <tr key={i}>
                <td>{i18n.t(f.labelKey)}</td>
                <td>{i18n.t(f.valueKey)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
