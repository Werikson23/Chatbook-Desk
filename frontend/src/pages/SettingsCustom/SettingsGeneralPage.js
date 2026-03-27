import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { makeStyles, Paper, Tabs, Tab, Button, Grid } from "@material-ui/core";
import TabPanel from "../../components/TabPanel";
import SchedulesForm from "../../components/SchedulesForm";
import Options from "../../components/Settings/Options";
import { i18n } from "../../translate/i18n.js";
import { toast } from "react-toastify";
import useCompanies from "../../hooks/useCompanies";
import useAuth from "../../hooks/useAuth.js";
import useSettings from "../../hooks/useSettings";
import OpenHoursEditor from "../../components/OpenHoursEditor";

const isOpenHoursFormat = (schedules) =>
  !schedules || Object.keys(schedules).length === 0
    ? true
    : typeof schedules === "object" &&
      Array.isArray(schedules.weeklyRules) &&
      Array.isArray(schedules.overrides);

const useStyles = makeStyles((theme) => ({
  contentArea: {
    height: "100%",
    padding: 24,
    overflowY: "auto",
    background: "#fff",
    boxSizing: "border-box",
    ...theme.scrollbarStyles
  },
  title: { fontSize: 20, fontWeight: 700, marginBottom: 20 },
  topTabs: {
    minHeight: 34,
    marginBottom: 12,
    "& .MuiTab-root": { minHeight: 34, textTransform: "none", fontSize: 13, fontWeight: 600 }
  },
  card: {
    border: "1px solid #e8e8e8",
    borderRadius: 12,
    boxShadow: "0 8px 24px rgba(0,0,0,0.04)",
    background: "#fff"
  },
  cardInner: { padding: 16 }
}));

/**
 * Conteúdo da rota /settings (Geral + horários da empresa quando habilitado).
 */
export default function SettingsGeneralPage() {
  const classes = useStyles();
  const history = useHistory();
  const [tab, setTab] = useState("options");
  const [schedules, setSchedules] = useState({});
  const [company, setCompany] = useState({});
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({});
  const [schedulesEnabled, setSchedulesEnabled] = useState(false);
  const [currentUser, setCurrentUser] = useState({});
  const { getCurrentUserInfo } = useAuth();
  const { find, updateSchedules } = useCompanies();
  const { getAll: getAllSettings } = useSettings();
  const isSuper = !!currentUser?.super;

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const companyId = localStorage.getItem("companyId");
        const [companyData, settingList, user] = await Promise.all([
          find(companyId),
          getAllSettings(),
          getCurrentUserInfo()
        ]);
        if (!mounted) return;
        setCompany(companyData);
        setSchedules(companyData.schedules);
        setSettings(settingList);
        setCurrentUser(user || {});
        if (Array.isArray(settingList)) {
          const scheduleType = settingList.find((d) => d.key === "scheduleType");
          setSchedulesEnabled(scheduleType?.value === "company");
        }
      } catch (e) {
        toast.error(e);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [find, getAllSettings, getCurrentUserInfo]);

  const handleTabChange = (_, newValue) => {
    if (newValue === "superadminSaaS") {
      history.push("/settings/super-admin");
      return;
    }
    setTab(newValue);
  };

  const handleSubmitSchedules = async (data) => {
    setLoading(true);
    try {
      setSchedules(data);
      await updateSchedules({ id: company.id, schedules: data });
      toast.success("Horários atualizados com sucesso.");
    } catch (e) {
      toast.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className={classes.contentArea}>
      <h2 className={classes.title}>{i18n.t("settings.title")}</h2>
      <Tabs
        value={tab}
        indicatorColor="primary"
        textColor="primary"
        scrollButtons="on"
        variant="scrollable"
        onChange={handleTabChange}
        className={classes.topTabs}
      >
        <Tab label={i18n.t("settings.Options.title")} value="options" />
        {schedulesEnabled ? <Tab label={i18n.t("settings.schedules.title")} value="schedules" /> : null}
        {isSuper ? <Tab label={i18n.t("settings.superadminSaaSTitle")} value="superadminSaaS" /> : null}
      </Tabs>

      <Paper className={classes.card} elevation={0}>
        <div className={classes.cardInner}>
          <TabPanel value={tab} name="schedules">
            {isOpenHoursFormat(schedules) ? (
              <>
                <OpenHoursEditor value={schedules} onChange={setSchedules} />
                <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => handleSubmitSchedules(schedules)}
                    disabled={loading}
                  >
                    {loading ? i18n.t("settings.saving") : i18n.t("common.save")}
                  </Button>
                </div>
              </>
            ) : (
              <>
                <Grid spacing={2} container>
                  <Grid item xs={12}>
                    <Button variant="contained" color="secondary" onClick={() => setSchedules({})} disabled={loading}>
                      ⚠️ {i18n.t("settings.schedules.updateToNewFormat")}
                    </Button>
                  </Grid>
                </Grid>
                <SchedulesForm loading={loading} onSubmit={handleSubmitSchedules} initialValues={schedules} />
              </>
            )}
          </TabPanel>

          <TabPanel value={tab} name="options">
            <Options
              settings={settings}
              scheduleTypeChanged={(value) => setSchedulesEnabled(value === "company")}
            />
          </TabPanel>
        </div>
      </Paper>
    </main>
  );
}
