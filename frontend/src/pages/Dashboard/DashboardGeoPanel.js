import React, { useMemo } from "react";
import Paper from "@material-ui/core/Paper";
import Typography from "@material-ui/core/Typography";
import Box from "@material-ui/core/Box";
import { makeStyles } from "@material-ui/core/styles";
import { alpha } from "@material-ui/core/styles";
import Title from "./Title";
import { useDashboardStyles } from "./dashboardStyles";
import { i18n } from "../../translate/i18n";

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(2.5),
    position: "relative",
    overflow: "hidden",
  },
  mapWrap: {
    position: "relative",
    height: 240,
    borderRadius: 12,
    overflow: "hidden",
    marginTop: theme.spacing(1),
    background:
      theme.palette.type === "dark"
        ? `linear-gradient(165deg, ${alpha("#64b5f6", 0.25)} 0%, ${alpha("#2e7d32", 0.2)} 55%, ${theme.palette.background.default} 100%)`
        : "linear-gradient(165deg, #c9e6ff 0%, #d4e9d4 50%, #eef5e8 100%)",
  },
  svg: {
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
    opacity: theme.palette.type === "dark" ? 0.35 : 0.5,
  },
  point: {
    position: "absolute",
    transform: "translate(-50%, -50%)",
    width: 12,
    height: 12,
    borderRadius: "50%",
    backgroundColor: theme.palette.primary.main,
    border: `3px solid ${theme.palette.background.paper}`,
    boxShadow: theme.shadows[2],
    cursor: "default",
  },
  pointRing: {
    position: "absolute",
    transform: "translate(-50%, -50%)",
    width: 28,
    height: 28,
    borderRadius: "50%",
    border: `1px solid ${alpha(theme.palette.primary.main, 0.45)}`,
    pointerEvents: "none",
  },
  label: {
    position: "absolute",
    transform: "translate(-50%, 18px)",
    fontSize: 10,
    fontWeight: 600,
    color: theme.palette.text.primary,
    textShadow:
      theme.palette.type === "dark"
        ? "0 0 6px rgba(0,0,0,0.8)"
        : "0 0 4px rgba(255,255,255,0.9)",
    whiteSpace: "nowrap",
    pointerEvents: "none",
    maxWidth: 88,
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  footer: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    gap: theme.spacing(1),
    marginTop: theme.spacing(2),
  },
  dddBlock: {
    marginTop: theme.spacing(2),
    paddingTop: theme.spacing(1.5),
    borderTop: `1px solid ${theme.palette.divider}`,
  },
  regionHeading: {
    fontSize: "0.75rem",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.04em",
    marginTop: theme.spacing(1.5),
    marginBottom: 4,
    color: theme.palette.text.secondary,
  },
  dddRow: {
    fontSize: "0.8125rem",
    display: "flex",
    justifyContent: "space-between",
    gap: 8,
    padding: "2px 0",
  },
  dddScroll: {
    maxHeight: 220,
    overflowY: "auto",
    paddingRight: 4,
    ...theme.scrollbarStyles,
  },
}));

function pointCaption(p) {
  if (p.label != null) {
    return p.volume != null ? `${p.label} · ${p.volume}` : p.label;
  }
  if (p.labelKey) {
    const name = i18n.t(p.labelKey);
    return p.volume != null ? `${name} · ${p.volume}` : name;
  }
  return "";
}

export default function DashboardGeoPanel({ geo }) {
  const classes = useStyles();
  const dash = useDashboardStyles();

  const isLiveDdd = Array.isArray(geo?.ddds);

  const groupedDdds = useMemo(() => {
    if (!isLiveDdd || !geo.regions?.length) return [];
    return geo.regions.map((r) => ({
      regionId: r.regionId,
      labelKey: r.labelKey,
      count: r.count,
      items: geo.ddds.filter((d) => d.regionId === r.regionId),
    }));
  }, [geo, isLiveDdd]);

  const points = geo?.points ?? [];

  return (
    <Paper className={`${classes.root} ${dash.extrasCard}`} elevation={0}>
      <Title>{i18n.t("dashboard.extras.geoTitle")}</Title>
      <Typography variant="body2" color="textSecondary" style={{ fontSize: "0.8125rem" }}>
        {i18n.t(isLiveDdd ? "dashboard.extras.geoSubtitleDdd" : "dashboard.extras.geoSubtitle")}
      </Typography>

      <div className={classes.mapWrap}>
        <svg className={classes.svg} viewBox="0 0 400 220" preserveAspectRatio="xMidYMid slice">
          <ellipse cx="200" cy="200" rx="280" ry="120" fill={alpha("#4caf50", 0.15)} />
          <ellipse cx="160" cy="120" rx="140" ry="80" fill={alpha("#2196f3", 0.12)} />
          <path
            d="M40 140 Q120 80 200 100 T360 120 Q320 180 200 200 T40 140"
            fill="none"
            stroke={alpha("#1976d2", 0.2)}
            strokeWidth="2"
          />
        </svg>

        {points.map((p) => {
          const cap = pointCaption(p);
          return (
            <React.Fragment key={p.id}>
              <span
                className={classes.pointRing}
                style={{ left: `${p.leftPct}%`, top: `${p.topPct}%` }}
              />
              <span
                className={classes.point}
                style={{ left: `${p.leftPct}%`, top: `${p.topPct}%` }}
                title={cap}
              />
              <span className={classes.label} style={{ left: `${p.leftPct}%`, top: `${p.topPct}%` }}>
                {cap}
              </span>
            </React.Fragment>
          );
        })}
      </div>

      <div className={classes.footer}>
        <Typography variant="caption" color="textSecondary">
          {geo.totalWithDdd != null
            ? i18n.t(geo.centerLabelKey, { count: geo.totalWithDdd })
            : i18n.t(geo.centerLabelKey)}
        </Typography>
      </div>

      {isLiveDdd && groupedDdds.length > 0 ? (
        <div className={classes.dddBlock}>
          <Typography className={classes.regionHeading} style={{ marginTop: 0 }}>
            {i18n.t("dashboard.extras.geoDddByRegion")}
          </Typography>
          <Box className={classes.dddScroll}>
            {groupedDdds.map((block) => (
              <div key={block.regionId}>
                <Typography className={classes.regionHeading}>
                  {i18n.t(block.labelKey)} — {block.count}
                </Typography>
                {block.items.map((row) => (
                  <div key={`${block.regionId}-${row.ddd}`} className={classes.dddRow}>
                    <span>DDD {row.ddd}</span>
                    <span style={{ fontWeight: 600 }}>{row.count}</span>
                  </div>
                ))}
              </div>
            ))}
          </Box>
        </div>
      ) : null}
    </Paper>
  );
}
