import React from "react";
import Paper from "@material-ui/core/Paper";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import clsx from "clsx";
import { useDashboardStyles } from "./dashboardStyles";

/**
 * KPI tile for the dashboard. variant "primary" = live metrics with optional pie graph;
 * "surface" = period stats with optional icon.
 */
export function KpiCard({
  title,
  value,
  icon,
  graph,
  variant = "surface",
  gridProps,
}) {
  const classes = useDashboardStyles();
  const isPrimary = variant === "primary";

  return (
    <Grid item {...gridProps}>
      <Paper
        elevation={0}
        className={isPrimary ? classes.kpiPrimary : classes.kpiSurface}
      >
        <div className={classes.kpiBody}>
          <div className={classes.kpiText}>
            <Typography
              className={clsx(classes.kpiTitle, isPrimary && classes.kpiTitleOnPrimary)}
              variant="subtitle2"
              component="h3"
            >
              {title}
            </Typography>
            <Typography
              className={clsx(classes.kpiValue, isPrimary && classes.kpiValuePrimary)}
              variant="h4"
              component="p"
            >
              {value}
            </Typography>
          </div>
          {graph ? (
            <div
              className={clsx(
                classes.kpiGraph,
                isPrimary && classes.kpiGraphOnPrimary
              )}
            >
              {graph}
            </div>
          ) : null}
          {icon && !graph ? (
            <div className={classes.kpiIconWrap}>{icon}</div>
          ) : null}
        </div>
      </Paper>
    </Grid>
  );
}
