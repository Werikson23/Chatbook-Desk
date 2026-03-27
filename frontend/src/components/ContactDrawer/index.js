import React, { useEffect, useMemo, useState } from "react";

import { makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import IconButton from "@material-ui/core/IconButton";
import CloseIcon from "@material-ui/icons/Close";
import Drawer from "@material-ui/core/Drawer";
import Link from "@material-ui/core/Link";
import Avatar from "@material-ui/core/Avatar";
import Button from "@material-ui/core/Button";
import Paper from "@material-ui/core/Paper";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import ExpandLessIcon from "@material-ui/icons/ExpandLess";
import EmailIcon from "@material-ui/icons/Email";
import PhoneIcon from "@material-ui/icons/Phone";
import BusinessIcon from "@material-ui/icons/Business";
import RoomIcon from "@material-ui/icons/Room";
import FileCopyOutlinedIcon from "@material-ui/icons/FileCopyOutlined";
import LaunchIcon from "@material-ui/icons/Launch";

import { i18n } from "../../translate/i18n";

import ContactDrawerSkeleton from "../ContactDrawerSkeleton";
import WhatsMarked from "react-whatsmarked";
import ContactModal from "../ContactModal";
import { TicketNotes } from "../TicketNotes";
import { generateColor } from "../../helpers/colorGenerator";
import { getInitials } from "../../helpers/getInitials";
import { TagsContainer } from "../TagsContainer";
import useSettings from "../../hooks/useSettings";
import FullscreenImageDialog from "../FullscreenImageDialog";
import DynamicAttributesPanel from "../DynamicAttributesPanel";
import api from "../../services/api";
import { useHistory } from "react-router-dom";

const drawerWidth = 320;

const COLLAPSE_STORAGE_KEY = "chatbookContactDrawerSections_v1";

const useStyles = makeStyles(theme => ({
	drawer: {
		width: drawerWidth,
		flexShrink: 0,
    [theme.breakpoints.down(1400)]: {
      position: 'absolute',
      top: 0,
      right: 0,
      bottom: 0,
    },
	},

  drawerHidden: {
    display: 'none',
  },

	drawerPaper: {
		width: drawerWidth,
		display: "flex",
    flexDirection: "column",
		borderTop: "1px solid #2b2e33",
		borderRight: "1px solid #2b2e33",
		borderBottom: "1px solid #2b2e33",
    background: "#1c1e21",
    color: "#f8f9fa",
    overflow: "hidden",
	},
  profileHeader: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "12px 12px",
    borderBottom: "1px solid #2b2e33",
    background: "#1c1e21",
    flex: "0 0 auto",
  },
  headerText: {
    flex: 1,
    minWidth: 0,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 600,
    lineHeight: 1.2,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  headerSub: {
    marginTop: 2,
    fontSize: 12,
    color: "#9ca3af",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  avatarSm: {
    width: 56,
    height: 56,
    cursor: "pointer",
  },
	content: {
		flex: 1,
		minHeight: 0,
		overflowY: "auto",
		background: "#1c1e21",
		...theme.scrollbarStyles,
	},

  loadingArea: {
    flex: 1,
    minHeight: 0,
    display: "flex",
    flexDirection: "column",
  },

	contactAvatar: {
		margin: 15,
		width: 100,
		height: 100,
	},

	section: {
    borderBottom: "1px solid #2b2e33",
    background: "#1c1e21",
  },
  sectionHeader: {
    width: "100%",
    border: 0,
    background: "#1c1e21",
    padding: "11px 12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    cursor: "pointer",
    textAlign: "left",
  },
  sectionTitle: {
    fontSize: 12.5,
    fontWeight: 500,
    color: "#f8f9fa",
  },
  sectionBody: {
    padding: "0 12px 12px 12px",
  },
  sectionBodyInner: {
    maxHeight: 280,
    overflowY: "auto",
    ...theme.scrollbarStyles,
  },
	kvRow: {
    display: "flex",
    gap: 8,
    padding: "6px 8px",
    borderRadius: 8,
    background: "#272a2e",
    marginTop: 8,
    fontSize: 12,
  },
  kvKey: {
    fontWeight: 600,
    minWidth: 92,
    color: "#9ca3af",
  },
  kvValue: {
    flex: 1,
    minWidth: 0,
    color: "#f8f9fa",
    wordBreak: "break-word",
  },
	mapImg: {
    width: "100%",
    borderRadius: 10,
    marginTop: 10,
    display: "block",
  },
}));

const ContactDrawer = ({
  open,
  handleDrawerClose,
  contact,
  ticket,
  loading,
  docked = false,
  chatwootUI = false,
}) => {
	const classes = useStyles();
  const { getSetting } = useSettings();
  const history = useHistory();

  const getBestAvatarUrl = (url) => {
    if (!url) return "";
    return String(url).replace(/s96x96/gi, "s640x640");
  };

	const [modalOpen, setModalOpen] = useState(false);
  const [showTags, setShowTags] = useState(false);
  const [avatarOpen, setAvatarOpen] = useState(false);
  const [previewImageUrl, setPreviewImageUrl] = useState("");
  const [contactAttrContainers, setContactAttrContainers] = useState([]);
  const [ticketAttrContainers, setTicketAttrContainers] = useState([]);
  const [previousTickets, setPreviousTickets] = useState([]);
  const [previousLoading, setPreviousLoading] = useState(false);
  const [openSections, setOpenSections] = useState({
    tags: true,
    details: true,
    integration: true,
    notes: true,
    previousOpen: true,
    previousClosed: false,
  });

	useEffect(() => {
    getSetting("tagsMode").then(res => {
      setShowTags(["contact", "both"].includes(res));
    });
        
		setModalOpen(false);
    setAvatarOpen(false);
    setPreviewImageUrl("");
	}, [open, contact, getSetting]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(COLLAPSE_STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object") {
        setOpenSections((prev) => ({ ...prev, ...parsed }));
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(COLLAPSE_STORAGE_KEY, JSON.stringify(openSections));
    } catch {
      // ignore
    }
  }, [openSections]);

  const toggleSection = (key) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const iframeSource = useMemo(() => {
    return (contact?.extraInfo || []).find((info) => {
    const key = String(info?.name || "").toLowerCase();
    const value = String(info?.value || "");
    return (key.includes("iframe") || key.includes("crm") || key.includes("erp") || key.includes("url")) &&
      /^https?:\/\//i.test(value);
  })?.value;
  }, [contact?.extraInfo]);

  const extraInfoRows = useMemo(() => {
    const rows = contact?.extraInfo || [];
    return rows.filter((info) => {
      const key = String(info?.name || "").toLowerCase();
      const value = String(info?.value || "");
      const isIframeKey =
        key.includes("iframe") || key.includes("crm") || key.includes("erp") || key.includes("url");
      if (isIframeKey && /^https?:\/\//i.test(value)) {
        return false;
      }
      return true;
    });
  }, [contact?.extraInfo]);

  const mapImageUrl = useMemo(() => {
    const match = (contact?.extraInfo || []).find((info) => {
      const key = String(info?.name || "").toLowerCase();
      const value = String(info?.value || "");
      return (key.includes("map") || key.includes("maps") || key.includes("google")) && /^https?:\/\//i.test(value);
    });
    return match?.value;
  }, [contact?.extraInfo]);

  useEffect(() => {
    let active = true;
    const loadContainers = async () => {
      try {
        if (contact?.id) {
          const { data } = await api.get(`/entities/contact/${contact.id}/attributes/schema`);
          if (active) setContactAttrContainers(data?.containers || []);
        } else if (active) {
          setContactAttrContainers([]);
        }
        if (ticket?.id) {
          const { data } = await api.get(`/entities/ticket/${ticket.id}/attributes/schema`);
          if (active) setTicketAttrContainers(data?.containers || []);
        } else if (active) {
          setTicketAttrContainers([]);
        }
      } catch {
        if (active) {
          setContactAttrContainers([]);
          setTicketAttrContainers([]);
        }
      }
    };
    loadContainers();
    return () => {
      active = false;
    };
  }, [contact?.id, ticket?.id, open]);

  useEffect(() => {
    let active = true;
    const loadPrevious = async () => {
      if (!contact?.id || !open) {
        if (active) setPreviousTickets([]);
        return;
      }
      setPreviousLoading(true);
      try {
        const { data } = await api.get("/tickets", {
          params: { contactId: contact.id, pageNumber: "1", showAll: "true" }
        });
        if (active) {
          const rows = Array.isArray(data?.tickets) ? data.tickets : [];
          setPreviousTickets(rows.filter((t) => !ticket?.id || t.id !== ticket.id));
        }
      } catch {
        if (active) setPreviousTickets([]);
      } finally {
        if (active) setPreviousLoading(false);
      }
    };
    loadPrevious();
    return () => {
      active = false;
    };
  }, [contact?.id, ticket?.id, open]);

  const openOrPendingTickets = useMemo(
    () => previousTickets.filter((t) => t.status === "open" || t.status === "pending"),
    [previousTickets]
  );
  const closedTickets = useMemo(
    () => previousTickets.filter((t) => t.status === "closed"),
    [previousTickets]
  );

  const statusLabel = (s) =>
    ({ open: "Aberto", pending: "Pendente", closed: "Fechado" }[s] || s || "—");

  const openTicket = (tk) => {
    if (tk?.uuid) {
      history.push(`/tickets/${tk.uuid}`);
      return;
    }
    if (tk?.id) history.push(`/tickets/${tk.id}`);
  };

  const Section = ({ sectionKey, title, defaultOpen = true, children }) => {
    const isOpen = openSections[sectionKey] ?? defaultOpen;
    return (
      <div className={classes.section}>
        <button
          type="button"
          className={classes.sectionHeader}
          onClick={() => toggleSection(sectionKey)}
        >
          <div className={classes.sectionTitle}>{title}</div>
          {isOpen ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
        </button>
        {isOpen ? <div className={classes.sectionBody}><div className={classes.sectionBodyInner}>{children}</div></div> : null}
      </div>
    );
  };

  const ChatwootSection = ({ sectionKey, title, children }) => {
    const isOpen = openSections[sectionKey] ?? false;
    return (
      <div className={classes.section}>
        <button
          type="button"
          className={classes.sectionHeader}
          onClick={() => toggleSection(sectionKey)}
        >
          <div className={classes.sectionTitle}>{title}</div>
          {isOpen ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
        </button>
        {isOpen ? (
          <div className={classes.sectionBody}>
            <div className={classes.sectionBodyInner}>{children}</div>
          </div>
        ) : null}
      </div>
    );
  };

  const HistoryBlock = ({ sectionKey, title, rows }) => {
    const isOpen = openSections[sectionKey] ?? false;
    return (
      <div style={{ border: "1px solid #2b2e33", borderRadius: 8, marginBottom: 10 }}>
        <button
          type="button"
          className={classes.sectionHeader}
          onClick={() => toggleSection(sectionKey)}
          style={{ padding: "8px 10px", borderRadius: 8 }}
        >
          <div className={classes.sectionTitle}>{title}</div>
          {isOpen ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
        </button>
        {isOpen ? (
          <div style={{ padding: "6px 8px 10px 8px" }}>
            {!rows.length ? (
              <Typography variant="body2" style={{ color: "#9ca3af" }}>
                Nenhuma conversa neste bloco.
              </Typography>
            ) : (
              rows.map((tk) => (
                <div
                  key={tk.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => openTicket(tk)}
                  onKeyDown={(e) => e.key === "Enter" && openTicket(tk)}
                  style={{
                    marginTop: 6,
                    padding: "8px 9px",
                    borderRadius: 8,
                    border: "1px solid #2b2e33",
                    cursor: "pointer",
                    background: "#23262b",
                  }}
                >
                  <Typography variant="caption" style={{ color: "#f8f9fa", display: "block", fontWeight: 600 }}>
                    #{tk.id} · {statusLabel(tk.status)}
                  </Typography>
                  <Typography variant="caption" style={{ color: "#9ca3af", display: "block" }}>
                    {tk.queue?.name || "Sem fila"} · {tk.user?.name || "Sem responsável"}
                  </Typography>
                  {tk.lastMessage ? (
                    <Typography variant="caption" style={{ color: "#cdd2da", display: "block", marginTop: 4 }}>
                      {String(tk.lastMessage).slice(0, 90)}
                    </Typography>
                  ) : null}
                </div>
              ))
            )}
          </div>
        ) : null}
      </div>
    );
  };

  const drawerContent = (
    <>
      {loading ? (
        <div className={classes.loadingArea}>
          <ContactDrawerSkeleton classes={classes} />
        </div>
      ) : (
        <>
          {chatwootUI ? (
            <>
              <div style={{ display: "flex", borderBottom: "1px solid #2b2e33" }}>
                <div style={{ flex: 1, textAlign: "center", padding: "12px 0", color: "#1c64f2", borderBottom: "2px solid #1c64f2", fontWeight: 600, fontSize: 13 }}>
                  Contact
                </div>
                <div style={{ flex: 1, textAlign: "center", padding: "12px 0", color: "#9ca3af", fontWeight: 500, fontSize: 13 }}>
                  Copilot
                </div>
              </div>

              <div style={{ padding: "24px 16px", borderBottom: "1px solid #2b2e33" }}>
                <Avatar
                  src={contact.profilePicUrl}
                  alt="contact"
                  imgProps={{
                    onClick: () => {
                      if (contact.profilePicUrl) {
                        setPreviewImageUrl(getBestAvatarUrl(contact.profilePicUrl));
                        setAvatarOpen(true);
                      }
                    },
                    style: { cursor: contact?.profilePicUrl ? "zoom-in" : "default" }
                  }}
                  style={{
                    width: 72,
                    height: 72,
                    marginBottom: 16,
                    backgroundColor: generateColor(contact?.number),
                    color: "white",
                    fontWeight: "bold",
                    cursor: "pointer",
                  }}
                  onClick={() => {
                    if (contact.profilePicUrl) {
                      setPreviewImageUrl(getBestAvatarUrl(contact.profilePicUrl));
                      setAvatarOpen(true);
                    }
                  }}
                  onClickCapture={() => {
                    if (contact.profilePicUrl) {
                      setPreviewImageUrl(getBestAvatarUrl(contact.profilePicUrl));
                      setAvatarOpen(true);
                    }
                  }}
                >
                  {getInitials(contact?.name)}
                </Avatar>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Typography style={{ color: "#f8f9fa", fontWeight: 600, fontSize: 16 }}>
                    {contact?.name || "Contato"}
                  </Typography>
                  <LaunchIcon style={{ color: "#9ca3af", fontSize: 18 }} />
                </div>
                <Typography style={{ color: "#9ca3af", fontSize: 13, marginTop: 4 }}>
                  {ticket?.channel || "Customer"}
                </Typography>

                <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, color: "#9ca3af", fontSize: 13 }}>
                    <EmailIcon style={{ fontSize: 16 }} />
                    <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {contact?.email || "sem-email@contato"}
                    </span>
                    <FileCopyOutlinedIcon style={{ marginLeft: "auto", fontSize: 16, cursor: "pointer" }} />
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, color: "#9ca3af", fontSize: 13 }}>
                    <PhoneIcon style={{ fontSize: 16 }} />
                    <span>{contact?.number || "-"}</span>
                    <FileCopyOutlinedIcon style={{ marginLeft: "auto", fontSize: 16, cursor: "pointer" }} />
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, color: "#9ca3af", fontSize: 13 }}>
                    <BusinessIcon style={{ fontSize: 16 }} />
                    <span>{contact?.companyName || "N/A"}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, color: "#9ca3af", fontSize: 13 }}>
                    <RoomIcon style={{ fontSize: 16 }} />
                    <span>{contact?.city ? `${contact.city}` : "N/A"}</span>
                  </div>
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  gap: 16,
                  padding: "12px 16px",
                  borderBottom: "1px solid #2b2e33",
                  color: "#9ca3af",
                  fontSize: 20,
                }}
              >
                <span style={{ cursor: "pointer" }}>f</span>
                <span style={{ cursor: "pointer" }}>x</span>
                <span style={{ cursor: "pointer" }}>in</span>
              </div>

              <div className={classes.content}>
                <ChatwootSection sectionKey="actions" title="Conversation Actions">
                  <Typography variant="body2" style={{ color: "#9ca3af" }}>
                    Ações da conversa.
                  </Typography>
                </ChatwootSection>
                <ChatwootSection sectionKey="participants" title="Conversation participants">
                  <Typography variant="body2" style={{ color: "#9ca3af" }}>
                    Participantes da conversa.
                  </Typography>
                </ChatwootSection>
                <ChatwootSection sectionKey="macros" title="Macros">
                  <Typography variant="body2" style={{ color: "#9ca3af" }}>
                    Nenhuma macro disponível.
                  </Typography>
                </ChatwootSection>
                <ChatwootSection sectionKey="tags" title="Contact Tags">
                  <div style={{ marginBottom: 12 }}>
                    <Typography variant="caption" style={{ color: "#9ca3af", display: "block", marginBottom: 6 }}>
                      Etiquetas
                    </Typography>
                    <TagsContainer
                      contact={contact}
                      compact
                    />
                  </div>
                </ChatwootSection>
                {contactAttrContainers.map((container) => (
                  <ChatwootSection
                    key={`contact-attr-${container.id}`}
                    sectionKey={`contact-attr-${container.id}`}
                    title={container.name}
                  >
                    {contact?.id ? (
                      <DynamicAttributesPanel
                        entityType="contact"
                        entityId={contact.id}
                        containerId={container.id}
                        renderAsSection={false}
                        chatwoot
                      />
                    ) : null}
                  </ChatwootSection>
                ))}
                {ticketAttrContainers.map((container) => (
                  <ChatwootSection
                    key={`ticket-attr-${container.id}`}
                    sectionKey={`ticket-attr-${container.id}`}
                    title={container.name}
                  >
                    {ticket?.id ? (
                      <DynamicAttributesPanel
                        entityType="ticket"
                        entityId={ticket.id}
                        containerId={container.id}
                        renderAsSection={false}
                        chatwoot
                      />
                    ) : null}
                  </ChatwootSection>
                ))}
                {extraInfoRows.length ? (
                  <ChatwootSection sectionKey="legacy-attrs" title="Legacy Attributes">
                    {extraInfoRows.map((info) => (
                      <div key={`${info?.name}-${info?.value}`} className={classes.kvRow}>
                        <div className={classes.kvKey}>{info?.name}</div>
                        <div className={classes.kvValue}>
                          <WhatsMarked>{String(info?.value || "")}</WhatsMarked>
                        </div>
                      </div>
                    ))}
                  </ChatwootSection>
                ) : null}
                <ChatwootSection sectionKey="info" title="Conversation Information">
                  <TicketNotes ticket={ticket} compact />
                </ChatwootSection>
                <ChatwootSection sectionKey="previous" title="Previous Conversations">
                  {previousLoading ? (
                    <Typography variant="body2" style={{ color: "#9ca3af" }}>
                      Carregando conversas...
                    </Typography>
                  ) : (
                    <>
                      <HistoryBlock
                        sectionKey="previousOpen"
                        title={`Abertas/Pendentes (${openOrPendingTickets.length})`}
                        rows={openOrPendingTickets}
                      />
                      <HistoryBlock
                        sectionKey="previousClosed"
                        title={`Fechadas (${closedTickets.length})`}
                        rows={closedTickets}
                      />
                      {!openOrPendingTickets.length && !closedTickets.length ? (
                        <Typography variant="body2" style={{ color: "#9ca3af" }}>
                          Sem conversas anteriores.
                        </Typography>
                      ) : null}
                    </>
                  )}
                </ChatwootSection>
              </div>

              <ContactModal open={modalOpen} onClose={() => setModalOpen(false)} contactId={contact.id} />
              <FullscreenImageDialog
                open={avatarOpen}
                imageUrl={previewImageUrl}
                onClose={() => setAvatarOpen(false)}
                alt="contact-avatar-fullscreen"
              />
            </>
          ) : (
            <>
          <div style={{ display: "flex", borderBottom: "1px solid #2b2e33" }}>
            <div style={{ flex: 1, textAlign: "center", padding: "12px 0", color: "#1c64f2", borderBottom: "2px solid #1c64f2", fontWeight: 600, fontSize: 13 }}>
              Contact
            </div>
            <div style={{ flex: 1, textAlign: "center", padding: "12px 0", color: "#9ca3af", fontWeight: 500, fontSize: 13 }}>
              Copilot
            </div>
          </div>
          <div className={classes.profileHeader}>
            {!docked && (
              <IconButton size="small" onClick={handleDrawerClose} aria-label="close-drawer">
                <CloseIcon />
              </IconButton>
            )}
            <Avatar
              className={classes.avatarSm}
              src={contact.profilePicUrl}
              alt="contact"
              imgProps={{
                onClick: () => {
                  if (contact.profilePicUrl) {
                    setPreviewImageUrl(getBestAvatarUrl(contact.profilePicUrl));
                    setAvatarOpen(true);
                  }
                },
                style: { cursor: contact?.profilePicUrl ? "zoom-in" : "default" }
              }}
              style={{
                backgroundColor: generateColor(contact?.number),
                color: "white",
                fontWeight: "bold",
              }}
              onClick={() => {
                if (contact.profilePicUrl) {
                  setPreviewImageUrl(getBestAvatarUrl(contact.profilePicUrl));
                  setAvatarOpen(true);
                }
              }}
              onClickCapture={() => {
                if (contact.profilePicUrl) {
                  setPreviewImageUrl(getBestAvatarUrl(contact.profilePicUrl));
                  setAvatarOpen(true);
                }
              }}
            >
              {getInitials(contact?.name)}
            </Avatar>
            <div className={classes.headerText}>
              <div className={classes.headerTitle}>{contact?.name || i18n.t("contactDrawer.header")}</div>
              <div className={classes.headerSub}>
                {contact?.number ? (
                  <Link href={`tel:${contact.number}`} color="inherit" underline="hover">
                    {contact.number}
                  </Link>
                ) : null}
                {contact?.number && contact?.email ? " · " : null}
                {contact?.email ? (
                  <Link href={`mailto:${contact.email}`} color="inherit" underline="hover">
                    {contact.email}
                  </Link>
                ) : null}
              </div>
            </div>
            <Button
              variant="outlined"
              size="small"
              onClick={() => setModalOpen(true)}
              style={{ color: "#9ca3af", borderColor: "#2b2e33" }}
            >
              {i18n.t("contactDrawer.buttons.editShort")}
            </Button>
          </div>

          <div className={classes.content}>
            {showTags && (
              <Section sectionKey="tags" title="Conversation Actions">
                <TagsContainer contact={contact} compact />
              </Section>
            )}

            {Boolean(iframeSource) && (
              <Section sectionKey="integration" title="Conversation participants">
                <Typography variant="caption" color="textSecondary" style={{ display: "block", marginBottom: 8 }}>
                  {iframeSource}
                </Typography>
                <iframe
                  title="contact-external-view"
                  src={iframeSource}
                  style={{ width: "100%", height: 260, border: 0, borderRadius: 10 }}
                />
              </Section>
            )}

            <Section sectionKey="details" title="Contact Attributes">
              {extraInfoRows.length ? (
                <>
                  {extraInfoRows.map((info) => (
                    <div key={`${info?.name}-${info?.value}`} className={classes.kvRow}>
                      <div className={classes.kvKey}>{info?.name}</div>
                      <div className={classes.kvValue}>
                        <WhatsMarked>{String(info?.value || "")}</WhatsMarked>
                      </div>
                    </div>
                  ))}
                </>
              ) : (
                <Typography variant="body2" color="textSecondary">
                  {i18n.t("contactDrawer.emptyDetails")}
                </Typography>
              )}

              {mapImageUrl ? (
                <img
                  className={classes.mapImg}
                  src={mapImageUrl}
                  alt="Pré-visualização do mapa"
                  style={{ cursor: "pointer" }}
                  onClick={() => {
                    setPreviewImageUrl(mapImageUrl);
                    setAvatarOpen(true);
                  }}
                />
              ) : null}
            </Section>

            <Section sectionKey="notes" title="Conversation Information">
              <Typography variant="caption" style={{ display: "block", marginBottom: 8, color: "#9ca3af" }}>
                {i18n.t("ticketOptionsMenu.appointmentsModal.title")}
              </Typography>
              <TicketNotes ticket={ticket} compact />
            </Section>
            <Section sectionKey="previous" title="Previous Conversations">
              {previousLoading ? (
                <Typography variant="body2" style={{ color: "#9ca3af" }}>
                  Carregando conversas...
                </Typography>
              ) : (
                <>
                  <HistoryBlock
                    sectionKey="previousOpen"
                    title={`Abertas/Pendentes (${openOrPendingTickets.length})`}
                    rows={openOrPendingTickets}
                  />
                  <HistoryBlock
                    sectionKey="previousClosed"
                    title={`Fechadas (${closedTickets.length})`}
                    rows={closedTickets}
                  />
                  {!openOrPendingTickets.length && !closedTickets.length ? (
                    <Typography variant="body2" style={{ color: "#9ca3af" }}>
                      Sem conversas anteriores.
                    </Typography>
                  ) : null}
                </>
              )}
            </Section>
          </div>

          <ContactModal open={modalOpen} onClose={() => setModalOpen(false)} contactId={contact.id} />

          <FullscreenImageDialog
            open={avatarOpen}
            imageUrl={previewImageUrl}
            onClose={() => setAvatarOpen(false)}
            alt="contact-avatar-fullscreen"
          />
            </>
          )}
        </>
      )}
    </>
  );

	return (
		<>
      {docked ? (
        <div className={classes.drawer}>
          <Paper className={classes.drawerPaper} square elevation={0} style={{ position: "relative", height: "100%" }}>
            {drawerContent}
          </Paper>
        </div>
      ) : (
			<Drawer
				className={open ? classes.drawer : classes.drawerHidden}
				variant="persistent"
				anchor="right"
				open={open}
				PaperProps={{ style: { position: "absolute" } }}
				BackdropProps={{ style: { position: "absolute" } }}
				ModalProps={{
					container: document.getElementById("drawer-container"),
					style: { position: "absolute" },
				}}
				classes={{
					paper: classes.drawerPaper,
				}}
			>
        {drawerContent}
			</Drawer>
      )}
		</>
	);
};

export default ContactDrawer;
