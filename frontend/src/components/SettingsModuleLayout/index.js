import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import MainContainer from "../MainContainer";

const useStyles = makeStyles((theme) => ({
  root: {
    flex: 1,
    background: "#f6f6f6",
    minHeight: "100%"
  },
  shell: {
    maxWidth: 1200,
    margin: "0 auto",
    padding: theme.spacing(3),
    boxSizing: "border-box",
    width: "100%",
    [theme.breakpoints.down("xs")]: {
      padding: theme.spacing(2)
    }
  },
  shellEmbedded: {
    maxWidth: "100%",
    margin: 0,
    padding: theme.spacing(2, 3),
    boxSizing: "border-box",
    width: "100%",
    [theme.breakpoints.down("xs")]: {
      padding: theme.spacing(2)
    }
  },
  headerRow: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: theme.spacing(2),
    marginBottom: theme.spacing(2)
  },
  title: {
    fontSize: 28,
    fontWeight: 700,
    letterSpacing: "-0.03em",
    color: "#1d1d1f",
    lineHeight: 1.15,
    margin: 0
  },
  description: {
    marginTop: theme.spacing(1),
    fontSize: 15,
    lineHeight: 1.45,
    color: "#86868b",
    maxWidth: 720
  },
  actions: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    gap: theme.spacing(1)
  },
  body: {
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(2)
  }
}));

/**
 * Layout de página dentro do módulo Configurações.
 * @param {boolean} embedded — quando true, sem MainContainer nem link “voltar” (sidebar persistente).
 */
export default function SettingsModuleLayout({
  title,
  description,
  actions = null,
  children,
  embedded = false
}) {
  const classes = useStyles();

  const inner = (
    <div className={embedded ? classes.shellEmbedded : classes.shell}>
      <div className={classes.headerRow}>
        <div>
          <Typography component="h1" className={classes.title}>
            {title}
          </Typography>
          {description ? (
            <Typography component="p" className={classes.description}>
              {description}
            </Typography>
          ) : null}
        </div>
        {actions ? <div className={classes.actions}>{actions}</div> : null}
      </div>
      <div className={classes.body}>{children}</div>
    </div>
  );

  if (embedded) {
    return inner;
  }

  return <MainContainer className={classes.root}>{inner}</MainContainer>;
}
