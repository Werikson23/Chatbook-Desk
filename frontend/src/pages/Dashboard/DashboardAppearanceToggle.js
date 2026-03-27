import React, { useContext } from "react";
import Typography from "@material-ui/core/Typography";
import ToggleButton from "@material-ui/lab/ToggleButton";
import ToggleButtonGroup from "@material-ui/lab/ToggleButtonGroup";
import { makeStyles } from "@material-ui/core/styles";
import { useTheme } from "@material-ui/core/styles";
import ColorModeContext from "../../layout/themeContext";
import { i18n } from "../../translate/i18n";

const useStyles = makeStyles((theme) => ({
  row: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    gap: theme.spacing(1.5),
  },
  label: {
    fontSize: "0.75rem",
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    color: theme.palette.text.secondary,
    marginRight: theme.spacing(0.5),
  },
  group: {
    backgroundColor:
      theme.palette.type === "dark"
        ? theme.palette.action.hover
        : "rgba(0, 0, 0, 0.05)",
    borderRadius: 10,
    padding: 4,
  },
  button: {
    textTransform: "none",
    fontWeight: 600,
    fontSize: "0.8125rem",
    borderRadius: 8,
    border: "none",
    "&.Mui-selected": {
      backgroundColor: theme.palette.background.paper,
      boxShadow: theme.shadows[1],
    },
  },
}));

export default function DashboardAppearanceToggle() {
  const classes = useStyles();
  const theme = useTheme();
  const { colorMode } = useContext(ColorModeContext);
  const mode = theme.palette.type === "dark" ? "dark" : "light";

  const handleMode = (_, next) => {
    if (!next || next === mode) return;
    colorMode.toggleColorMode();
  };

  return (
    <div className={classes.row}>
      <Typography component="span" className={classes.label} variant="body2">
        {i18n.t("dashboard.extras.appearance")}
      </Typography>
      <ToggleButtonGroup
        className={classes.group}
        exclusive
        size="small"
        value={mode}
        onChange={handleMode}
      >
        <ToggleButton className={classes.button} value="light">
          {i18n.t("dashboard.extras.themeLight")}
        </ToggleButton>
        <ToggleButton className={classes.button} value="dark">
          {i18n.t("dashboard.extras.themeDark")}
        </ToggleButton>
      </ToggleButtonGroup>
    </div>
  );
}
