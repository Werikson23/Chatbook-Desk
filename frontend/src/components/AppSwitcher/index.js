import React, { useContext, useMemo } from "react";
import { useHistory } from "react-router-dom";
import { makeStyles } from "@material-ui/core/styles";
import Popover from "@material-ui/core/Popover";
import Typography from "@material-ui/core/Typography";

import AppsIcon from "@material-ui/icons/Apps";

import DashboardOutlinedIcon from "@material-ui/icons/DashboardOutlined";
import WhatsAppIcon from "@material-ui/icons/WhatsApp";
import BorderColorIcon from "@material-ui/icons/BorderColor";
import ContactPhoneOutlinedIcon from "@material-ui/icons/ContactPhoneOutlined";
import ForumIcon from "@material-ui/icons/Forum";
import HelpOutlineIcon from "@material-ui/icons/HelpOutline";
import AnnouncementIcon from "@material-ui/icons/Announcement";
import LocalAtmIcon from "@material-ui/icons/LocalAtm";
import SettingsOutlinedIcon from "@material-ui/icons/SettingsOutlined";
import ListIcon from "@material-ui/icons/ListAlt";
import PeopleIcon from "@material-ui/icons/People";

import { i18n } from "../../translate/i18n";
import { AuthContext } from "../../context/Auth/AuthContext";
import rules from "../../rules";

const useStyles = makeStyles((theme) => ({
  paper: {
    borderRadius: 16,
    padding: theme.spacing(1.5),
    overflow: "hidden",
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[6],
  },
  menuGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, minmax(72px, 1fr))",
    gap: theme.spacing(0.5),
    alignItems: "stretch",
  },
  appItem: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: theme.spacing(1),
    borderRadius: 12,
    cursor: "pointer",
    userSelect: "none",
    "&:hover": {
      backgroundColor: theme.palette.action.hover,
    },
  },
  appIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.palette.action.hover,
    marginBottom: theme.spacing(0.75),
  },
  appIcon: {
    fontSize: 20,
  },
  appLabel: {
    fontSize: 11,
    fontWeight: 700,
    color: theme.palette.text.primary,
    textAlign: "center",
    lineHeight: 1.1,
    maxWidth: 72,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  appsTitle: {
    fontSize: 11,
    fontWeight: 800,
    color: theme.palette.text.secondary,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    padding: `0 ${theme.spacing(0.5)} ${theme.spacing(0.75)}px ${theme.spacing(0.5)}`,
  },
}));

function hasPermission(role, action) {
  const permissions = rules?.[role];
  if (!permissions) return false;
  const staticPermissions = permissions.static;
  if (Array.isArray(staticPermissions) && staticPermissions.includes(action)) return true;
  return false;
}

function AppTile({ icon, label, onClick }) {
  const classes = useStyles();
  return (
    <div className={classes.appItem} role="menuitem" tabIndex={0} onClick={onClick} onKeyDown={(e) => e.key === "Enter" && onClick()}>
      <div className={classes.appIconWrap}>
        <span className={classes.appIcon}>{icon}</span>
      </div>
      <Typography className={classes.appLabel}>{label}</Typography>
    </div>
  );
}

export default function AppSwitcher({ anchorEl, open, onClose }) {
  const classes = useStyles();
  const history = useHistory();
  const { user } = useContext(AuthContext);

  const showCampaigns = !!localStorage.getItem("cshow");
  const isSuper = !!user?.super;
  const canAdmin = isSuper || hasPermission(user?.profile, "drawer-admin-items:view");

  const apps = useMemo(() => {
    const service = [
      { to: "/tickets", label: i18n.t("mainDrawer.listItems.tickets"), icon: <WhatsAppIcon /> },
      { to: "/todolist", label: i18n.t("mainDrawer.listItems.tasks"), icon: <BorderColorIcon /> },
      { to: "/contacts", label: i18n.t("mainDrawer.listItems.contacts"), icon: <ContactPhoneOutlinedIcon /> },
      { to: "/chats", label: i18n.t("mainDrawer.listItems.chats"), icon: <ForumIcon /> },
      { to: "/helps", label: i18n.t("mainDrawer.listItems.helps"), icon: <HelpOutlineIcon /> },
    ];

    if (!canAdmin) return service;

    const admin = [
      { to: "/", label: "Dashboard", icon: <DashboardOutlinedIcon /> },
      ...(user?.super ? [{ to: "/announcements", label: i18n.t("mainDrawer.listItems.annoucements"), icon: <AnnouncementIcon /> }] : []),
      { to: "/financeiro", label: i18n.t("mainDrawer.listItems.financeiro"), icon: <LocalAtmIcon /> },
      { to: "/settings", label: i18n.t("mainDrawer.listItems.settings"), icon: <SettingsOutlinedIcon /> },
      ...(showCampaigns
        ? [
            { to: "/campaigns", label: "Listagem", icon: <ListIcon /> },
            { to: "/contact-lists", label: "Listas de Contatos", icon: <PeopleIcon /> },
            { to: "/campaigns-config", label: "Configurações", icon: <SettingsOutlinedIcon /> },
          ]
        : []),
    ];

    return [...service, ...admin];
  }, [canAdmin, showCampaigns, user?.super]);

  const handleNavigate = (to) => {
    onClose?.();
    history.push(to);
  };

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      transformOrigin={{ vertical: "top", horizontal: "right" }}
      disableRestoreFocus
      PaperProps={{ className: classes.paper }}
    >
      <Typography className={classes.appsTitle}>
        <AppsIcon style={{ fontSize: 14, marginRight: 8, verticalAlign: "middle" }} />
        Apps
      </Typography>
      <div className={classes.menuGrid} role="menu" aria-label="Apps">
        {apps.map((a) => (
          <AppTile
            key={a.to}
            icon={a.icon}
            label={a.label}
            onClick={() => handleNavigate(a.to)}
          />
        ))}
      </div>
    </Popover>
  );
}

