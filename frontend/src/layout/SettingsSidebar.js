import React, { useMemo, useState, useContext, useEffect } from "react";
import { useHistory, useLocation } from "react-router-dom";
import { makeStyles, InputBase, IconButton, Button } from "@material-ui/core";
import AppsIcon from "@material-ui/icons/Apps";

import { getSettingsNavItems, SETTINGS_CATS, matchSettingsNavKey } from "./settingsNavConfig";
import useAuth from "../hooks/useAuth.js";
import { AuthContext } from "../context/Auth/AuthContext";

const useStyles = makeStyles((theme) => ({
  sidebar: {
    width: 260,
    flexShrink: 0,
    background: "#ececec",
    padding: "16px 10px",
    borderRight: "1px solid #dcdcdc",
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    height: "100%",
    boxSizing: "border-box",
    ...theme.scrollbarStyles
  },
  topBar: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    marginBottom: 12
  },
  appsBtn: {
    padding: 8,
    color: "#333"
  },
  searchWrap: { position: "relative", marginBottom: 16, flex: 0 },
  searchIcon: {
    position: "absolute",
    left: 10,
    top: "50%",
    transform: "translateY(-50%)",
    color: "#888",
    fontSize: 14
  },
  searchInput: {
    width: "100%",
    padding: "7px 10px 7px 30px",
    borderRadius: 6,
    border: "1px solid #ccc",
    background: "#e1e1e1",
    fontSize: 13
  },
  profile: { display: "flex", alignItems: "center", marginBottom: 16 },
  avatar: { width: 52, height: 52, borderRadius: "50%", marginRight: 12, objectFit: "cover" },
  userName: { fontSize: 14, fontWeight: 600 },
  userRole: { fontSize: 12, color: "#666" },
  navCategory: {
    fontSize: 11,
    color: "#666",
    textTransform: "uppercase",
    fontWeight: 600,
    marginTop: 12,
    marginBottom: 4,
    paddingLeft: 6
  },
  navList: { listStyle: "none", margin: 0, padding: 0 },
  navItem: {
    display: "flex",
    alignItems: "center",
    padding: "6px 8px",
    borderRadius: 6,
    fontSize: 13,
    marginBottom: 2,
    cursor: "pointer",
    transition: "0.2s",
    border: "none",
    background: "transparent",
    width: "100%",
    textAlign: "left",
    fontFamily: "inherit",
    "&:hover": { background: "#e0e0e0" }
  },
  navItemActive: { background: "#c9c9c9", fontWeight: 600 },
  iconBg: {
    width: 24,
    height: 24,
    borderRadius: 5,
    marginRight: 8,
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 14,
    flexShrink: 0
  },
  footer: {
    marginTop: "auto",
    paddingTop: 16,
    borderTop: "1px solid #dcdcdc"
  },
  footerBtn: {
    textTransform: "none",
    fontSize: 13,
    fontWeight: 600,
    justifyContent: "flex-start"
  }
}));

export default function SettingsSidebar({ onOpenApps }) {
  const classes = useStyles();
  const history = useHistory();
  const location = useLocation();
  const [search, setSearch] = useState("");
  const { getCurrentUserInfo } = useAuth();
  const { handleLogout, user: authUser } = useContext(AuthContext);
  const [currentUser, setCurrentUser] = useState({});

  const navItems = useMemo(() => getSettingsNavItems(), []);
  const visibleNav = useMemo(() => {
    const isSuper = !!authUser?.super;
    return navItems.filter((n) => !n.superOnly || isSuper);
  }, [navItems, authUser?.super]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return visibleNav;
    return visibleNav.filter((n) => n.label.toLowerCase().includes(q));
  }, [search, visibleNav]);

  const activeKey = useMemo(
    () => matchSettingsNavKey(location.pathname, navItems),
    [location.pathname, navItems]
  );

  useEffect(() => {
    let mounted = true;
    getCurrentUserInfo().then((u) => {
      if (mounted) setCurrentUser(u || {});
    });
    return () => {
      mounted = false;
    };
  }, [getCurrentUserInfo]);

  const isSuper = !!currentUser?.super;

  const handleNavClick = (item) => {
    if (item.route) {
      history.push(item.route);
      return;
    }
    history.push("/settings");
  };

  return (
    <aside className={classes.sidebar}>
      <div className={classes.topBar}>
        <IconButton className={classes.appsBtn} size="small" aria-label="Apps" onClick={onOpenApps}>
          <AppsIcon />
        </IconButton>
        <div className={classes.searchWrap} style={{ flex: 1, marginBottom: 0 }}>
          <span className={classes.searchIcon}>⌕</span>
          <InputBase
            className={classes.searchInput}
            placeholder="Buscar configurações"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className={classes.profile}>
        <img
          src="https://www.apple.com/v/leadership/f/images/leadership/steve-jobs/steve-jobs-wallpaper-download_dr_large.jpg"
          alt=""
          className={classes.avatar}
        />
        <div>
          <div className={classes.userName}>{currentUser?.name || authUser?.name || "—"}</div>
          <div className={classes.userRole}>{isSuper ? "Superadmin" : authUser?.profile || "—"}</div>
        </div>
      </div>

      {SETTINGS_CATS.map((cat) => (
        <React.Fragment key={cat}>
          <div className={classes.navCategory}>{cat}</div>
          <ul className={classes.navList}>
            {filtered
              .filter((i) => i.cat === cat)
              .map((i) => (
                <li key={i.key}>
                  <button
                    type="button"
                    className={`${classes.navItem} ${activeKey === i.key ? classes.navItemActive : ""}`}
                    onClick={() => handleNavClick(i)}
                  >
                    <span className={classes.iconBg} style={{ background: i.color }}>
                      {i.icon}
                    </span>
                    <span>{i.label}</span>
                  </button>
                </li>
              ))}
          </ul>
        </React.Fragment>
      ))}

      <div className={classes.footer}>
        <Button fullWidth className={classes.footerBtn} onClick={() => history.push("/")}>
          ← Ir para início
        </Button>
        <Button fullWidth className={classes.footerBtn} onClick={handleLogout}>
          Sair
        </Button>
      </div>
    </aside>
  );
}
