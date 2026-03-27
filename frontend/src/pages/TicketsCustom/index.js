import React, { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import clsx from "clsx";
import Avatar from "@material-ui/core/Avatar";
import IconButton from "@material-ui/core/IconButton";
import { makeStyles } from "@material-ui/core/styles";
import SearchIcon from "@material-ui/icons/Search";
import MoveToInboxIcon from "@material-ui/icons/MoveToInbox";
import ChatIcon from "@material-ui/icons/Chat";
import AlternateEmailIcon from "@material-ui/icons/AlternateEmail";
import AccessTimeIcon from "@material-ui/icons/AccessTime";
import DoneIcon from "@material-ui/icons/Done";
import FolderIcon from "@material-ui/icons/Folder";
import GroupIcon from "@material-ui/icons/Group";
import AddIcon from "@material-ui/icons/Add";
import TuneIcon from "@material-ui/icons/Tune";
import SortIcon from "@material-ui/icons/Sort";
import { AuthContext } from "../../context/Auth/AuthContext";

import TicketsListCustom from "../../components/TicketsListCustom";
import Ticket from "../../components/Ticket";

const PRESET_KEY = "chatbookInboxPreset";

const useStyles = makeStyles((theme) => ({
  page: {
    height: "calc(100vh - 48px)",
    width: "100%",
    overflow: "hidden",
    fontFamily: "Inter, sans-serif",
    background: "#151718",
    color: "#f8f9fa",
  },
  appGrid: {
    display: "grid",
    gridTemplateColumns: "232px 372px 1fr",
    height: "100%",
    width: "100%",
    [theme.breakpoints.down("md")]: {
      gridTemplateColumns: "72px 1fr",
    },
  },
  borderR: {
    borderRight: "1px solid #2b2e33",
  },
  borderB: {
    borderBottom: "1px solid #2b2e33",
  },

  sidebarLeft: {
    background: "#151718",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    overflow: "hidden",
  },
  brandHeader: {
    padding: "14px 16px",
    display: "flex",
    alignItems: "center",
    gap: 8,
    fontWeight: 600,
  },
  brandIcon: {
    width: 24,
    height: 24,
    borderRadius: "50%",
    background: "#1c64f2",
    flex: "0 0 24px",
  },
  navGroup: {
    padding: "0 12px",
  },
  navLabel: {
    fontSize: 11,
    fontWeight: 600,
    color: "#6b7280",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    padding: "16px 12px 8px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  navItem: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "7px 12px",
    color: "#9ca3af",
    borderRadius: 6,
    cursor: "pointer",
    textDecoration: "none",
    marginBottom: 2,
    "&:hover": {
      background: "#272a2e",
      color: "#f8f9fa",
    },
  },
  navItemActive: {
    background: "#2b3035",
    color: "#f8f9fa",
  },
  profile: {
    padding: 16,
    borderTop: "1px solid #2b2e33",
    display: "flex",
    gap: 12,
    alignItems: "center",
  },
  avatarWrap: {
    position: "relative",
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: "50%",
    position: "absolute",
    right: 1,
    bottom: 1,
    background: "#10b981",
    border: "2px solid #151718",
  },

  convPanel: {
    background: "#1c1e21",
    display: "flex",
    flexDirection: "column",
    minWidth: 0,
    overflow: "hidden",
  },
  convHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "14px 16px",
  },
  convTitle: {
    fontWeight: 600,
    fontSize: 16,
    letterSpacing: 0.1,
  },
  convOpenBadge: {
    display: "inline-block",
    borderRadius: 12,
    padding: "2px 8px",
    fontSize: 10,
    background: "#2b3035",
    color: "#d1d5db",
    marginLeft: 6,
    verticalAlign: "middle",
  },
  headerActions: {
    display: "flex",
    gap: 4,
    "& button": {
      color: "#9ca3af",
    },
  },
  tabs: {
    display: "flex",
    gap: 20,
    padding: "0 16px",
    borderBottom: "1px solid #2b2e33",
  },
  tab: {
    padding: "10px 0",
    color: "#9ca3af",
    fontSize: 13,
    fontWeight: 500,
    borderBottom: "2px solid transparent",
  },
  tabActive: {
    color: "#1c64f2",
    borderBottomColor: "#1c64f2",
  },
  tabBadge: {
    marginLeft: 4,
    padding: "2px 6px",
    borderRadius: 12,
    fontSize: 10,
    background: "#374151",
    color: "#d1d5db",
    lineHeight: "14px",
  },
  managerWrap: {
    flex: 1,
    minHeight: 0,
    overflow: "hidden",
    background: "#1c1e21",
  },

  chatColumn: {
    minWidth: 0,
    overflow: "hidden",
    background: "#151718",
  },

  hideMdLabel: {
    [theme.breakpoints.down("md")]: {
      display: "none",
    },
  },
}));

const normalizePreset = (raw) => ({
  tab: raw?.tab === "waiting" ? "waiting" : "attending",
  searchParam: typeof raw?.searchParam === "string" ? raw.searchParam : "",
  railKey: typeof raw?.railKey === "string" ? raw.railKey : "all",
});

const TicketsCustom = () => {
  const classes = useStyles();
  const history = useHistory();
  const { user } = useContext(AuthContext);
  const { ticketId } = useParams();
  const [counts, setCounts] = useState({ attendingCount: 0, waitingCount: 0 });
  const [preset, setPreset] = useState(() => {
    try {
      return normalizePreset(JSON.parse(localStorage.getItem(PRESET_KEY) || "{}"));
    } catch {
      return normalizePreset({});
    }
  });

  const mergePreset = useCallback((partial) => {
    setPreset((prev) => normalizePreset({ ...prev, ...partial }));
  }, []);

  const queueIds = useMemo(() => (user?.queues || []).map((q) => q.id), [user]);

  const listQuery = useMemo(() => {
    if (preset.railKey === "mentions") {
      return {
        isSearch: true,
        searchParam: "@",
        showAll: true,
      };
    }

    if (preset.railKey === "resolved") {
      return {
        status: "closed",
        showAll: true,
      };
    }

    if (preset.railKey === "groups") {
      return {
        groups: true,
        showAll: true,
      };
    }

    if (preset.tab === "waiting") {
      return {
        status: "pending",
        showAll: false,
      };
    }

    return {
      status: "open",
      showAll: false,
    };
  }, [preset.railKey, preset.tab]);

  const handleSelectRail = useCallback((railKey) => {
    mergePreset({
      railKey,
      tab: railKey === "all" ? "attending" : preset.tab,
    });
    if (ticketId) history.push("/tickets");
  }, [history, mergePreset, preset.tab, ticketId]);

  const handleTab = useCallback((tab) => {
    mergePreset({ tab, railKey: "all" });
  }, [mergePreset]);

  useEffect(() => {
    localStorage.setItem(PRESET_KEY, JSON.stringify(preset));
  }, [preset]);

  return (
    <div className={classes.page}>
      <div className={classes.appGrid}>
        <aside className={clsx(classes.sidebarLeft, classes.borderR)}>
          <div>
            <div className={clsx(classes.brandHeader, classes.borderB)}>
              <div className={classes.brandIcon} />
              <span className={classes.hideMdLabel}>PaperLayer Inc</span>
            </div>

            <div className={classes.navGroup} style={{ marginTop: 16 }}>
              <div className={classes.navItem} onClick={() => history.push("/tickets")}>
                <SearchIcon fontSize="small" />
                <span className={classes.hideMdLabel}>Search...</span>
              </div>
              <div className={classes.navItem} onClick={() => handleSelectRail("all")}>
                <MoveToInboxIcon fontSize="small" />
                <span className={classes.hideMdLabel}>My Inbox</span>
              </div>
            </div>

            <div className={classes.navLabel}>
              <span className={classes.hideMdLabel}>Conversations</span>
            </div>
            <div className={classes.navGroup}>
              <div
                className={clsx(classes.navItem, preset.railKey === "all" && classes.navItemActive)}
                onClick={() => handleSelectRail("all")}
              >
                <ChatIcon fontSize="small" />
                <span className={classes.hideMdLabel}>All Conversations</span>
              </div>
              <div
                className={clsx(classes.navItem, preset.railKey === "mentions" && classes.navItemActive)}
                onClick={() => handleSelectRail("mentions")}
              >
                <AlternateEmailIcon fontSize="small" />
                <span className={classes.hideMdLabel}>Mentions</span>
              </div>
              <div
                className={clsx(classes.navItem, preset.tab === "waiting" && classes.navItemActive)}
                onClick={() => handleTab("waiting")}
              >
                <AccessTimeIcon fontSize="small" />
                <span className={classes.hideMdLabel}>Aguardando</span>
              </div>
              <div
                className={clsx(classes.navItem, preset.railKey === "resolved" && classes.navItemActive)}
                onClick={() => handleSelectRail("resolved")}
              >
                <DoneIcon fontSize="small" />
                <span className={classes.hideMdLabel}>Resolvidos</span>
              </div>
              <div
                className={clsx(classes.navItem, preset.railKey === "groups" && classes.navItemActive)}
                onClick={() => handleSelectRail("groups")}
              >
                <GroupIcon fontSize="small" />
                <span className={classes.hideMdLabel}>Grupos</span>
              </div>
            </div>

            <div className={classes.navLabel}>
              <span className={classes.hideMdLabel}>Folders</span>
              <AddIcon fontSize="small" />
            </div>
            <div className={classes.navGroup}>
              <div className={classes.navItem}>
                <FolderIcon fontSize="small" />
                <span className={classes.hideMdLabel}>Priority Conversati...</span>
              </div>
            </div>

            <div className={classes.navLabel}>
              <span className={classes.hideMdLabel}>Teams</span>
              <AddIcon fontSize="small" />
            </div>
            <div className={classes.navGroup}>
              <div className={classes.navItem}>
                <GroupIcon fontSize="small" />
                <span className={classes.hideMdLabel}>sales</span>
              </div>
              <div className={classes.navItem}>
                <GroupIcon fontSize="small" />
                <span className={classes.hideMdLabel}>support l1</span>
              </div>
              <div className={classes.navItem}>
                <GroupIcon fontSize="small" />
                <span className={classes.hideMdLabel}>support m2</span>
              </div>
            </div>
          </div>

          <div className={classes.profile}>
            <div className={classes.avatarWrap}>
              <Avatar src="https://i.pravatar.cc/150?u=mathew" style={{ width: 32, height: 32 }} />
              <div className={classes.statusDot} />
            </div>
            <div className={classes.hideMdLabel} style={{ minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                Mathew M
              </div>
              <div style={{ fontSize: 12, color: "#9ca3af", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                mathew@paperlayer.c...
              </div>
            </div>
          </div>
        </aside>

        <section className={clsx(classes.convPanel, classes.borderR)}>
          <div className={classes.convHeader}>
            <h2 className={classes.convTitle}>
              Conversations <span className={classes.convOpenBadge}>Open</span>
            </h2>
            <div className={classes.headerActions}>
              <IconButton size="small">
                <TuneIcon fontSize="small" />
              </IconButton>
              <IconButton size="small">
                <SortIcon fontSize="small" />
              </IconButton>
              <IconButton size="small">
                <AddIcon fontSize="small" />
              </IconButton>
            </div>
          </div>

          <div className={classes.tabs}>
            <div
              className={clsx(classes.tab, preset.tab === "attending" && classes.tabActive)}
              onClick={() => handleTab("attending")}
              style={{ cursor: "pointer" }}
            >
              Atendendo <span className={classes.tabBadge}>{counts.attendingCount}</span>
            </div>
            <div
              className={clsx(classes.tab, preset.tab === "waiting" && classes.tabActive)}
              onClick={() => handleTab("waiting")}
              style={{ cursor: "pointer" }}
            >
              Aguardando <span className={classes.tabBadge}>{counts.waitingCount}</span>
            </div>
          </div>

          <div className={classes.managerWrap}>
            <TicketsListCustom
              chatwootUI
              status={listQuery.status}
              groups={listQuery.groups}
              isSearch={listQuery.isSearch}
              searchParam={listQuery.searchParam}
              showAll={listQuery.showAll}
              selectedQueueIds={queueIds}
              showTabGroups={Boolean(listQuery.groups)}
              setTabOpen={() => handleTab("attending")}
              updateCount={(val) => {
                if (preset.tab === "waiting") {
                  setCounts((prev) => ({ ...prev, waitingCount: val }));
                } else {
                  setCounts((prev) => ({ ...prev, attendingCount: val }));
                }
              }}
            />
          </div>
        </section>

        <main className={classes.chatColumn}>
          {ticketId ? (
            <Ticket forceContactPanel chatwootLayout />
          ) : (
            <div
              style={{
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#9ca3af",
              }}
            >
              Selecione uma conversa
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default TicketsCustom;
