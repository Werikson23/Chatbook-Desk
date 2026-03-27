import React from "react";
import Paper from "@material-ui/core/Paper";
import Typography from "@material-ui/core/Typography";
import LinearProgress from "@material-ui/core/LinearProgress";
import Box from "@material-ui/core/Box";
import { makeStyles } from "@material-ui/core/styles";
import { alpha } from "@material-ui/core/styles";
import Title from "./Title";
import { useDashboardStyles } from "./dashboardStyles";
import { i18n } from "../../translate/i18n";

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(2.5),
    marginBottom: theme.spacing(0),
  },
  row: {
    marginBottom: theme.spacing(2),
    "&:last-child": { marginBottom: 0 },
  },
  head: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginBottom: theme.spacing(0.75),
  },
  label: {
    fontSize: "0.8125rem",
    fontWeight: 500,
  },
  meta: {
    fontSize: "0.75rem",
    color: theme.palette.text.secondary,
  },
  track: {
    height: 8,
    borderRadius: 4,
    backgroundColor:
      theme.palette.type === "dark"
        ? alpha(theme.palette.common.white, 0.08)
        : "rgba(0, 0, 0, 0.06)",
  },
  bar: {
    borderRadius: 4,
  },
}));

export default function DashboardSlaStrip({ items }) {
  const classes = useStyles();
  const dash = useDashboardStyles();

  return (
    <Paper className={`${classes.root} ${dash.extrasCard}`} elevation={0}>
      <Title>{i18n.t("dashboard.extras.slaTitle")}</Title>
      {items.map((row) => (
        <Box key={row.id} className={classes.row}>
          <div className={classes.head}>
            <Typography className={classes.label} component="span" variant="body2">
              {i18n.t(row.labelKey)}
            </Typography>
            <Typography className={classes.meta} component="span" variant="caption">
              {row.currentPct}% · {i18n.t("dashboard.extras.slaTarget")} {row.targetPct}%
            </Typography>
          </div>
          <LinearProgress
            variant="determinate"
            value={Math.min(100, row.currentPct)}
            className={classes.track}
            classes={{ bar: classes.bar }}
          />
        </Box>
      ))}
    </Paper>
  );
}
