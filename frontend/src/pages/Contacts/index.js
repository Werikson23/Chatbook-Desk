import React, { useState, useEffect, useReducer, useContext, useMemo, useRef } from "react";

import { toast } from "react-toastify";
import { useHistory } from "react-router-dom";

import { makeStyles } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import SearchIcon from "@material-ui/icons/Search";
import LabelOutlined from "@material-ui/icons/LabelOutlined";
import GroupOutlined from "@material-ui/icons/GroupOutlined";
import StarBorder from "@material-ui/icons/StarBorder";
import AccessTime from "@material-ui/icons/AccessTime";
import ChevronLeft from "@material-ui/icons/ChevronLeft";
import ChevronRight from "@material-ui/icons/ChevronRight";
import AddIcon from "@material-ui/icons/Add";
import DeleteOutlineIcon from "@material-ui/icons/DeleteOutline";
import IconButton from "@material-ui/core/IconButton";
import { FormControl, Grid, InputLabel, MenuItem, Select, Tooltip } from "@material-ui/core";

import api from "../../services/api";
import ContactModal from "../../components/ContactModal";
import ConfirmationModal from "../../components/ConfirmationModal/";

import { i18n } from "../../translate/i18n";
import MainContainer from "../../components/MainContainer";
import toastError from "../../errors/toastError";
import { AuthContext } from "../../context/Auth/AuthContext";
import { Can } from "../../components/Can";
import { SocketContext } from "../../context/Socket/SocketContext";
import { generateColor } from "../../helpers/colorGenerator";
import { getInitials } from "../../helpers/getInitials";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCloudArrowUp } from "@fortawesome/free-solid-svg-icons";
import { faDownload } from "@fortawesome/free-solid-svg-icons";

import ContactDetailPanel from "./ContactDetailPanel";
import "./contactsModern.css";

const reducer = (state, action) => {
  if (action.type === "LOAD_CONTACTS") {
    const contacts = action.payload;
    const newContacts = [];
    contacts.forEach((contact) => {
      const contactIndex = state.findIndex((c) => c.id === contact.id);
      if (contactIndex !== -1) {
        state[contactIndex] = contact;
      } else {
        newContacts.push(contact);
      }
    });
    return [...state, ...newContacts];
  }
  if (action.type === "UPDATE_CONTACTS") {
    const contact = action.payload;
    const contactIndex = state.findIndex((c) => c.id === contact.id);
    if (contactIndex !== -1) {
      state[contactIndex] = contact;
      return [...state];
    }
    return [contact, ...state];
  }
  if (action.type === "DELETE_CONTACT") {
    const contactId = action.payload;
    const contactIndex = state.findIndex((c) => c.id === contactId);
    if (contactIndex !== -1) {
      state.splice(contactIndex, 1);
    }
    return [...state];
  }
  if (action.type === "RESET") {
    return [];
  }
};

const useStyles = makeStyles(() => ({
  pageRoot: {
    display: "flex",
    flexDirection: "column",
    height: "100%",
    maxHeight: "100%",
    minHeight: 0,
    overflow: "hidden",
    padding: 0,
  },
}));

const filterContacts = (list, mode, tagId) => {
  if (mode === "tagged") {
    return list.filter((c) => (c.tags || []).length > 0);
  }
  if (mode === "groups") {
    return list.filter((c) => c.isGroup);
  }
  if (mode === "tag" && tagId) {
    return list.filter((c) => (c.tags || []).some((t) => t.id === tagId));
  }
  return list;
};

const groupByLetter = (list) => {
  const sorted = [...list].sort((a, b) =>
    (a.name || "").localeCompare(b.name || "", "pt-BR", { sensitivity: "base" })
  );
  const map = new Map();
  sorted.forEach((c) => {
    const ch = (c.name || "?").trim().charAt(0).toUpperCase() || "?";
    const letter = /[A-ZÀ-Ü0-9]/i.test(ch) ? ch : "#";
    if (!map.has(letter)) map.set(letter, []);
    map.get(letter).push(c);
  });
  return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b, "pt-BR"));
};

const Contacts = () => {
  const classes = useStyles();
  const history = useHistory();
  const { user } = useContext(AuthContext);
  const mountedRef = useRef(true);

  const [loading, setLoading] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [searchParam, setSearchParam] = useState("");
  const [sidebarSearch, setSidebarSearch] = useState("");
  const [contacts, dispatch] = useReducer(reducer, []);
  const [selectedContact, setSelectedContact] = useState(null);
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [selectedContactId, setSelectedContactId] = useState(null);
  const [deletingContact, setDeletingContact] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [importConfirmOpen, setImportConfirmOpen] = useState(false);
  const [connections, setConnections] = useState([]);
  const [importConnectionId, setImportConnectionId] = useState("");
  const [hasMore, setHasMore] = useState(false);
  const [sidebarMode, setSidebarMode] = useState("all");
  const [tagFilterId, setTagFilterId] = useState(null);
  const [tagOptions, setTagOptions] = useState([]);

  const socketManager = useContext(SocketContext);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    api
      .get("/whatsapp")
      .then(({ data }) => {
        if (!mountedRef.current) return;
        setConnections(data);
        data.forEach((connection) => {
          if (connection.channel === "whatsapp" && connection.isDefault) {
            setImportConnectionId(connection.id);
          }
        });
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    api
      .get("/tags/list")
      .then(({ data }) => {
        if (mountedRef.current) setTagOptions(Array.isArray(data) ? data : []);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    dispatch({ type: "RESET" });
    setPageNumber(1);
  }, [searchParam]);

  useEffect(() => {
    setLoading(true);
    const delayDebounceFn = setTimeout(() => {
      const fetchContacts = async () => {
        try {
          const { data } = await api.get("/contacts/", {
            params: { searchParam, pageNumber },
          });
          if (!mountedRef.current) return;
          dispatch({ type: "LOAD_CONTACTS", payload: data.contacts });
          setHasMore(data.hasMore);
          setLoading(false);
        } catch (err) {
          if (mountedRef.current) {
            toastError(err);
            setLoading(false);
          }
        }
      };
      fetchContacts();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchParam, pageNumber]);

  useEffect(() => {
    const companyId = localStorage.getItem("companyId");
    const socket = socketManager.GetSocket(companyId);
    const onContact = (data) => {
      if (!mountedRef.current) return;
      if (!searchParam && ["update", "create"].includes(data.action)) {
        dispatch({ type: "UPDATE_CONTACTS", payload: data.contact });
      }
      if (data.action === "delete") {
        dispatch({ type: "DELETE_CONTACT", payload: +data.contactId });
        setSelectedContact((prev) =>
          prev && prev.id === +data.contactId ? null : prev
        );
      }
    };
    socket.on(`company-${companyId}-contact`, onContact);
    return () => {
      socket.disconnect();
    };
  }, [socketManager, searchParam]);

  const filteredList = useMemo(() => {
    const base = filterContacts(
      contacts,
      sidebarMode === "tag" ? "tag" : sidebarMode,
      tagFilterId
    );
    const q = sidebarSearch.trim().toLowerCase();
    if (!q) return base;
    return base.filter(
      (c) =>
        (c.name || "").toLowerCase().includes(q) ||
        (c.number || "").toLowerCase().includes(q) ||
        (c.email || "").toLowerCase().includes(q)
    );
  }, [contacts, sidebarMode, tagFilterId, sidebarSearch]);

  const grouped = useMemo(() => groupByLetter(filteredList), [filteredList]);

  const counts = useMemo(
    () => ({
      all: contacts.length,
      tagged: contacts.filter((c) => (c.tags || []).length > 0).length,
      groups: contacts.filter((c) => c.isGroup).length,
    }),
    [contacts]
  );

  const handleOpenContactModal = () => {
    setSelectedContactId(null);
    setContactModalOpen(true);
  };

  const handleCloseContactModal = () => {
    setSelectedContactId(null);
    setContactModalOpen(false);
  };

  const hadleEditContact = (contactId) => {
    setSelectedContactId(contactId);
    setContactModalOpen(true);
  };

  const handleDeleteContact = async (contactId) => {
    try {
      await api.delete(`/contacts/${contactId}`);
      toast.success(i18n.t("contacts.toasts.deleted"));
    } catch (err) {
      toastError(err);
    }
    setDeletingContact(null);
    setSearchParam("");
    setPageNumber(1);
    setSelectedContact(null);
  };

  const handleimportContact = async () => {
    try {
      await api.post("/contacts/import", { whatsappId: importConnectionId });
      history.go(0);
    } catch (err) {
      toastError(err);
    }
  };

  const loadMore = () => {
    setPageNumber((prevState) => prevState + 1);
  };

  const handleListScroll = (e) => {
    if (!hasMore || loading) return;
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - (scrollTop + 100) < clientHeight) {
      loadMore();
    }
  };

  const importCsv = async () => {
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = ".csv";
    fileInput.click();
    fileInput.onchange = async (e) => {
      const file = e.target.files[0];
      const formData = new FormData();
      formData.append("contacts", file);
      try {
        api
          .post("/contacts/importCsv", formData, {
            headers: { "Content-Type": "multipart/form-data" },
          })
          .then(() => toast.success(i18n.t("contacts.toasts.imported")))
          .catch((err) => toastError(err));
      } catch (err) {
        toastError(err);
      }
    };
  };

  const exportCsv = async () => {
    try {
      const { data } = await api.get("/contacts/exportCsv", {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "contacts.csv");
      document.body.appendChild(link);
      link.click();
    } catch (err) {
      toastError(err);
    }
  };

  const startWhatsapp = (payload) => {
    if (typeof window.mentionClick === "function") {
      window.mentionClick(payload);
    }
  };

  const subtitle =
    selectedContact &&
    [selectedContact.email, selectedContact.number].filter(Boolean).join(" · ");

  return (
    <MainContainer className={classes.pageRoot}>
      <ContactModal
        open={contactModalOpen}
        onClose={handleCloseContactModal}
        aria-labelledby="form-dialog-title"
        contactId={selectedContactId}
      />
      <ConfirmationModal
        title={`${i18n.t("contacts.confirmationModal.deleteTitle")} ${deletingContact?.name}?`}
        open={deleteConfirmOpen}
        onClose={setDeleteConfirmOpen}
        onConfirm={() => handleDeleteContact(deletingContact.id)}
      >
        {i18n.t("contacts.confirmationModal.deleteMessage")}
      </ConfirmationModal>
      <ConfirmationModal
        title={`${i18n.t("contacts.confirmationModal.importTitlte")}`}
        rawChildren
        okEnabled={importConnectionId}
        open={importConfirmOpen}
        onClose={setImportConfirmOpen}
        onConfirm={() => handleimportContact()}
      >
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <FormControl
              variant="outlined"
              margin="dense"
              style={{ width: "100%" }}
            >
              <InputLabel id="labelSelectWhatsapp">
                {i18n.t("common.connection")}
              </InputLabel>
              <Select
                labelId="labelSelectWhatsapp"
                label={i18n.t("common.connection")}
                name="whatsappId"
                value={importConnectionId || ""}
                onChange={(e) => setImportConnectionId(e.target.value)}
              >
                <MenuItem value="">&nbsp;</MenuItem>
                {connections.map(
                  (connection) =>
                    connection.channel === "whatsapp" && (
                      <MenuItem key={connection.id} value={connection.id}>
                        {connection.name}
                      </MenuItem>
                    )
                )}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </ConfirmationModal>

      <div className="contacts-mac-page">
        <div className="contacts-mac contacts-mac-app">
          <aside className="sidebar-left contacts-mac">
            <div className="window-controls" aria-hidden>
              <span className="control close" />
              <span className="control minimize" />
              <span className="control maximize" />
            </div>
            <div className="search-bar">
              <SearchIcon fontSize="small" />
              <input
                type="search"
                placeholder="Buscar na lista…"
                value={sidebarSearch}
                onChange={(e) => setSidebarSearch(e.target.value)}
              />
            </div>

            <div className="sidebar-section">
              <ul>
                <li
                  className={sidebarMode === "all" && !tagFilterId ? "active" : ""}
                  onClick={() => {
                    setSidebarMode("all");
                    setTagFilterId(null);
                  }}
                >
                  <AccessTime fontSize="small" />
                  {i18n.t("contacts.title")}
                  <span className="count">{counts.all}</span>
                </li>
                <li
                  className={sidebarMode === "tagged" ? "active" : ""}
                  onClick={() => {
                    setSidebarMode("tagged");
                    setTagFilterId(null);
                  }}
                >
                  <StarBorder fontSize="small" />
                  Com tags
                  <span className="count">{counts.tagged}</span>
                </li>
                <li
                  className={sidebarMode === "groups" ? "active" : ""}
                  onClick={() => {
                    setSidebarMode("groups");
                    setTagFilterId(null);
                  }}
                >
                  <GroupOutlined fontSize="small" />
                  Grupos
                  <span className="count">{counts.groups}</span>
                </li>
              </ul>
            </div>

            <div className="sidebar-section">
              <h4>Tags</h4>
              <ul>
                {tagOptions.map((tag) => (
                  <li
                    key={tag.id}
                    className={
                      sidebarMode === "tag" && tagFilterId === tag.id ? "active" : ""
                    }
                    onClick={() => {
                      setSidebarMode("tag");
                      setTagFilterId(tag.id);
                    }}
                  >
                    <LabelOutlined fontSize="small" />
                    <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>
                      {tag.name}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="sidebar-toolbar">
              <Button size="small" variant="outlined" onClick={handleOpenContactModal}>
                {i18n.t("contacts.buttons.add")}
              </Button>
              {user?.profile === "admin" && (
                <>
                  <Button size="small" variant="outlined" onClick={importCsv}>
                    <FontAwesomeIcon icon={faCloudArrowUp} />
                  </Button>
                  <Button size="small" variant="outlined" onClick={exportCsv}>
                    <FontAwesomeIcon icon={faDownload} />
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => setImportConfirmOpen(true)}
                  >
                    {i18n.t("contacts.buttons.import")}
                  </Button>
                </>
              )}
            </div>

            <div className="sidebar-section bottom">
              <Tooltip title={i18n.t("contacts.buttons.add")}>
                <button
                  type="button"
                  className="add-btn"
                  aria-label={i18n.t("contacts.buttons.add")}
                  onClick={handleOpenContactModal}
                >
                  <AddIcon style={{ fontSize: 18 }} />
                </button>
              </Tooltip>
            </div>
          </aside>

          <div className="contact-list-container contacts-mac">
            <div className="main-header">
              <div className="nav-arrows">
                <button
                  type="button"
                  aria-label="Voltar"
                  disabled={!selectedContact}
                  onClick={() => setSelectedContact(null)}
                >
                  <ChevronLeft fontSize="small" />
                </button>
                <button type="button" aria-label="Avançar" disabled>
                  <ChevronRight fontSize="small" />
                </button>
              </div>
              <div className="header-title">
                <h3>
                  {selectedContact
                    ? selectedContact.name
                    : "Contatos"}
                </h3>
                <span>
                  {selectedContact
                    ? subtitle || "Perfil 360º · conversas e mídia"
                    : "Selecione um contato ou use os filtros à esquerda"}
                </span>
              </div>
              <div
                className="header-actions"
                style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 4 }}
              >
                {selectedContact && (
                  <>
                    <button
                      type="button"
                      className="edit-btn"
                      onClick={() => hadleEditContact(selectedContact.id)}
                    >
                      Editar
                    </button>
                    <Can
                      role={user.profile}
                      perform="contacts-page:deleteContact"
                      yes={() => (
                        <IconButton
                          size="small"
                          onClick={() => {
                            setDeletingContact(selectedContact);
                            setDeleteConfirmOpen(true);
                          }}
                          aria-label="Excluir"
                        >
                          <DeleteOutlineIcon fontSize="small" />
                        </IconButton>
                      )}
                    />
                  </>
                )}
              </div>
            </div>

            <div className="contact-list-content">
              <div
                className="contact-list-pane"
                onScroll={handleListScroll}
              >
                <div className="search-bar" style={{ margin: "0 12px 12px" }}>
                  <SearchIcon fontSize="small" />
                  <input
                    type="search"
                    placeholder={i18n.t("contacts.searchPlaceholder")}
                    value={searchParam}
                    onChange={(e) => setSearchParam(e.target.value.toLowerCase())}
                  />
                </div>
                {grouped.map(([letter, rows]) => (
                  <div key={letter} className="list-section">
                    <div className="list-divider">{letter}</div>
                    {rows.map((contact) => (
                      <div
                        key={contact.id}
                        className={`contact-item ${
                          selectedContact?.id === contact.id ? "selected" : ""
                        }`}
                        role="button"
                        tabIndex={0}
                        onClick={() => setSelectedContact(contact)}
                        onKeyDown={(e) =>
                          e.key === "Enter" && setSelectedContact(contact)
                        }
                      >
                        {contact.profilePicUrl ? (
                          <img
                            src={contact.profilePicUrl}
                            alt=""
                            className="contact-avatar"
                          />
                        ) : (
                          <div
                            className="contact-avatar initial"
                            style={{
                              backgroundColor: generateColor(contact.number || contact.name),
                              color: "#fff",
                            }}
                          >
                            {getInitials(contact.name)}
                          </div>
                        )}
                        <div className="contact-item-text">
                          <span className="contact-item-name">{contact.name}</span>
                          <span className="contact-item-sub">
                            {[contact.number, contact.email].filter(Boolean).join(" · ") ||
                              (contact.isGroup ? "Grupo" : "Contato")}
                          </span>
                        </div>
                        <span className="tag-dots">
                          {(contact.tags || []).slice(0, 3).map((tag) => (
                            <span
                              key={tag.id}
                              className="tag-dot"
                              style={{ backgroundColor: tag.color || "#888" }}
                            />
                          ))}
                        </span>
                      </div>
                    ))}
                  </div>
                ))}
                {loading && (
                  <div style={{ padding: 16, textAlign: "center", fontSize: 13 }}>
                    Carregando…
                  </div>
                )}
                {!loading && filteredList.length === 0 && (
                  <div className="empty-hint">Nenhum contato neste filtro.</div>
                )}
              </div>

              <ContactDetailPanel
                listContact={selectedContact}
                user={user}
                onEdit={() =>
                  selectedContact && hadleEditContact(selectedContact.id)
                }
                onStartWhatsapp={startWhatsapp}
              />
            </div>
          </div>
        </div>
      </div>
    </MainContainer>
  );
};

export default Contacts;
