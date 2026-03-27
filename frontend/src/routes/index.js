import React, { useEffect, useState } from "react";
import { BrowserRouter, Redirect, Switch } from "react-router-dom";
import { ToastContainer } from "react-toastify";

import LoggedInLayout from "../layout";
import Dashboard from "../pages/Dashboard/";
import TicketResponsiveContainer from "../pages/TicketResponsiveContainer";
import Signup from "../pages/Signup/";
import Login from "../pages/Login/";
import SettingsLayout from "../layout/SettingsLayout";
import Financeiro from "../pages/Financeiro/";
import Contacts from "../pages/Contacts/";
import Helps from "../pages/Helps/";
import ContactLists from "../pages/ContactLists/";
import ContactListItems from "../pages/ContactListItems/";
import { AuthProvider } from "../context/Auth/AuthContext";
import { TicketsContextProvider } from "../context/Tickets/TicketsContext";
import { WhatsAppsProvider } from "../context/WhatsApp/WhatsAppsContext";
import Route from "./Route";
import Campaigns from "../pages/Campaigns";
import CampaignsConfig from "../pages/CampaignsConfig";
import CampaignReport from "../pages/CampaignReport";
import Annoucements from "../pages/Annoucements";
import Chat from "../pages/Chat";
import ToDoList from "../pages/ToDoList/";
import Subscription from "../pages/Subscription/";

const Routes = () => {
  const [showCampaigns, setShowCampaigns] = useState(false);

  useEffect(() => {
    const cshow = localStorage.getItem("cshow");
    if (cshow !== undefined) {
      setShowCampaigns(true);
    }
  }, []);

  return (
    <BrowserRouter>
      <AuthProvider>
        <TicketsContextProvider>
          <Switch>
            <Route exact path="/login" component={Login} />
            <Route exact path="/signup" component={Signup} />
            <WhatsAppsProvider>
              <LoggedInLayout>
                <Route exact path="/" component={Dashboard} isPrivate />
                <Route
                  exact
                  path="/tickets/:ticketId?"
                  component={TicketResponsiveContainer}
                  isPrivate
                />
                <Route
                  exact
                  path="/connections"
                  component={() => <Redirect to="/settings/channels" />}
                  isPrivate
                />
                <Route
                  exact
                  path="/quick-messages"
                  component={() => <Redirect to="/settings/quick-messages" />}
                  isPrivate
                />
                <Route
                  exact
                  path="/schedules"
                  component={() => <Redirect to="/settings/sla" />}
                  isPrivate
                />
                <Route exact path="/todolist" component={ToDoList} isPrivate />
                <Route exact path="/tags" component={() => <Redirect to="/settings/tags" />} isPrivate />
                <Route exact path="/contacts" component={Contacts} isPrivate />
                <Route exact path="/helps" component={Helps} isPrivate />
                <Route exact path="/users" component={() => <Redirect to="/settings/users" />} isPrivate />
                <Route
                  exact
                  path="/messages-api"
                  component={() => <Redirect to="/settings/integrations" />}
                  isPrivate
                />
                <Route
                  exact
                  path="/superadmin/saas"
                  component={() => <Redirect to="/settings/super-admin" />}
                  isPrivate
                />
                <Route exact path="/financeiro" component={Financeiro} isPrivate />
                <Route exact path="/queues" component={() => <Redirect to="/settings/queues" />} isPrivate />
                <Route path="/settings" component={SettingsLayout} isPrivate />
                <Route exact path="/announcements" component={Annoucements} isPrivate />
                <Route exact path="/subscription" component={Subscription} isPrivate />
                <Route
                  exact
                  path="/close-reasons"
                  component={() => <Redirect to="/settings/close-reasons" />}
                  isPrivate
                />
                <Route
                  exact
                  path="/farewell-templates"
                  component={() => <Redirect to="/settings/automation/farewell-messages" />}
                  isPrivate
                />
                <Route exact path="/chats/:id?" component={Chat} isPrivate />
                {showCampaigns && (
                  <>
                    <Route exact path="/contact-lists" component={ContactLists} isPrivate />
                    <Route
                      exact
                      path="/contact-lists/:contactListId/contacts"
                      component={ContactListItems}
                      isPrivate
                    />
                    <Route exact path="/campaigns" component={Campaigns} isPrivate />
                    <Route
                      exact
                      path="/campaign/:campaignId/report"
                      component={CampaignReport}
                      isPrivate
                    />
                    <Route exact path="/campaigns-config" component={CampaignsConfig} isPrivate />
                  </>
                )}
              </LoggedInLayout>
            </WhatsAppsProvider>
          </Switch>
          <ToastContainer autoClose={3000} />
        </TicketsContextProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default Routes;
