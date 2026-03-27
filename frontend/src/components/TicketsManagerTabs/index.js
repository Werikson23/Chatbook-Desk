import React, { useContext, useEffect, useRef, useState } from "react";
import { useHistory } from "react-router-dom";
import clsx from "clsx";

import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import SearchIcon from "@material-ui/icons/Search";
import InputBase from "@material-ui/core/InputBase";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import Badge from "@material-ui/core/Badge";
import MoveToInboxIcon from "@material-ui/icons/MoveToInbox";
import CheckBoxIcon from "@material-ui/icons/CheckBox";

import FormControlLabel from "@material-ui/core/FormControlLabel";
import Switch from "@material-ui/core/Switch";

import NewTicketModal from "../NewTicketModal";
import TicketsList from "../TicketsListCustom";
import TabPanel from "../TabPanel";

import { i18n } from "../../translate/i18n";
import { AuthContext } from "../../context/Auth/AuthContext";
import { Can } from "../Can";
import TicketsQueueSelect from "../TicketsQueueSelect";
import { Box, Button } from "@material-ui/core";
import { TagsFilter } from "../TagsFilter";
import { UsersFilter } from "../UsersFilter";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPeopleGroup } from '@fortawesome/free-solid-svg-icons';
import useSettings from "../../hooks/useSettings";
import { ContactSelect } from "../ContactSelect";

const useStyles = makeStyles((theme) => ({
  ticketsWrapper: {
    position: "relative",
    display: "flex",
    height: "100%",
    flexDirection: "column",
    overflow: "hidden",
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
  },

  tabsHeader: {
    flex: "none",
   // backgroundColor: "#eee",
  },

  settingsIcon: {
    alignSelf: "center",
    marginLeft: "auto",
    padding: 8,
  },

  tabWithGroups: {
    minWidth: 90,
    width: 90,
  },

  tab: {
    minWidth: 120,
    width: 120,
  },

  ticketOptionsBox: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    // background: "#fafafa",
    padding: theme.spacing(1),
  },

  serachInputWrapper: {
    flex: 1,
    // background: "#fff",
    display: "flex",
    borderRadius: 40,
    padding: 4,
    marginRight: theme.spacing(1),
  },

  searchIcon: {
    color: "grey",
    marginLeft: 6,
    marginRight: 6,
    alignSelf: "center",
  },

  searchInput: {
    flex: 1,
    border: "none",
    borderRadius: 30,
  },

  badge: {
    right: "-10px",
  },
  show: {
    display: "block",
  },
  hide: {
    display: "none !important",
  },

  icon24: {
    width: 24,
    height: 24,
  },

  chatwootSurface: {
    backgroundColor: "#16161a !important",
    borderColor: "#2a2a2e !important",
    color: "rgba(255,255,255,0.87)",
  },
  chatwootTabsHeader: {
    backgroundColor: "#1c1c22 !important",
    borderBottom: "1px solid #2a2a2e",
    "& .MuiTab-root": {
      color: "rgba(255,255,255,0.45)",
    },
    "& .MuiTab-textColorPrimary.Mui-selected": {
      color: theme.palette.primary.light,
    },
  },
  chatwootOptionsBox: {
    backgroundColor: "#16161a !important",
    borderBottom: "1px solid #2a2a2e",
    "& .MuiFormControlLabel-label": {
      color: "rgba(255,255,255,0.7)",
    },
  },
  chatwootSearchWrap: {
    backgroundColor: "#25252c",
    border: "1px solid #2a2a2e",
    borderRadius: 8,
  },
  chatwootSearchIcon: {
    color: "rgba(255,255,255,0.4)",
  },
  chatwootTabPanel: {
    flex: 1,
    minHeight: 0,
    display: "flex",
    flexDirection: "column",
    backgroundColor: "#121212",
    overflow: "hidden",
  },
  chatwootListPaper: {
    backgroundColor: "#121212 !important",
    flex: 1,
    minHeight: 0,
    display: "flex",
    flexDirection: "column",
  },
  chatwootSubTabs: {
    backgroundColor: "#121212",
    borderBottom: "1px solid #2a2a2e",
    "& .MuiTab-root": {
      color: "rgba(255,255,255,0.5)",
      minHeight: 44,
    },
    "& .MuiTab-textColorPrimary.Mui-selected": {
      color: theme.palette.primary.light,
    },
  },
}));

const TicketsManagerTabs = ({
  preset = {},
  onCountsChange,
  onPresetChange,
  chatwootUI = false,
}) => {
  const classes = useStyles();
  const history = useHistory();

  const [searchParam, setSearchParam] = useState(preset.searchParam || "");
  const [tab, setTab] = useState(preset.tab || "open");
  const [tabOpen, setTabOpen] = useState(preset.tabOpen || "open");
  const [newTicketModalOpen, setNewTicketModalOpen] = useState(false);
  const [showAllTickets, setShowAllTickets] = useState(false);
  const searchInputRef = useRef();
  const { user } = useContext(AuthContext);
  const { profile } = user;

  const [openCount, setOpenCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);

  const userQueueIds = user.queues.map((q) => q.id);
  const [selectedQueueIds, setSelectedQueueIds] = useState(userQueueIds || []);
  const [selectedContact, setSelectedContact] = useState(null);
  const [localTagIds, setLocalTagIds] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);

  const selectedTagIds = Array.isArray(preset.tagIds)
    ? preset.tagIds
    : localTagIds;

  const { getSetting } = useSettings();
  const [showTabGroups, setShowTabGroups] = useState(false);

  useEffect(() => {
    Promise.all([
      getSetting("CheckMsgIsGroup"),
      getSetting("groupsTab")
    ]).then(([ignoreGroups, groupsTab]) => {
      setShowTabGroups(ignoreGroups === "disabled" && groupsTab === "enabled");
    });
  }, [getSetting]);

  useEffect(() => {
    if (user.profile.toUpperCase() === "ADMIN") {
      setShowAllTickets(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (preset.railKey === "mine") {
      setShowAllTickets(false);
      return;
    }
    if (preset.railKey === "inbox" && user.profile?.toUpperCase() === "ADMIN") {
      setShowAllTickets(true);
    }
  }, [preset.railKey, user.profile]);

  useEffect(() => {
    if (tab === "search") {
      searchInputRef.current.focus();
    }
  }, [tab]);

  useEffect(() => {
    if (preset.tab) {
      setTab(preset.tab);
    }
    if (preset.tabOpen) {
      setTabOpen(preset.tabOpen);
    }
    if (typeof preset.searchParam === "string") {
      setSearchParam(preset.searchParam);
    }
  }, [preset.tab, preset.tabOpen, preset.searchParam]);

  useEffect(() => {
    if (typeof onCountsChange === "function") {
      onCountsChange({ openCount, pendingCount });
    }
  }, [openCount, pendingCount, onCountsChange]);

  let searchTimeout;

  const handleSearch = (e) => {
    const searchedTerm = e.target.value.toLowerCase();

    clearTimeout(searchTimeout);

    searchTimeout = setTimeout(() => {
      setSearchParam(searchedTerm);
    }, 500);
  };

  const handleChangeTab = (e, newValue) => {
    setTab(newValue);
  };

  const handleChangeTabOpen = (e, newValue) => {
    setTabOpen(newValue);
  };

  const applyPanelStyle = (status) => {
    if (tabOpen !== status) {
      return { width: 0, height: 0 };
    }
  };

  const handleCloseOrOpenTicket = (ticket) => {
    setNewTicketModalOpen(false);
    if (ticket !== undefined && ticket.uuid !== undefined) {
      history.push(`/tickets/${ticket.uuid}`);
    }
  };

  const handleSelectedTags = (selectedObjects) => {
    const ids = (selectedObjects || []).map((t) => t.id);
    if (typeof onPresetChange === "function") {
      onPresetChange({ tagIds: ids });
    } else {
      setLocalTagIds(ids);
    }
  };

  const handleSelectedUsers = (selecteds) => {
    const users = selecteds.map((t) => t.id);
    setSelectedUsers(users);
  };

  return (
    <Paper
      elevation={0}
      variant="outlined"
      className={clsx(classes.ticketsWrapper, chatwootUI && classes.chatwootSurface)}
    >
      <NewTicketModal
        modalOpen={newTicketModalOpen}
        onClose={(ticket) => {
       
          handleCloseOrOpenTicket(ticket);
        }}
      />
      <Paper
        elevation={0}
        square
        className={clsx(classes.tabsHeader, chatwootUI && classes.chatwootTabsHeader)}
      >
        <Tabs
          value={tab}
          onChange={handleChangeTab}
          variant="fullWidth"
          indicatorColor="primary"
          textColor="primary"
          aria-label="icon label tabs example"
        >
          <Tab
            value={"open"}
            icon={<MoveToInboxIcon />}
            label={i18n.t("tickets.tabs.open.title")}
            classes={{ root: showTabGroups ? classes.tabWithGroups : classes.tab }}
          />

          { showTabGroups && (
            <Tab
              value={"groups"}
              icon={<FontAwesomeIcon className={classes.icon24} icon={faPeopleGroup} />}
              label={i18n.t("tickets.tabs.groups.title")}
              classes={{ root: classes.tabWithGroups }}
            />
          )}

          <Tab
            value={"closed"}
            icon={<CheckBoxIcon />}
            label={i18n.t("tickets.tabs.closed.title")}
            classes={{ root: showTabGroups ? classes.tabWithGroups : classes.tab }}
          />

          <Tab
            value={"search"}
            icon={<SearchIcon />}
            label={i18n.t("tickets.tabs.search.title")}
            classes={{ root: showTabGroups ? classes.tabWithGroups : classes.tab }}
          />
        </Tabs>
      </Paper>
      <Paper
        square
        elevation={0}
        className={clsx(classes.ticketOptionsBox, chatwootUI && classes.chatwootOptionsBox)}
      >
        {tab === "search" ? (
          <div
            className={clsx(
              classes.serachInputWrapper,
              chatwootUI && classes.chatwootSearchWrap
            )}
          >
            <SearchIcon
              className={clsx(classes.searchIcon, chatwootUI && classes.chatwootSearchIcon)}
            />
            <InputBase
              className={classes.searchInput}
              inputRef={searchInputRef}
              placeholder={i18n.t("tickets.search.placeholder")}
              type="search"
              defaultValue={searchParam}
              onChange={handleSearch}
            />
          </div>
        ) : (
          <>
            <Button
              variant="outlined"
              color="primary"
              onClick={() => setNewTicketModalOpen(true)}
            >
              {i18n.t("ticketsManager.buttons.newTicket")}
            </Button>
            { tab === "open" && (
            <Can
              role={user.profile}
              perform="tickets-manager:showall"
              yes={() => (
                <FormControlLabel
                  label={i18n.t("tickets.buttons.showAll")}
                  labelPlacement="start"
                  control={
                    <Switch
                      size="small"
                      checked={showAllTickets}
                      onChange={() =>
                        setShowAllTickets((prevState) => !prevState)
                      }
                      name="showAllTickets"
                      color="primary"
                    />
                  }
                />
              )}
            />
            )}
          </>
        )}
        <TicketsQueueSelect
          style={{ marginLeft: 6 }}
          selectedQueueIds={selectedQueueIds}
          userQueues={user?.queues}
          onChange={(values) => setSelectedQueueIds(values)}
        />
      </Paper>
      <TabPanel
        value={tab}
        name="open"
        className={clsx(classes.ticketsWrapper, chatwootUI && classes.chatwootTabPanel)}
      >
        <Tabs
          value={tabOpen}
          onChange={handleChangeTabOpen}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
          className={clsx(chatwootUI && classes.chatwootSubTabs)}
        >
          <Tab
            label={
              <Badge
                overlap="rectangular"
                className={classes.badge}
                badgeContent={openCount}
                color="primary"
              >
                {i18n.t("ticketsList.assignedHeader")}
              </Badge>
            }
            value={"open"}
          />
          <Tab
            label={
              <Badge
                overlap="rectangular"
                className={classes.badge}
                badgeContent={pendingCount}
                color="secondary"
              >
                {i18n.t("ticketsList.pendingHeader")}
              </Badge>
            }
            value={"pending"}
          />
        </Tabs>
        <Paper className={clsx(classes.ticketsWrapper, chatwootUI && classes.chatwootListPaper)}>
          <TicketsList
            status="open"
            showAll={showAllTickets}
            selectedQueueIds={selectedQueueIds}
            tags={selectedTagIds}
            updateCount={(val) => setOpenCount(val)}
            style={applyPanelStyle("open")}
            setTabOpen={setTabOpen}
            showTabGroups={showTabGroups}
            chatwootUI={chatwootUI}
          />
          <TicketsList
            status="pending"
            selectedQueueIds={selectedQueueIds}
            tags={selectedTagIds}
            updateCount={(val) => setPendingCount(val)}
            style={applyPanelStyle("pending")}
            setTabOpen={setTabOpen}
            showTabGroups={showTabGroups}
            chatwootUI={chatwootUI}
          />
        </Paper>
      </TabPanel>
      <TabPanel
        value={tab}
        name="closed"
        className={clsx(classes.ticketsWrapper, chatwootUI && classes.chatwootTabPanel)}
      >
        <TicketsList
          status="closed"
          showAll={true}
          selectedQueueIds={selectedQueueIds}
          tags={selectedTagIds}
          showTabGroups={showTabGroups}
          chatwootUI={chatwootUI}
          />
      </TabPanel>
      <TabPanel
        value={tab}
        name="groups"
        className={clsx(classes.ticketsWrapper, chatwootUI && classes.chatwootTabPanel)}
      >
        <TicketsList
          groups={true}
          showAll={true}
          selectedQueueIds={selectedQueueIds}
          tags={selectedTagIds}
          showTabGroups={showTabGroups}
          chatwootUI={chatwootUI}
        />
      </TabPanel>
      <TabPanel
        value={tab}
        name="search"
        className={clsx(classes.ticketsWrapper, chatwootUI && classes.chatwootTabPanel)}
      >
        <Box style={{ paddingRight: 10, paddingLeft: 10 }}>
        <ContactSelect onSelected={(contactId) => {
          setSelectedContact(contactId);
        }} allowCreate={false} />
        </Box>
        <TagsFilter
          valueIds={selectedTagIds}
          onFiltered={handleSelectedTags}
        />
        {profile === "admin" && (
          <UsersFilter onFiltered={handleSelectedUsers} />
        )}
        <TicketsList
          isSearch={true}
          searchParam={searchParam}
          showAll={true}
          contactId={selectedContact}
          tags={selectedTagIds}
          users={selectedUsers}
          selectedQueueIds={selectedQueueIds}
          showTabGroups={showTabGroups}
          chatwootUI={chatwootUI}
        />
      </TabPanel>
    </Paper>
  );
};

export default TicketsManagerTabs;
