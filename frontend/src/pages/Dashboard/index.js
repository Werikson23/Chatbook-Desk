import React, { useState, useEffect, useContext, useCallback, useMemo } from "react";

import Paper from "@material-ui/core/Paper";
import Container from "@material-ui/core/Container";
import Grid from "@material-ui/core/Grid";
import Box from "@material-ui/core/Box";
import Chip from "@material-ui/core/Chip";
import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import Select from "@material-ui/core/Select";
import TextField from "@material-ui/core/TextField";
import Typography from "@material-ui/core/Typography";

import { makeStyles } from "@material-ui/core/styles";
import { toast } from "react-toastify";

import TableAttendantsStatus from "../../components/Dashboard/TableAttendantsStatus";

import { isEmpty } from "lodash";
import moment from "moment";
import { i18n } from "../../translate/i18n";
import useAuth from "../../hooks/useAuth.js";

import { TicketCountersChart } from "./TicketCountersChart";
import { useDashboardStyles } from "./dashboardStyles";
import { fetchDashboardExtras } from "./dashboardExtrasMock";
import { mergeAuraKpis, mergeLiveTicketStatusBars } from "./auraMerge";
import DashboardAppearanceToggle from "./DashboardAppearanceToggle";
import AuraHubHeader from "./AuraHubHeader";
import AuraKpiGrid from "./AuraKpiGrid";
import AuraVolumeResolvedChart from "./AuraVolumeResolvedChart";
import AuraClientWaitChart from "./AuraClientWaitChart";
import AuraOriginDonutChart from "./AuraOriginDonutChart";
import AuraStatusBarChart from "./AuraStatusBarChart";
import AuraPanelsGrid from "./AuraPanelsGrid";
import AuraGradientInsight from "./AuraGradientInsight";
import DashboardGeoPanel from "./DashboardGeoPanel";
import DashboardTagsSection from "./DashboardTagsSection";
import { buildVolumeLiveFromTickets } from "./dashboardVolumeLive";
import { getTimezoneOffset } from "../../helpers/getTimezoneOffset.js";

import api from "../../services/api.js";
import { SocketContext } from "../../context/Socket/SocketContext.js";
import { formatTimeInterval } from "../../helpers/formatTimeInterval.js";

function buildQueuesFromTicketsSummary(summary) {
  if (!summary?.length) return null;
  const map = {};
  summary.forEach((row) => {
    const q = row.queue;
    const id = row.queueId ?? q?.id;
    if (id == null) return;
    if (!map[id]) {
      map[id] = {
        name: q?.name || `Fila ${id}`,
        waiting: 0,
        agents: "—",
        waitingHighlight: false,
      };
    }
    const c = Number(row.count ?? 0);
    if (row.status === "pending") {
      map[id].waiting += c;
      if (c > 0) map[id].waitingHighlight = true;
    }
  });
  return Object.values(map);
}

const DONUT_COLORS = ["#34c759", "#ff2d55", "#007aff", "#8e8e93", "#32ade6", "#af52de", "#ff9500"];

const useStyles = makeStyles(() => ({
  fullWidth: {
    width: "100%",
  },
  selectContainer: {
    width: "100%",
    textAlign: "left",
  },
}));

const Dashboard = () => {
  const classes = useStyles();
  const dash = useDashboardStyles();
  const [period, setPeriod] = useState(0);
  const [currentUser, setCurrentUser] = useState({});
  const [authReady, setAuthReady] = useState(false);
  const [dateFrom, setDateFrom] = useState(
    moment("1", "D").format("YYYY-MM-DDTHH") + ":00"
  );
  const [dateTo, setDateTo] = useState(moment().format("YYYY-MM-DDTHH") + ":59");
  const { getCurrentUserInfo } = useAuth();

  const [usersOnlineTotal, setUsersOnlineTotal] = useState(0);
  const [usersOfflineTotal, setUsersOfflineTotal] = useState(0);
  const [pendingTotal, setPendingTotal] = useState(0);
  const [openedTotal, setOpenedTotal] = useState(0);
  const [ticketsStatusSummary, setTicketsStatusSummary] = useState([]);
  const [channelBreakdown, setChannelBreakdown] = useState([]);

  const [ticketsData, setTicketsData] = useState({});
  const [usersData, setUsersData] = useState({});
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [closeReasons, setCloseReasons] = useState([]);
  const [closeReasonStats, setCloseReasonStats] = useState(null);
  const [selectedCloseReasonId, setSelectedCloseReasonId] = useState("");
  const [dashboardExtras, setDashboardExtras] = useState(null);
  const [auraQuickFilter, setAuraQuickFilter] = useState("custom");
  const [auraChannel, setAuraChannel] = useState("all");
  const [auraQueueId, setAuraQueueId] = useState("all");
  const [queueList, setQueueList] = useState([]);
  const [tagsForDash, setTagsForDash] = useState([]);
  const [geoByDdd, setGeoByDdd] = useState(null);
  const companyId = localStorage.getItem("companyId");

  const geoForPanel = geoByDdd != null ? geoByDdd : dashboardExtras?.geo;

  const handleAuraQuickFilter = useCallback((v) => {
    setAuraQuickFilter(v);
    if (v === "today") {
      setPeriod(0);
      setDateFrom(moment().startOf("day").format("YYYY-MM-DDTHH") + ":00");
      setDateTo(moment().endOf("day").format("YYYY-MM-DDTHH") + ":59");
    } else if (v === 7) {
      setPeriod(7);
    } else if (v === 30) {
      setPeriod(30);
    } else if (v === "custom") {
      setPeriod(0);
    }
  }, []);

  const auraStatusBars = useMemo(() => {
    if (!dashboardExtras?.aura?.statusBars) return null;
    return mergeLiveTicketStatusBars(
      dashboardExtras.aura.statusBars,
      openedTotal,
      pendingTotal
    );
  }, [dashboardExtras, openedTotal, pendingTotal]);

  const auraKpis = useMemo(() => {
    if (!dashboardExtras?.aura?.kpis) return [];
    return mergeAuraKpis(dashboardExtras.aura.kpis, {
      openedTotal,
      pendingTotal,
      newContacts: ticketsData.ticketStatistics?.newContacts,
      avgServiceTimeFormatted: formatTimeInterval(
        ticketsData.ticketStatistics?.avgServiceTime
      ),
      avgWaitTimeFormatted: formatTimeInterval(
        ticketsData.ticketStatistics?.avgWaitTime
      ),
    });
  }, [
    dashboardExtras,
    openedTotal,
    pendingTotal,
    ticketsData.ticketStatistics?.newContacts,
    ticketsData.ticketStatistics?.avgServiceTime,
    ticketsData.ticketStatistics?.avgWaitTime,
  ]);

  const liveVolume = useMemo(
    () => buildVolumeLiveFromTickets(ticketsData.ticketCounters),
    [ticketsData.ticketCounters]
  );

  const liveChannelsForDonut = useMemo(() => {
    if (!channelBreakdown?.length) return null;
    return channelBreakdown.map((row, i) => ({
      label: row.channel || "—",
      channel: row.channel,
      value: Number(row.count ?? 0),
      color: DONUT_COLORS[i % DONUT_COLORS.length],
    }));
  }, [channelBreakdown]);

  const auraQueuesDisplay = useMemo(() => {
    const live = buildQueuesFromTicketsSummary(ticketsStatusSummary);
    if (live?.length) return live;
    return dashboardExtras?.aura?.queues || [];
  }, [ticketsStatusSummary, dashboardExtras]);

  const liveAgents = useMemo(() => {
    const list = usersData?.userReport;
    if (!list?.length) return null;
    return list.map((u) => ({
      name: u.name,
      tickets: Number(u.openTickets ?? 0),
      csat: u.averageRating != null ? Number(u.averageRating).toFixed(1) : "—",
      status: u.online ? "online" : "offline",
    }));
  }, [usersData]);

  const auraAgentsDisplay = useMemo(() => {
    if (liveAgents?.length) return liveAgents;
    return dashboardExtras?.aura?.agents || [];
  }, [liveAgents, dashboardExtras]);

  const auraRealtime = useMemo(
    () => ({
      ...dashboardExtras?.aura?.realtime,
      queueWaiting: String(pendingTotal),
      agentsOnline: String(usersOnlineTotal),
      busyPause: `${usersOnlineTotal} / ${usersOfflineTotal}`,
      avgWait:
        ticketsData.ticketStatistics?.avgWaitTime != null
          ? formatTimeInterval(ticketsData.ticketStatistics.avgWaitTime)
          : dashboardExtras?.aura?.realtime?.avgWait,
    }),
    [
      dashboardExtras,
      pendingTotal,
      usersOnlineTotal,
      usersOfflineTotal,
      ticketsData.ticketStatistics?.avgWaitTime,
    ]
  );

  const socketManager = useContext(SocketContext);

  const loadTags = useCallback(async () => {
    try {
      const { data } = await api.get("/tags/list");
      setTagsForDash(Array.isArray(data) ? data : []);
    } catch (_) {
      setTagsForDash([]);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    const loadCurrentUser = async () => {
      try {
        const user = await getCurrentUserInfo();
        if (cancelled) return;
        if (user?.profile !== "admin") {
          window.location.href = "/tickets";
          return;
        }
        setCurrentUser(user);
      } catch (_) {
        if (!cancelled) window.location.href = "/login";
      } finally {
        if (!cancelled) setAuthReady(true);
      }
    };
    loadCurrentUser();
    return () => {
      cancelled = true;
    };
  }, [getCurrentUserInfo]);

  useEffect(() => {
    const loadQueues = async () => {
      try {
        const { data } = await api.get("/queue");
        setQueueList(Array.isArray(data) ? data : []);
      } catch (_) {
        setQueueList([]);
      }
    };
    if (authReady && currentUser?.profile === "admin") {
      loadQueues();
    }
  }, [authReady, currentUser?.profile]);

  useEffect(() => {
    if (authReady && currentUser?.profile === "admin") {
      loadTags();
    }
  }, [authReady, currentUser?.profile, loadTags]);

  useEffect(() => {
    if (!authReady || currentUser?.profile !== "admin") {
      return;
    }
    api
      .get("/dashboard/geo-by-ddd")
      .then((res) => {
        if (res?.data) {
          setGeoByDdd(res.data);
        }
      })
      .catch(() => {
        setGeoByDdd(null);
      });
  }, [authReady, currentUser?.profile]);

  useEffect(() => {
    let cancelled = false;
    fetchDashboardExtras().then((data) => {
      if (!cancelled) setDashboardExtras(data);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    const loadCloseReasons = async () => {
      try {
        const { data } = await api.get("/close-reasons");
        if (!cancelled) setCloseReasons(data || []);
      } catch (_) {
        if (!cancelled) setCloseReasons([]);
      }
    };
    loadCloseReasons();
    return () => {
      cancelled = true;
    };
  }, []);
    
  async function handleChangePeriod(value) {
    setPeriod(value);
  }

  const updateStatus = useCallback(async () => {
    if (!authReady || currentUser?.profile !== "admin") {
      return;
    }

    api.get("/dashboard/status").then(
      result => {
        const { data } = result;

        if (!data) return;

        setTicketsStatusSummary(data.ticketsStatusSummary || []);
        setChannelBreakdown(data.channelBreakdown || []);

        let usersOnlineTotal = 0;
        let usersOfflineTotal = 0;
        data.usersStatusSummary.forEach((item) => {
          if (item.online) {
            usersOnlineTotal++;
          } else {
            usersOfflineTotal++;
          }
        });

        setUsersOnlineTotal(usersOnlineTotal);
        setUsersOfflineTotal(usersOfflineTotal);

        let pendingTotal = 0;
        let openedTotal = 0;
        data.ticketsStatusSummary.forEach((item) => {
          if (item.status === "pending") {
            pendingTotal += Number(item.count);
            return;
          }
          if (item.status === "open") {
            openedTotal += Number(item.count);
          }
        });
        setPendingTotal(pendingTotal);
        setOpenedTotal(openedTotal);
      }
    ).catch(() => {});
  }, [authReady, currentUser?.profile]);

  useEffect(() => {
    if (!companyId) {
      return undefined;
    }

    const socket = socketManager.GetSocket(companyId);

    socket.on("userOnlineChange", updateStatus);
    socket.on("counter", updateStatus);
    socket.on("tag", loadTags);

    return () => {
      socket.off("userOnlineChange", updateStatus);
      socket.off("counter", updateStatus);
      socket.off("tag", loadTags);
    };
  }, [socketManager, companyId, updateStatus, loadTags]);
  
  const fetchData = useCallback(async () => {
    if (!authReady || currentUser?.profile !== "admin") {
      return;
    }

    const tz = getTimezoneOffset();
    let params = { tz };

    const days = Number(period);

    if (days) {
      params = {
        ...params,
        date_from: moment().subtract(days, "days").format("YYYY-MM-DD"),
        date_to: moment().format("YYYY-MM-DD"),
      };
    }

    if (!days && !isEmpty(dateFrom) && moment(dateFrom).isValid()) {
      params = {
        ...params,
        date_from: moment(dateFrom).format("YYYY-MM-DD"),
        hour_from: moment(dateFrom).format("HH:mm:ss"),
      };
    }

    if (!days && !isEmpty(dateTo) && moment(dateTo).isValid()) {
      params = {
        ...params,
        date_to: moment(dateTo).format("YYYY-MM-DD"),
        hour_to: moment(dateTo).format("HH:mm:ss"),
      };
    }

    if (!params.date_from || !params.date_to) {
      toast.error(i18n.t("dashboard.filter.invalid"));
      return;
    }

    if (selectedCloseReasonId) {
      params.closeReasonId = selectedCloseReasonId;
    }
    if (auraQueueId && auraQueueId !== "all") {
      params.queueId = auraQueueId;
    }
    if (auraChannel && auraChannel !== "all") {
      params.channel = auraChannel;
    }

    api
      .get("/dashboard/tickets", { params })
      .then((result) => {
        if (result?.data) {
          setTicketsData(result.data);
        }
      })
      .catch(() => {});

    api
      .get("/dashboard/close-reasons-stats", { params })
      .then((result) => {
        setCloseReasonStats(Array.isArray(result?.data) ? result.data : []);
      })
      .catch(() => {
        setCloseReasonStats([]);
      });

    setLoadingUsers(true);
    api
      .get("/dashboard/users", { params })
      .then((result) => {
        if (result?.data) {
          setUsersData(result.data);
        }
        setLoadingUsers(false);
      })
      .catch(() => {
        setLoadingUsers(false);
      });
  }, [
    period,
    dateFrom,
    dateTo,
    selectedCloseReasonId,
    auraQueueId,
    auraChannel,
    authReady,
    currentUser?.profile,
  ]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    updateStatus();
  }, [updateStatus]);

  function renderFilters() {
      return (
        <Grid container spacing={2} alignItems="flex-end">
          <Grid item xs={12} sm={6} md={3}>
            <FormControl className={classes.selectContainer}>
              <InputLabel id="period-selector-label">{i18n.t("dashboard.filter.period")}</InputLabel>
              <Select
                labelId="period-selector-label"
                id="period-selector"
                value={period}
                onChange={(e) => handleChangePeriod(e.target.value)}
              >
                <MenuItem value={0}>{i18n.t("dashboard.filter.custom")}</MenuItem>
                <MenuItem value={3}>{i18n.t("dashboard.filter.last3days")}</MenuItem>
                <MenuItem value={7}>{i18n.t("dashboard.filter.last7days")}</MenuItem>
                <MenuItem value={15}>{i18n.t("dashboard.filter.last14days")}</MenuItem>
                <MenuItem value={30}>{i18n.t("dashboard.filter.last30days")}</MenuItem>
                <MenuItem value={90}>{i18n.t("dashboard.filter.last90days")}</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          {!period && (
            <>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  label={i18n.t("dashboard.date.start")}
                  type="datetime-local"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  onBlur={fetchData}
                  className={classes.fullWidth}
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  label={i18n.t("dashboard.date.end")}
                  type="datetime-local"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  onBlur={fetchData}
                  className={classes.fullWidth}
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </Grid>
            </>
          )}
          <Grid item xs={12} sm={6} md={3}>
            <FormControl className={classes.selectContainer}>
              <InputLabel id="close-reason-selector-label">{i18n.t("dashboard.filter.closeReason")}</InputLabel>
              <Select
                labelId="close-reason-selector-label"
                id="close-reason-selector"
                value={selectedCloseReasonId}
                onChange={(e) => setSelectedCloseReasonId(e.target.value)}
              >
                <MenuItem value="">{i18n.t("dashboard.filter.closeReasonAll")}</MenuItem>
                {closeReasons.map(reason => (
                  <MenuItem key={reason.id} value={reason.id}>
                    {reason.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      );
  }

  if (currentUser?.profile !== "admin") {
    return (
      <div>
      </div>
    );
  }
      
  return (
    <div className={dash.pageRoot}>
      <Container maxWidth={false} className={dash.container}>
        <Grid container spacing={3} justifyContent="flex-start">
          <Grid item xs={12}>
            <Box
              display="flex"
              flexWrap="wrap"
              justifyContent="flex-end"
              alignItems="center"
              style={{ gap: 8 }}
            >
              {dashboardExtras?._mock ? (
                <Chip
                  size="small"
                  label={i18n.t("dashboard.extras.mockBadge")}
                  className={dash.mockChip}
                />
              ) : null}
              <DashboardAppearanceToggle />
            </Box>
          </Grid>

          {dashboardExtras?.aura ? (
            <>
              <Grid item xs={12}>
                <AuraHubHeader
                  quickFilter={auraQuickFilter}
                  onQuickFilter={handleAuraQuickFilter}
                  channelFilter={auraChannel}
                  onChannelFilter={setAuraChannel}
                  queueFilter={auraQueueId}
                  onQueueFilter={setAuraQueueId}
                  queueOptions={queueList}
                />
              </Grid>
              <Grid item xs={12}>
                <AuraKpiGrid kpis={auraKpis} />
              </Grid>
              <Grid item xs={12}>
                <DashboardTagsSection tags={tagsForDash} />
              </Grid>
              <Grid item xs={12} lg={8}>
                <AuraVolumeResolvedChart
                  volumeLine={dashboardExtras.aura.volumeLine}
                  liveVolume={liveVolume}
                />
              </Grid>
              <Grid item xs={12} lg={4}>
                <AuraClientWaitChart responseTimeLine={dashboardExtras.aura.responseTimeLine} />
              </Grid>
              <Grid item xs={12} lg={geoForPanel ? 6 : 4}>
                <AuraOriginDonutChart
                  originDonut={dashboardExtras.aura.originDonut}
                  liveChannels={liveChannelsForDonut}
                />
              </Grid>
              {geoForPanel ? (
                <Grid item xs={12} lg={6}>
                  <DashboardGeoPanel geo={geoForPanel} />
                </Grid>
              ) : null}
              <Grid item xs={12} lg={geoForPanel ? 12 : 8}>
                {auraStatusBars ? (
                  <AuraStatusBarChart statusBars={auraStatusBars} />
                ) : null}
              </Grid>
              <Grid item xs={12}>
                <AuraPanelsGrid
                  realtime={auraRealtime}
                  slaAlerts={dashboardExtras.aura.slaAlerts}
                  queues={auraQueuesDisplay}
                  agents={auraAgentsDisplay}
                  closeReasons={dashboardExtras.aura.closeReasons}
                  closeReasonsLive={closeReasonStats}
                  followup={dashboardExtras.aura.followup}
                />
              </Grid>
              <Grid item xs={12}>
                <AuraGradientInsight
                  titleKey={dashboardExtras.aura.aiInsight.titleKey}
                  bodyKey={dashboardExtras.aura.aiInsight.bodyKey}
                />
              </Grid>
            </>
          ) : null}

          <Grid item xs={12}>
            <Typography className={dash.sectionLabel} component="p" variant="body2" style={{ marginTop: 0 }}>
              {i18n.t("dashboard.filter.heading")}
            </Typography>
            <Paper className={dash.filterPanel} elevation={0}>
              {renderFilters()}
            </Paper>
          </Grid>

          <Grid item xs={12}>
            <Paper className={dash.chartPanel} elevation={0}>
              <TicketCountersChart
                ticketCounters={ticketsData.ticketCounters}
                start={ticketsData.start}
                end={ticketsData.end}
                hour_start={ticketsData.hour_start}
                hour_end={ticketsData.hour_end}
              />
            </Paper>
          </Grid>

          <Grid item xs={12}>
            {usersData.userReport?.length ? (
              <TableAttendantsStatus
                attendants={usersData.userReport}
                loading={loadingUsers}
                tableContainerClassName={dash.attendantsPanel}
              />
            ) : null}
          </Grid>

        </Grid>
      </Container>
    </div>
  );
};

export default Dashboard;
