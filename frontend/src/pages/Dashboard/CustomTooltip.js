import React from 'react';
import { i18n } from '../../translate/i18n';
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: theme.palette.background.paper,
    color: theme.palette.text.primary,
    borderRadius: 8,
    boxShadow: theme.shadows[4],
    border: `1px solid ${theme.palette.divider}`,
    padding: theme.spacing(1.25, 1.5),
    outline: "none",
  },
  label: {
    fontWeight: 600,
    fontSize: 13,
    marginBottom: 4,
  },
  row: {
    fontWeight: 400,
    fontSize: 13,
    color: theme.palette.text.secondary,
  },
}));

const CustomTooltip = ({ payload, label, active, i18nBase }) => {
  const classes = useStyles();
  if (active && payload && payload.length) {
    return (
      <div className={classes.root}>
        <div className={classes.label}>{label}</div>
        {payload.map((item, index) => (
          <div key={index} className={classes.row}>
            {`${i18nBase ? i18n.t(i18nBase+"."+item.name) : item.name}: ${item.value}`}
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default CustomTooltip;
