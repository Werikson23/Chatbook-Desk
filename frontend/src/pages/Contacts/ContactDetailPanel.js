import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useHistory } from "react-router-dom";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Message as MessageIcon,
  Phone,
  Videocam,
  Email as EmailIcon,
  MoreHoriz,
  Event,
  Person,
  Label,
  AssignmentInd,
  History,
  OpenInNew,
} from "@material-ui/icons";
import { CircularProgress } from "@material-ui/core";

import api from "../../services/api";
import toastError from "../../errors/toastError";
import { i18n } from "../../translate/i18n";
import { generateColor } from "../../helpers/colorGenerator";
import { getInitials } from "../../helpers/getInitials";
import FullscreenImageDialog from "../../components/FullscreenImageDialog";
import DynamicAttributesPanel from "../../components/DynamicAttributesPanel";
import { getBackendURL } from "../../services/config";

const TABS = [
  { id: "summary", label: "Resumo" },
  { id: "conversations", label: "Conversas" },
  { id: "messages", label: "Mensagens" },
  { id: "media", label: "Mídia" },
  { id: "tags", label: "Tags" },
  { id: "attributes", label: "Atributos" },
  { id: "activity", label: "Atividade" },
];

function mediaUrl(msg) {
  const raw = msg?.mediaUrl || msg?.body?.split?.("\n")?.[0] || "";
  if (!raw) return "";
  const value = String(raw).trim();
  const backend = getBackendURL();
  if (/^(blob:|data:)/i.test(value)) return value;
  if (/^https?:/i.test(value)) {
    try {
      const parsed = new URL(value);
      if (parsed.pathname.startsWith("/public/")) {
        return `${backend}${parsed.pathname}${parsed.search || ""}`;
      }
    } catch {
      // keep original absolute URL when parsing fails
    }
    return value;
  }
  if (value.startsWith("/")) return `${backend}${value}`;
  return `${backend}/${value}`;
}

function isMediaMessage(msg) {
  const t = (msg?.mediaType || "").toLowerCase();
  if (t && t !== "chat" && t !== "conversation") return true;
  const u = mediaUrl(msg);
  return /^https?:\/\//i.test(u || "") || /\.(jpe?g|png|gif|webp|mp4|pdf|ogg|opus)(\?|$)/i.test(u);
}

function presencePt(p) {
  const map = {
    available: "Disponível",
    unavailable: "Indisponível",
    composing: "Digitando",
    recording: "Gravando",
    paused: "Pausado",
  };
  return map[p] || p || "—";
}

const ContactDetailPanel = ({
  listContact,
  user,
  onEdit,
  onStartWhatsapp,
}) => {
  const history = useHistory();
  const [tab, setTab] = useState("summary");
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImageUrl, setPreviewImageUrl] = useState("");

  const [tickets, setTickets] = useState([]);
  const [ticketsLoading, setTicketsLoading] = useState(false);
  const [ticketsPage, setTicketsPage] = useState(1);
  const [ticketsHasMore, setTicketsHasMore] = useState(false);

  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [messagesPage, setMessagesPage] = useState(1);
  const [messagesHasMore, setMessagesHasMore] = useState(false);

  const contactId = listContact?.id;

  const loadDetail = useCallback(async () => {
    if (!contactId) return;
    setDetailLoading(true);
    try {
      const { data } = await api.get(`/contacts/${contactId}`);
      setDetail(data);
    } catch (err) {
      toastError(err);
      setDetail(null);
    } finally {
      setDetailLoading(false);
    }
  }, [contactId]);

  const loadTickets = useCallback(
    async (page = 1, append = false) => {
      if (!contactId) return;
      setTicketsLoading(true);
      try {
        const params = {
          contactId,
          pageNumber: String(page),
          showAll: user?.profile === "admin" ? "true" : undefined,
        };
        const { data } = await api.get("/tickets", { params });
        setTickets((prev) =>
          append ? [...prev, ...data.tickets] : data.tickets
        );
        setTicketsHasMore(data.hasMore);
        setTicketsPage(page);
      } catch (err) {
        toastError(err);
      } finally {
        setTicketsLoading(false);
      }
    },
    [contactId, user?.profile]
  );

  const loadMessages = useCallback(
    async (ticketId, page = 1, append = false) => {
      if (!ticketId) return;
      setMessagesLoading(true);
      try {
        const { data } = await api.get(`/messages/${ticketId}`, {
          params: { pageNumber: String(page), markAsRead: "false" },
        });
        setMessages((prev) =>
          append ? [...prev, ...data.messages] : data.messages
        );
        setMessagesHasMore(data.hasMore);
        setMessagesPage(page);
      } catch (err) {
        toastError(err);
      } finally {
        setMessagesLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    setTab("summary");
    setDetail(null);
    setSelectedTicketId(null);
    setMessages([]);
    setTickets([]);
    if (!contactId) return;
    loadDetail();
    loadTickets(1, false);
  }, [contactId, loadDetail, loadTickets]);

  useEffect(() => {
    if (tab === "messages" && selectedTicketId) {
      loadMessages(selectedTicketId, 1, false);
    }
  }, [tab, selectedTicketId, loadMessages]);

  useEffect(() => {
    if (!selectedTicketId && tickets.length === 1 && tab === "messages") {
      setSelectedTicketId(tickets[0].id);
    }
  }, [tickets, selectedTicketId, tab]);

  const ticketStats = useMemo(() => {
    if (!tickets?.length) {
      return {
        total: 0,
        open: 0,
        pending: 0,
        closed: 0,
        unread: 0,
        latest: null,
        preview: "",
      };
    }
    const open = tickets.filter((t) => t.status === "open").length;
    const pending = tickets.filter((t) => t.status === "pending").length;
    const closed = tickets.filter((t) => t.status === "closed").length;
    const unread = tickets.reduce(
      (s, t) => s + (Number(t.unreadMessages) || 0),
      0
    );
    const latest = [...tickets].sort(
      (a, b) =>
        new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0)
    )[0];
    const preview = (latest?.lastMessage || "").trim();
    return {
      total: tickets.length,
      open,
      pending,
      closed,
      unread,
      latest,
      preview: preview.length > 220 ? `${preview.slice(0, 220)}…` : preview,
    };
  }, [tickets]);

  const openTicket = (ticket) => {
    if (ticket?.uuid) {
      history.push(`/tickets/${ticket.uuid}`);
    } else if (ticket?.id) {
      history.push(`/tickets/${ticket.id}`);
    }
  };

  const statusLabel = (s) =>
    ({ open: "Aberto", pending: "Pendente", closed: "Fechado" }[s] || s);

  const mediaMessages = messages.filter(isMediaMessage);

  if (!listContact) {
    return (
      <div className="contact-details">
        <div className="detail-scroll">
          <p className="empty-hint">
            Selecione um contato na lista para ver o perfil completo, conversas
            e histórico.
          </p>
        </div>
      </div>
    );
  }

  const c = detail || listContact;
  const name = c.name || "—";
  const number = c.number || "";
  const email = c.email || "";
  const channel = c.channel || "whatsapp";
  const presence = c.presence || "available";
  const tags = c.tags || listContact.tags || [];
  const extraInfo = c.extraInfo || [];
  const companyLang = c.company?.language;

  return (
    <div className="contact-details">
      <div className="detail-tabs">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            className={tab === t.id ? "active" : ""}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="detail-scroll">
        {detailLoading && (
          <div style={{ textAlign: "center", padding: 24 }}>
            <CircularProgress size={28} />
          </div>
        )}

        {tab === "summary" && !detailLoading && (
          <>
            <div className="contact-card-header">
              {c.profilePicUrl ? (
                <img
                  src={c.profilePicUrl}
                  alt=""
                  className="memoji-avatar"
                  style={{ objectFit: "cover" }}
                  onClick={() => {
                    setPreviewImageUrl(c.profilePicUrl);
                    setPreviewOpen(true);
                  }}
                />
              ) : (
                <div
                  className="memoji-avatar"
                  style={{
                    backgroundColor: generateColor(number || name),
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 700,
                    fontSize: 22,
                  }}
                >
                  {getInitials(name)}
                </div>
              )}
              <div className="contact-main-info">
                <h2>{name}</h2>
                <div className="contact-meta">
                  {number && <span>{number} · </span>}
                  <span>
                    {channel} · {presencePt(presence)}
                  </span>
                </div>
                {email && (
                  <div className="contact-meta" style={{ marginTop: 4 }}>
                    {email}
                  </div>
                )}
                <div className="presence-pills">
                  <span className="presence-pill info">ID #{c.id}</span>
                  {c.isGroup && (
                    <span className="presence-pill warn">Grupo WhatsApp</span>
                  )}
                  {companyLang && (
                    <span className="presence-pill">Empresa · {companyLang}</span>
                  )}
                  {c.language && (
                    <span className="presence-pill">Contato · {c.language}</span>
                  )}
                  {c.disableBot && (
                    <span className="presence-pill warn">Bot desativado</span>
                  )}
                </div>
                <div className="contact-actions">
                  <button
                    type="button"
                    className="action-btn message"
                    title="Novo atendimento"
                    onClick={() =>
                      onStartWhatsapp({
                        contactId: c.id,
                        name: c.name,
                        number: c.number,
                      })
                    }
                  >
                    <MessageIcon style={{ fontSize: 18 }} />
                  </button>
                  <button type="button" className="action-btn call" title="Ligar">
                    <Phone style={{ fontSize: 18 }} />
                  </button>
                  <button type="button" className="action-btn call" title="Vídeo">
                    <Videocam style={{ fontSize: 18 }} />
                  </button>
                  {email ? (
                    <a
                      className="action-btn secondary"
                      href={`mailto:${email}`}
                      title="E-mail"
                      style={{ display: "flex", alignItems: "center", justifyContent: "center" }}
                    >
                      <EmailIcon style={{ fontSize: 18 }} />
                    </a>
                  ) : (
                    <button type="button" className="action-btn secondary" disabled>
                      <EmailIcon style={{ fontSize: 18 }} />
                    </button>
                  )}
                  <button type="button" className="action-btn secondary" title="Mais">
                    <MoreHoriz style={{ fontSize: 18 }} />
                  </button>
                </div>
              </div>
            </div>

            {ticketStats.latest && (
              <div className="last-activity-box">
                <div className="la-title">Última interação · atendimento #{ticketStats.latest.id}</div>
                <div className="la-body">
                  {ticketStats.latest.updatedAt &&
                    format(parseISO(ticketStats.latest.updatedAt), "dd/MM/yyyy HH:mm", {
                      locale: ptBR,
                    })}
                  {ticketStats.latest.whatsapp?.name && (
                    <span>
                      {" "}
                      · {ticketStats.latest.whatsapp.name}
                    </span>
                  )}
                  {ticketStats.latest.queue?.name && (
                    <span> · {ticketStats.latest.queue.name}</span>
                  )}
                </div>
                {ticketStats.preview && (
                  <div className="la-body" style={{ marginTop: 8, opacity: 0.92 }}>
                    “{ticketStats.preview}”
                  </div>
                )}
              </div>
            )}

            <div className="detail-stat-grid">
              <div className="detail-stat-card">
                <div className="label">Atendimentos</div>
                <div className="value">{ticketStats.total}</div>
                <div className="hint">Na base carregada (pág.)</div>
              </div>
              <div className="detail-stat-card">
                <div className="label">Abertos / pendentes</div>
                <div className="value">
                  {ticketStats.open + ticketStats.pending}
                </div>
                <div className="hint">
                  {ticketStats.open} abertos · {ticketStats.pending} pendentes
                </div>
              </div>
              <div className="detail-stat-card">
                <div className="label">Não lidas</div>
                <div className="value">{ticketStats.unread}</div>
                <div className="hint">Soma nos tickets listados</div>
              </div>
              <div className="detail-stat-card">
                <div className="label">Encerrados</div>
                <div className="value">{ticketStats.closed}</div>
                <div className="hint">Status fechado</div>
              </div>
            </div>

            <div className="detail-kv-grid">
              <div className="detail-kv">
                <div className="k">Identificador</div>
                <div className="v">#{c.id}</div>
              </div>
              <div className="detail-kv">
                <div className="k">Número / JID</div>
                <div className="v">{number || "—"}</div>
              </div>
              <div className="detail-kv">
                <div className="k">Canal principal</div>
                <div className="v">{channel}</div>
              </div>
              <div className="detail-kv">
                <div className="k">Presença</div>
                <div className="v">{presencePt(presence)}</div>
              </div>
              <div className="detail-kv">
                <div className="k">E-mail</div>
                <div className="v">{email || "—"}</div>
              </div>
              <div className="detail-kv">
                <div className="k">Tags vinculadas</div>
                <div className="v">{tags.length}</div>
              </div>
            </div>

            <div className="info-group">
              <Label className="icon-left" />
              <div className="info-content">
                <strong>Tags</strong>
                <div className="tags-chip-row" style={{ marginTop: 6 }}>
                  {tags.length === 0 && <span>Sem tags</span>}
                  {tags.map((tag) => (
                    <span
                      key={tag.id}
                      className="tag-chip"
                      style={{ backgroundColor: tag.color || "#888" }}
                    >
                      {tag.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="info-group">
              <AssignmentInd className="icon-left" />
              <div className="info-content">
                <strong>Origem</strong>
                <span>Canal · {channel}</span>
                {!c.isGroup && number && (
                  <span style={{ marginTop: 4 }}>WhatsApp · {number}</span>
                )}
                {c.isGroup && <span>Grupo</span>}
              </div>
            </div>

            <div className="info-group">
              <Event className="icon-left" />
              <div className="info-content">
                <strong>Registro</strong>
                <span>
                  Criado em{" "}
                  {c.createdAt
                    ? format(parseISO(c.createdAt), "dd/MM/yyyy HH:mm", {
                        locale: ptBR,
                      })
                    : "—"}
                </span>
                <span style={{ marginTop: 4 }}>
                  Atualizado em{" "}
                  {c.updatedAt
                    ? format(parseISO(c.updatedAt), "dd/MM/yyyy HH:mm", {
                        locale: ptBR,
                      })
                    : "—"}
                </span>
              </div>
            </div>
          </>
        )}

        {tab === "conversations" && (
          <>
            {ticketsLoading && tickets.length === 0 && (
              <div style={{ textAlign: "center", padding: 24 }}>
                <CircularProgress size={28} />
              </div>
            )}
            {!ticketsLoading && tickets.length === 0 && (
              <p className="empty-hint">Nenhum atendimento encontrado.</p>
            )}
            {tickets.map((tk) => (
              <div
                key={tk.id}
                className="ticket-row"
                role="button"
                tabIndex={0}
                onClick={() => openTicket(tk)}
                onKeyDown={(e) => e.key === "Enter" && openTicket(tk)}
              >
                <div className="ticket-top">
                  <span style={{ fontWeight: 600 }}>
                    #{tk.id} · {tk.queue?.name || "Fila"}
                  </span>
                  <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    {tk.unreadMessages > 0 && (
                      <span className="unread-badge">{tk.unreadMessages}</span>
                    )}
                    <span className="status" style={{ color: "#007aff" }}>
                      {statusLabel(tk.status)}
                    </span>
                  </span>
                </div>
                <div className="ticket-meta-line">
                  <span className="channel-pill">{tk.channel || channel}</span>
                  {tk.whatsapp?.name && (
                    <span>{tk.whatsapp.name}</span>
                  )}
                  <span>
                    {tk.updatedAt
                      ? format(parseISO(tk.updatedAt), "dd/MM/yyyy HH:mm", {
                          locale: ptBR,
                        })
                      : "—"}
                  </span>
                  <span>· {tk.user?.name || "Sem responsável"}</span>
                </div>
                {tk.lastMessage && (
                  <div className="ticket-preview">{tk.lastMessage}</div>
                )}
                <button
                  type="button"
                  className="edit-btn"
                  style={{ marginTop: 8, alignSelf: "flex-start" }}
                  onClick={(e) => {
                    e.stopPropagation();
                    openTicket(tk);
                  }}
                >
                  Abrir atendimento <OpenInNew style={{ fontSize: 14, verticalAlign: "middle" }} />
                </button>
              </div>
            ))}
            {ticketsHasMore && (
              <button
                type="button"
                className="edit-btn"
                style={{ marginTop: 12 }}
                disabled={ticketsLoading}
                onClick={() => loadTickets(ticketsPage + 1, true)}
              >
                {ticketsLoading ? "Carregando…" : "Carregar mais"}
              </button>
            )}
          </>
        )}

        {tab === "messages" && (
          <>
            <div className="info-group" style={{ flexDirection: "column" }}>
              <strong style={{ marginBottom: 8 }}>Atendimento</strong>
              <select
                value={selectedTicketId || ""}
                onChange={(e) =>
                  setSelectedTicketId(e.target.value ? Number(e.target.value) : null)
                }
                style={{
                  padding: 8,
                  borderRadius: 8,
                  border: "1px solid #dcdcdc",
                  fontSize: 13,
                }}
              >
                <option value="">Selecione…</option>
                {tickets.map((tk) => (
                  <option key={tk.id} value={tk.id}>
                    #{tk.id} — {statusLabel(tk.status)} —{" "}
                    {tk.updatedAt
                      ? format(parseISO(tk.updatedAt), "dd/MM/yy HH:mm")
                      : ""}
                  </option>
                ))}
              </select>
              {tickets.length === 0 && (
                <button
                  type="button"
                  className="edit-btn"
                  style={{ marginTop: 8 }}
                  onClick={() => loadTickets(1, false)}
                >
                  Carregar conversas
                </button>
              )}
            </div>
            {messagesLoading && messages.length === 0 && (
              <div style={{ textAlign: "center", padding: 24 }}>
                <CircularProgress size={28} />
              </div>
            )}
            {!selectedTicketId && (
              <p className="empty-hint">Escolha um atendimento para ver as mensagens.</p>
            )}
            {selectedTicketId &&
              !messagesLoading &&
              messages.length === 0 && (
                <p className="empty-hint">Sem mensagens neste atendimento.</p>
              )}
            {messages.map((m) => (
              <div
                key={m.id}
                className={`msg-row ${m.fromMe ? "mine" : ""}`}
              >
                <div>{m.body || `[${m.mediaType || "mídia"}]`}</div>
                <div className="time">
                  {m.createdAt
                    ? format(parseISO(m.createdAt), "dd/MM HH:mm")
                    : ""}{" "}
                  {m.ack === 3 && "✓✓"}
                </div>
              </div>
            ))}
            {messagesHasMore && selectedTicketId && (
              <button
                type="button"
                className="edit-btn"
                disabled={messagesLoading}
                onClick={() =>
                  loadMessages(selectedTicketId, messagesPage + 1, true)
                }
              >
                {messagesLoading ? "…" : "Mensagens mais antigas"}
              </button>
            )}
          </>
        )}

        {tab === "media" && (
          <>
            <p style={{ fontSize: 12, color: "#6a6a6a", marginBottom: 12 }}>
              Mídias do atendimento selecionado na aba Mensagens. Carregue as
              mensagens para preencher a galeria.
            </p>
            {mediaMessages.length === 0 && (
              <p className="empty-hint">Nenhuma mídia na lista carregada.</p>
            )}
            <div className="media-grid">
              {mediaMessages.map((m) => {
                const url = mediaUrl(m);
                const mediaType = (m?.mediaType || "").toLowerCase();
                const isImage = mediaType.includes("image") || /\.(jpe?g|png|gif|webp|bmp|svg)(\?|$)/i.test(url);
                const isVideo = mediaType.includes("video") || /\.(mp4|mov|avi|mkv|webm)(\?|$)/i.test(url);
                const isAudio = mediaType.includes("audio") || /\.(mp3|ogg|opus|wav|m4a)(\?|$)/i.test(url);
                const isPdf = mediaType.includes("pdf") || /\.pdf(\?|$)/i.test(url);

                if (!url) {
                  return (
                    <div key={m.id} className="media-thumb">
                      <span style={{ fontSize: 10, padding: 8 }}>{m.mediaType}</span>
                    </div>
                  );
                }

                if (isImage) {
                  return (
                    <button
                      key={m.id}
                      type="button"
                      className="media-thumb"
                      style={{ border: "none", padding: 0, background: "transparent", cursor: "zoom-in" }}
                      onClick={() => {
                        setPreviewImageUrl(url);
                        setPreviewOpen(true);
                      }}
                    >
                      <img src={url} alt="midia" />
                    </button>
                  );
                }

                if (isVideo) {
                  return (
                    <button
                      key={m.id}
                      type="button"
                      className="media-thumb"
                      style={{ border: "none", padding: 0, background: "transparent", cursor: "pointer" }}
                      onClick={() => window.open(url, "_blank", "noopener,noreferrer")}
                    >
                      <video src={url} muted preload="metadata" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    </button>
                  );
                }

                return (
                  <a
                    key={m.id}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="media-thumb"
                  >
                    {isAudio ? (
                      <span style={{ fontSize: 10, padding: 8 }}>audio</span>
                    ) : isPdf ? (
                      <span style={{ fontSize: 10, padding: 8 }}>pdf</span>
                    ) : (
                      <span style={{ fontSize: 10, padding: 8 }}>{m.mediaType || "arquivo"}</span>
                    )}
                  </a>
                );
              })}
            </div>
          </>
        )}

        {tab === "tags" && (
          <div className="tags-chip-row">
            {tags.length === 0 && <p className="empty-hint">Sem tags vinculadas.</p>}
            {tags.map((tag) => (
              <span
                key={tag.id}
                className="tag-chip"
                style={{ backgroundColor: tag.color || "#888" }}
              >
                {tag.name}
              </span>
            ))}
            <p style={{ fontSize: 12, color: "#6a6a6a", marginTop: 16, width: "100%" }}>
              Para adicionar ou remover tags, use &quot;{i18n.t("contacts.buttons.add")}&quot; / Editar contato.
            </p>
            <button type="button" className="edit-btn" onClick={onEdit}>
              Editar contato
            </button>
          </div>
        )}

        {tab === "attributes" && (
          <>
            {c?.id ? (
              <div style={{ marginBottom: 16 }}>
                <DynamicAttributesPanel entityType="contact" entityId={c.id} chatwoot />
              </div>
            ) : null}
            {extraInfo.length === 0 && !c?.id ? (
              <p className="empty-hint">Nenhum atributo personalizado.</p>
            ) : null}
            {extraInfo.map((row, idx) => (
              <div key={idx} className="info-group">
                <Person className="icon-left" />
                <div className="info-content">
                  <strong>{row.name}</strong>
                  <span>{row.value}</span>
                </div>
              </div>
            ))}
          </>
        )}

        {tab === "activity" && (
          <>
            <div className="info-group">
              <History className="icon-left" />
              <div className="info-content">
                <strong>Contato</strong>
                <span>
                  Criado em{" "}
                  {c.createdAt
                    ? format(parseISO(c.createdAt), "PPpp", { locale: ptBR })
                    : "—"}
                </span>
                <span style={{ marginTop: 6 }}>
                  Última atualização em{" "}
                  {c.updatedAt
                    ? format(parseISO(c.updatedAt), "PPpp", { locale: ptBR })
                    : "—"}
                </span>
              </div>
            </div>
            {tickets.slice(0, 12).map((tk) => (
              <div key={tk.id} className="info-group">
                <Event className="icon-left" />
                <div className="info-content">
                  <strong>Atendimento #{tk.id}</strong>
                  <span>
                    {statusLabel(tk.status)} ·{" "}
                    {tk.createdAt
                      ? format(parseISO(tk.createdAt), "dd/MM/yyyy", {
                          locale: ptBR,
                        })
                      : "—"}
                  </span>
                </div>
              </div>
            ))}
            {tickets.length === 0 && tab === "activity" && contactId && (
              <button
                type="button"
                className="edit-btn"
                onClick={() => loadTickets(1, false)}
              >
                Carregar atendimentos para o histórico
              </button>
            )}
          </>
        )}
      </div>
      <FullscreenImageDialog
        open={previewOpen}
        imageUrl={previewImageUrl}
        onClose={() => setPreviewOpen(false)}
        alt="contact-profile-fullscreen"
      />
    </div>
  );
};

export default ContactDetailPanel;
