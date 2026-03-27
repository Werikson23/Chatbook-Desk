import React from "react";
import Typography from "@material-ui/core/Typography";
import TrendingUpIcon from "@material-ui/icons/TrendingUp";
import TrendingDownIcon from "@material-ui/icons/TrendingDown";
import TrendingFlatIcon from "@material-ui/icons/TrendingFlat";
import WhatshotIcon from "@material-ui/icons/Whatshot";
import FlashOnIcon from "@material-ui/icons/FlashOn";
import CheckIcon from "@material-ui/icons/Check";
import StarIcon from "@material-ui/icons/Star";
import ShoppingCartIcon from "@material-ui/icons/ShoppingCart";
import { useDashboardStyles } from "./dashboardStyles";
import { i18n } from "../../translate/i18n";

const trendIcon = (trend) => {
  if (trend === "up") return <TrendingUpIcon style={{ fontSize: 14 }} />;
  if (trend === "down") return <TrendingDownIcon style={{ fontSize: 14 }} />;
  return <TrendingFlatIcon style={{ fontSize: 14 }} />;
};

const extraIcon = (id) => {
  switch (id) {
    case "openChats":
      return <WhatshotIcon style={{ fontSize: 14 }} />;
    case "newToday":
      return <TrendingUpIcon style={{ fontSize: 14 }} />;
    case "avgResponse":
      return <FlashOnIcon style={{ fontSize: 14 }} />;
    case "slaMet":
      return <CheckIcon style={{ fontSize: 14 }} />;
    case "csat":
      return <StarIcon style={{ fontSize: 14 }} />;
    case "conversions":
      return <ShoppingCartIcon style={{ fontSize: 14 }} />;
    default:
      return trendIcon("neutral");
  }
};

export default function AuraKpiGrid({ kpis }) {
  const dash = useDashboardStyles();

  return (
    <section className={dash.auraKpiGrid}>
      {kpis.map((k) => (
        <div key={k.id} className={dash.auraKpiCard}>
          <span className={dash.auraKpiLabel}>{i18n.t(k.labelKey)}</span>
          <span className={dash.auraKpiValue}>
            {k.value}
            {k.suffix ? (
              <Typography component="span" style={{ fontSize: "0.875rem", color: "#86868b" }}>
                {k.suffix}
              </Typography>
            ) : null}
          </span>
          <span
            className={`${dash.auraKpiTrend} ${
              k.trend === "up" ? dash.trendUp : k.trend === "down" ? dash.trendDown : dash.trendNeutral
            }`}
          >
            {k.id === "openChats" || k.id === "newToday" || k.id === "avgResponse" || k.id === "slaMet" || k.id === "conversions" || k.id === "csat"
              ? extraIcon(k.id)
              : trendIcon(k.trend)}
            {i18n.t(k.trendKey)}
          </span>
        </div>
      ))}
    </section>
  );
}
