import React from "react";
import Paper from "@material-ui/core/Paper";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/core/styles";
import { useDashboardStyles } from "./dashboardStyles";
import Title from "./Title";
import { SmallPie } from "./SmallPie";
import { i18n } from "../../translate/i18n";

const useStyles = makeStyles((theme) => ({
  root: {
    borderRadius: 12,
    padding: theme.spacing(2.5),
    height: "100%",
    minHeight: 280,
  },
  row: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(3),
    flexWrap: "wrap",
    justifyContent: "center",
    marginTop: theme.spacing(1),
  },
  legend: {
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(1),
  },
  legRow: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: "50%",
    flexShrink: 0,
  },
  legLabel: {
    fontSize: "0.8125rem",
  },
}));

export default function DashboardResponseMix({ data }) {
  const classes = useStyles();
  const dash = useDashboardStyles();
  const chartData = data.map((d) => ({
    name: i18n.t(d.nameKey),
    value: d.value,
    color: d.color,
  }));

  return (
    <Paper className={`${classes.root} ${dash.extrasCard}`} elevation={0}>
      <Title>{i18n.t("dashboard.extras.responseMixTitle")}</Title>
      <div className={classes.row}>
        <SmallPie chartData={chartData} />
        <div className={classes.legend}>
          {chartData.map((d) => (
            <div key={d.name} className={classes.legRow}>
              <span className={classes.dot} style={{ backgroundColor: d.color }} />
              <Typography className={classes.legLabel} variant="body2">
                {d.name} · {d.value}%
              </Typography>
            </div>
          ))}
        </div>
      </div>
    </Paper>
  );
}
