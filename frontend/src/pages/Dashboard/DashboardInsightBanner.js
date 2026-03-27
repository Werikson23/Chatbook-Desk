import React from "react";
import Paper from "@material-ui/core/Paper";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/core/styles";
import { alpha } from "@material-ui/core/styles";
import { i18n } from "../../translate/i18n";

const useStyles = makeStyles((theme) => ({
  root: {
    borderRadius: 12,
    padding: theme.spacing(2, 2.5),
    border: `1px solid ${
      theme.palette.type === "dark"
        ? alpha(theme.palette.info.main, 0.35)
        : alpha("#007aff", 0.22)
    }`,
    background:
      theme.palette.type === "dark"
        ? alpha(theme.palette.info.dark, 0.25)
        : alpha("#007aff", 0.08),
  },
  title: {
    fontWeight: 600,
    fontSize: "0.9375rem",
    letterSpacing: "-0.01em",
    marginBottom: theme.spacing(0.75),
  },
  body: {
    fontSize: "0.875rem",
    lineHeight: 1.5,
    color: theme.palette.text.secondary,
  },
}));

export default function DashboardInsightBanner({ titleKey, bodyKey }) {
  const classes = useStyles();
  return (
    <Paper className={classes.root} elevation={0}>
      <Typography className={classes.title} component="h2" variant="subtitle1">
        {i18n.t(titleKey)}
      </Typography>
      <Typography className={classes.body} component="p" variant="body2">
        {i18n.t(bodyKey)}
      </Typography>
    </Paper>
  );
}
