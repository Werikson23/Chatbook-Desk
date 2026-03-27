import React, { useState, useContext } from "react";
import { Switch, Route, Redirect, useRouteMatch } from "react-router-dom";
import { makeStyles } from "@material-ui/core/styles";

import SettingsSidebar from "./SettingsSidebar";
import AppSwitcher from "../components/AppSwitcher";

import SettingsGeneralPage from "../pages/SettingsCustom/SettingsGeneralPage";
import Connections from "../pages/Connections";
import QuickMessages from "../pages/QuickMessages";
import Schedules from "../pages/Schedules";
import Tags from "../pages/Tags";
import Users from "../pages/Users";
import MessagesAPI from "../pages/MessagesAPI";
import Queues from "../pages/Queues";
import CloseReasons from "../pages/CloseReasons";
import FarewellTemplates from "../pages/FarewellTemplates";
import SuperadminSaaS from "../pages/SuperadminSaaS";
import SettingsAttributesPage from "../pages/SettingsCustom/SettingsAttributesPage";
import SettingsBackupPage from "../pages/SettingsCustom/SettingsBackupPage";
import { AuthContext } from "../context/Auth/AuthContext";

const useStyles = makeStyles(() => ({
  root: {
    display: "flex",
    height: "100%",
    minHeight: "calc(var(--vh, 100vh))",
    overflow: "hidden",
    background: "#f6f6f6"
  },
  main: {
    flex: 1,
    minWidth: 0,
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    background: "#fff"
  },
  content: {
    flex: 1,
    overflow: "hidden",
    minHeight: 0,
    display: "flex",
    flexDirection: "column"
  },
  outlet: {
    flex: 1,
    overflow: "auto",
    minHeight: 0
  }
}));

export default function SettingsLayout() {
  const classes = useStyles();
  const { path } = useRouteMatch();
  const { user } = useContext(AuthContext);
  const [appsAnchorEl, setAppsAnchorEl] = useState(null);

  return (
    <div className={classes.root}>
      <AppSwitcher anchorEl={appsAnchorEl} open={!!appsAnchorEl} onClose={() => setAppsAnchorEl(null)} />
      <SettingsSidebar onOpenApps={(e) => setAppsAnchorEl(e.currentTarget)} />
      <div className={classes.main}>
        <div className={classes.content}>
          <div className={classes.outlet}>
            <Switch>
              <Route exact path={path} component={SettingsGeneralPage} />
              <Route path={`${path}/channels`} component={Connections} />
              <Route path={`${path}/quick-messages`} component={QuickMessages} />
              <Route path={`${path}/sla`} component={Schedules} />
              <Route path={`${path}/tags`} component={Tags} />
              <Route path={`${path}/attributes`} component={SettingsAttributesPage} />
              <Route path={`${path}/backup`} component={SettingsBackupPage} />
              <Route path={`${path}/users`} component={Users} />
              <Route path={`${path}/integrations`} component={MessagesAPI} />
              <Route path={`${path}/queues`} component={Queues} />
              <Route path={`${path}/close-reasons`} component={CloseReasons} />
              <Route path={`${path}/automation/farewell-messages`} component={FarewellTemplates} />
              <Route
                exact
                path={`${path}/super-admin`}
                render={() => (!user?.super ? <Redirect to="/settings" /> : <SuperadminSaaS />)}
              />
              <Redirect to="/settings" />
            </Switch>
          </div>
        </div>
      </div>
    </div>
  );
}
