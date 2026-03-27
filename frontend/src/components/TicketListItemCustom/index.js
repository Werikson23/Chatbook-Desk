import React, { useState, useEffect, useRef, useContext } from "react";

import { useHistory, useParams } from "react-router-dom";
import { parseISO } from "date-fns";
import clsx from "clsx";

import { makeStyles } from "@material-ui/core/styles";
import { green, grey, red, blue } from "@material-ui/core/colors";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import ListItemAvatar from "@material-ui/core/ListItemAvatar";
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction";
import Typography from "@material-ui/core/Typography";
import Avatar from "@material-ui/core/Avatar";
import Divider from "@material-ui/core/Divider";
import Badge from "@material-ui/core/Badge";
import Box from "@material-ui/core/Box";

import { i18n } from "../../translate/i18n";

import api from "../../services/api";
import WhatsMarked from "react-whatsmarked";
import { Tooltip } from "@material-ui/core";
import { AuthContext } from "../../context/Auth/AuthContext";
import { TicketsContext } from "../../context/Tickets/TicketsContext";
import toastError from "../../errors/toastError";
import { v4 as uuidv4 } from "uuid";

import WhatsAppIcon from "@material-ui/icons/WhatsApp";
import AndroidIcon from "@material-ui/icons/Android";
import VisibilityIcon from "@material-ui/icons/Visibility";
import TicketMessagesDialog from "../TicketMessagesDialog";
import DoneIcon from '@material-ui/icons/Done';
import ClearOutlinedIcon from '@material-ui/icons/ClearOutlined';
import { generateColor } from "../../helpers/colorGenerator";
import { getInitials } from "../../helpers/getInitials";
import pastRelativeDate from "../../helpers/pastRelativeDate";
import TagsLine from "../TagsLine";
import FullscreenImageDialog from "../FullscreenImageDialog";

const useStyles = makeStyles((theme) => ({
  ticketContainer: {
    borderBottom: "1px solid #2b2e33",
  },
  ticket: {
    position: "relative",
    minHeight: 90,
    height: "auto",
    paddingLeft: 14,
    paddingRight: 12,
    paddingTop: 10,
    paddingBottom: 10,
  },

  pendingTicket: {
    cursor: "unset",
  },

  noTicketsDiv: {
    display: "flex",
    height: "100px",
    margin: 40,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },

  noTicketsText: {
    textAlign: "center",
    color: "rgb(104, 121, 146)",
    fontSize: "14px",
    lineHeight: "1.4",
  },

  noTicketsTitle: {
    textAlign: "center",
    fontSize: "16px",
    fontWeight: "600",
    margin: "0px",
  },

  contactNameWrapper: {
    display: "grid",
    justifyContent: "space-between",
    width: "100%",
  },

  lastMessageTime: {
    justifySelf: "flex-end",
    textAlign: "right",
    position: "relative",
    top: 0,
    fontSize: 11,
    color: "#6b7280",
  },

  closedBadge: {
    alignSelf: "center",
    justifySelf: "flex-end",
    marginRight: 32,
    marginLeft: "auto",
  },

  contactLastMessage: {
  },

  newMessagesCount: {
    alignSelf: "center",
    marginRight: 0,
    marginLeft: "auto",
    top: -10,
    right: 10
  },

  badgeStyle: {
    color: "white",
    backgroundColor: green[500],
    right: 0,
    top: 10
  },

  acceptButton: {
    position: "absolute",
    right: "108px",
  },

  ticketQueueColor: {
    flex: "none",
    width: "8px",
    height: "100%",
    position: "absolute",
    top: "0%",
    left: "0%",
  },

  ticketInfo: {
    position: "relative",
    top: 0
  },

  ticketInfo1: {
    position: "relative",
    top: 22,
    right: -2,
  },
  Radiusdot: {

    "& .MuiBadge-badge": {
      borderRadius: 2,
      position: "inherit",
      height: 16,
      margin: 2,
      padding: 3,
      fontSize: 10,
    },
    "& .MuiBadge-anchorOriginTopRightRectangle": {
      transform: "scale(1) translate(0%, -40%)",
    },
  },
  presence: {
    color: theme.mode === 'light' ? "green" : "lightgreen",
    fontWeight: "bold",
  },

  ticketChatwoot: {
    backgroundColor: "#1c1e21",
    borderRadius: 0,
    minHeight: 104,
    height: 104,
    alignItems: "center",
    paddingTop: 10,
    paddingBottom: 10,
    paddingLeft: 14,
    paddingRight: 14,
    "&.MuiListItem-button:hover": {
      backgroundColor: "rgba(255,255,255,0.06)",
    },
    "&.Mui-selected": {
      backgroundColor: "#151718",
      borderLeft: "3px solid #1c64f2",
      paddingLeft: 11,
    },
  },
  ticketChatwootTypography: {
    "& .MuiTypography-colorTextPrimary": {
      color: "rgba(255,255,255,0.92) !important",
    },
    "& .MuiTypography-colorTextSecondary": {
      color: "rgba(255,255,255,0.55) !important",
    },
  },
  cwAvatarWrap: {
    width: 48,
    minWidth: 48,
    marginRight: 12,
  },
  cwAvatar: {
    width: 48,
    height: 48,
    borderRadius: "50%",
    cursor: "zoom-in",
  },
  cwInfo: {
    minWidth: 0,
    flex: 1,
    display: "grid",
    gridTemplateRows: "auto auto auto auto",
    rowGap: 4,
  },
  cwLine1: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    fontSize: 11,
    color: "rgba(255,255,255,0.55)",
    minWidth: 0,
  },
  cwLine2: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    minWidth: 0,
  },
  cwName: {
    fontSize: 14,
    fontWeight: 600,
    color: "rgba(255,255,255,0.92)",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    minWidth: 0,
    paddingRight: 8,
  },
  cwTime: {
    fontSize: 11,
    color: "rgba(255,255,255,0.55)",
    whiteSpace: "nowrap",
  },
  cwLine3: {
    position: "relative",
    minWidth: 0,
    paddingRight: 40,
  },
  cwPreview: {
    color: "rgba(255,255,255,0.72)",
    fontSize: 12,
    lineHeight: "16px",
    overflow: "hidden",
    textOverflow: "ellipsis",
    display: "-webkit-box",
    WebkitBoxOrient: "vertical",
    WebkitLineClamp: 1,
    wordBreak: "break-word",
  },
  cwPreviewTwoLines: {
    WebkitLineClamp: 2,
  },
  cwUnreadBadge: {
    position: "absolute",
    right: 0,
    top: 0,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    fontSize: 11,
    fontWeight: 600,
    lineHeight: "20px",
    textAlign: "center",
    color: "#fff",
    background: "#25D366",
    padding: "0 6px",
  },
  cwUnreadCritical: {
    background: "#ef4444",
  },
  cwLine4: {
    minWidth: 0,
    fontSize: 12,
    color: "rgba(255,255,255,0.55)",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  cwQueueInfo: {
    color: "rgba(255,255,255,0.58)",
  },
  cwSlaDanger: {
    background: "rgba(239,68,68,0.08)",
  },
}));

const TicketListItemCustom = ({
  ticket,
  setTabOpen,
  groupActionButtons,
  chatwootUI = false,
}) => {
  const classes = useStyles();
  const history = useHistory();
  const [ticketUser, setTicketUser] = useState(null);
  const [whatsAppName, setWhatsAppName] = useState(null);

  const [openTicketMessageDialog, setOpenTicketMessageDialog] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const { ticketId } = useParams();
  const isMounted = useRef(true);
  const { setCurrentTicket } = useContext(TicketsContext);
  const { user } = useContext(AuthContext);
  const { profile } = user;

  useEffect(() => {
    if (ticket.userId && ticket.user) {
      setTicketUser(ticket.user.name);
    }

    if (ticket.whatsappId && ticket.whatsapp) {
      setWhatsAppName(ticket.whatsapp.name);
    }

    return () => {
      isMounted.current = false;
    };
  }, [ticket]);

  const handleCloseTicket = async (id) => {
    try {
      await api.put(`/tickets/${id}`, {
        status: "closed",
        justClose: true,
        userId: user?.id,
      });
    } catch (err) {
      toastError(err);
    }
    history.push(`/tickets/`);
  };

  const handleAcceptTicket = async (id) => {
    try {
      await api.put(`/tickets/${id}`, {
        status: "open",
        userId: user?.id,
      });
    } catch (err) {
      toastError(err);
    }

    history.push(`/tickets/${ticket.uuid}`);
    setTabOpen("attending");
  };

  const handleSelectTicket = (ticket) => {
    const code = uuidv4();
    const { id, uuid } = ticket;
    setCurrentTicket({ id, uuid, code });
  };

  const channelLabel = (ticket?.channel || "").toLowerCase() === "whatsapp"
    ? "WhatsApp"
    : (ticket?.channel || "Chat");

  const statusLabel =
    ticket.status === "pending"
      ? "Aguardando agente"
      : ticket.status === "closed"
        ? "Encerrado"
        : "Em atendimento";

  const relativeTime = ticket?.updatedAt ? pastRelativeDate(parseISO(ticket.updatedAt)) : "";
  const unread = Number(ticket?.unreadMessages || 0);
  const waitingMinutes = Number(ticket?.waitingTime || 0);
  const hasTags = Boolean(ticket?.tags?.length);

  const renderTicketInfo = () => {
    if (ticketUser && ticket.status !== "pending") {
      return (
        <>
          <Badge
            overlap="rectangular"
            className={classes.Radiusdot}
            badgeContent={`${ticketUser}`}
            //color="primary"
            style={{
              backgroundColor: "#3498db",
              height: 18,
              padding: 5,
              position: "inherit",
              borderRadius: 7,
              color: '#fff',
              top: -6,
              marginRight: 3,
            }}
          />

          {ticket.whatsappId && (
            <Badge
              overlap="rectangular"
              className={classes.Radiusdot}
              badgeContent={`${whatsAppName}`}
              style={{
                backgroundColor: "#7d79f2",
                height: 18,
                padding: 5,
                position: "inherit",
                borderRadius: 7,
                color: "white",
                top: -6,
                marginRight: 3
              }}
            />
          )}


          {ticket.queue?.name !== null && (
            <Badge
              overlap="rectangular"
              className={classes.Radiusdot}
              style={{
                backgroundColor: ticket.queue?.color || "#7C7C7C",
                height: 18,
                padding: 5,
                position: "inherit",
                borderRadius: 7,
                color: "white",
                top: -6,
                marginRight: 3
              }}
              badgeContent={ticket.queue?.name || "Sem fila"}
            //color="primary"
            />
          )}
          {ticket.status === "open" && (
            <Tooltip title="Fechar Conversa">
              <ClearOutlinedIcon
                onClick={() => handleCloseTicket(ticket.id)}
                fontSize="small"
                style={{
                  color: '#fff',
                  backgroundColor: red[700],
                  cursor: "pointer",
                  //margin: '0 5 0 5',
                  padding: 2,
                  height: 23,
                  width: 23,
                  fontSize: 12,
                  borderRadius: 50,
                  position: 'absolute',
                  right: 0,
                  top: -8
                }}
              />
            </Tooltip>
          )}
          {profile === "admin" && (
            <Tooltip title="Espiar Conversa">
              <VisibilityIcon
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenTicketMessageDialog(true)
                }}
                fontSize="small"
                style={{
                  padding: 2,
                  height: 23,
                  width: 23,
                  fontSize: 12,
                  color: '#fff',
                  cursor: "pointer",
                  backgroundColor: blue[700],
                  borderRadius: 50,
                  position: 'absolute',
                  right: 28,
                  top: -8
                }}
              />
            </Tooltip>
          )}
          {ticket.chatbot && (
            <Tooltip title="Chatbot">
              <AndroidIcon
                fontSize="small"
                style={{ color: grey[700], marginRight: 5 }}
              />
            </Tooltip>
          )}

        </>
      );
    } else {
      return (
        <>

          {ticket.whatsappId && (
            <Badge
              overlap="rectangular"
              className={classes.Radiusdot}
              badgeContent={`${whatsAppName}`}
              style={{
                backgroundColor: "#7d79f2",
                height: 18,
                padding: 5,
                position: "inherit",
                borderRadius: 7,
                color: "white",
                top: -6,
                marginRight: 3
              }}
            />
          )}

          {ticket.queue?.name !== null && (
            <Badge
              overlap="rectangular"
              className={classes.Radiusdot}
              style={{
                backgroundColor: ticket.queue?.color || "#7C7C7C",
                height: 18,
                padding: 5,
                paddingHorizontal: 12,
                position: "inherit",
                borderRadius: 7,
                color: "white",
                top: -6,
                marginRight: 2

              }}
              badgeContent={ticket.queue?.name || "Sem fila"}
            //color=
            />
          )}
          {ticket.status === "pending" && (groupActionButtons || !ticket.isGroup) && (
            <Tooltip title="Fechar Conversa">
              <ClearOutlinedIcon
                onClick={() => handleCloseTicket(ticket.id)}
                fontSize="small"
                style={{
                  color: '#fff',
                  backgroundColor: red[700],
                  cursor: "pointer",
                  margin: '0 5 0 5',
                  padding: 2,
                  right: 48,
                  height: 23,
                  width: 23,
                  fontSize: 12,
                  borderRadius: 50,
                  top: -8,
                  position: 'absolute',
                }}
              />
            </Tooltip>
          )}
          {ticket.chatbot && (
            <Tooltip title="Chatbot">
              <AndroidIcon
                fontSize="small"
                style={{ color: grey[700], marginRight: 5 }}
              />
            </Tooltip>
          )}
          {ticket.status === "open" && (groupActionButtons || !ticket.isGroup) && (
            <Tooltip title="Fechar Conversa">
              <ClearOutlinedIcon
                onClick={() => handleCloseTicket(ticket.id)}
                fontSize="small"
                style={{
                  color: red[700],
                  cursor: "pointer",
                  marginRight: 5,
                  right: 49,
                  top: -8,
                  position: 'absolute',
                }}
              />
            </Tooltip>
          )}
          {ticket.status === "pending" && (groupActionButtons || !ticket.isGroup) && (
            <Tooltip title="Aceitar Conversa">
              <DoneIcon
                onClick={() => handleAcceptTicket(ticket.id)}
                fontSize="small"
                style={{
                  color: '#fff',
                  backgroundColor: green[700],
                  cursor: "pointer",
                  //margin: '0 5 0 5',
                  padding: 2,
                  height: 23,
                  width: 23,
                  fontSize: 12,
                  borderRadius: 50,
                  right: 25,
                  top: -8,
                  position: 'absolute',
                }}
              />
            </Tooltip>
          )}

          {profile === "admin" && (groupActionButtons || !ticket.isGroup) && (
            <Tooltip title="Espiar Conversa">
              <VisibilityIcon
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenTicketMessageDialog(true)
                }}
                fontSize="small"
                style={{
                  padding: 2,
                  height: 23,
                  width: 23,
                  fontSize: 12,
                  color: '#fff',
                  cursor: "pointer",
                  backgroundColor: blue[700],
                  borderRadius: 50,
                  right: 0,
                  top: -8,
                  position: 'absolute',
                }}
              />
            </Tooltip>
          )}

        </>
      );
    }
  };


  return (
    <div key={`ticket-${ticket.id}`} className={classes.ticketContainer}>
      <TicketMessagesDialog
        open={openTicketMessageDialog}
        handleClose={() => setOpenTicketMessageDialog(false)}
        ticketId={ticket.id}
      ></TicketMessagesDialog>
      <ListItem
        dense
        button
        onClick={() => {
          handleSelectTicket(ticket);
        }}
        selected={ticketId && +ticketId === ticket.id}
        className={clsx(classes.ticket, {
          [classes.pendingTicket]: ticket.status === "pending",
          [classes.ticketChatwoot]: chatwootUI,
          [classes.ticketChatwootTypography]: chatwootUI,
        })}
      >
        <Tooltip arrow placement="right" title={ticket.queue?.name || "Sem fila"}>
          <span
            style={{ backgroundColor: ticket.queue?.color || "#7C7C7C" }}
            className={classes.ticketQueueColor}
          ></span>
        </Tooltip>
        {chatwootUI ? (
          <>
            <div className={classes.cwAvatarWrap}>
              <Avatar
                className={classes.cwAvatar}
                style={{ backgroundColor: generateColor(ticket?.contact?.number), color: "white", fontWeight: "bold", fontSize: 14 }}
                src={ticket?.contact?.profilePicUrl}
                onClick={(e) => {
                  e.stopPropagation();
                  if (ticket?.contact?.profilePicUrl) setPreviewOpen(true);
                }}
              >
                {getInitials(ticket?.contact?.name || "")}
              </Avatar>
            </div>
            <div className={clsx(classes.cwInfo, waitingMinutes > 5 && ticket.status === "pending" && classes.cwSlaDanger)}>
              <div className={classes.cwLine1}>
                <span>{channelLabel}</span>
                <span>{statusLabel}</span>
              </div>
              <div className={classes.cwLine2}>
                <div className={classes.cwName}>{ticket?.contact?.name || "-"}</div>
                <div className={classes.cwTime}>{relativeTime}</div>
              </div>
              <div className={classes.cwLine3}>
                <div className={clsx(classes.cwPreview, !hasTags && classes.cwPreviewTwoLines)}>
                  {["composing", "recording"].includes(ticket?.presence)
                    ? i18n.t(`presence.${ticket.presence}`)
                    : (ticket?.lastMessage?.includes("data:image/png;base64")
                      ? "Localizacao"
                      : (ticket?.lastMessage || "").startsWith('{"ticketzvCard"')
                        ? "🪪"
                        : (ticket?.lastMessage || "").split("\n")[0])}
                </div>
                {unread > 0 ? (
                  <div className={clsx(classes.cwUnreadBadge, ticket?.seen && classes.cwUnreadCritical)}>
                    {unread > 9 ? "9+" : unread}
                  </div>
                ) : null}
              </div>
              <div className={classes.cwLine4}>
                {ticket.status === "pending" ? (
                  <span className={classes.cwQueueInfo}>⏱ {waitingMinutes || 0}m • {ticket?.queue?.name || "Sem fila"}</span>
                ) : (
                  <TagsLine ticket={ticket} />
                )}
              </div>
            </div>
          </>
        ) : (
          <>
            <ListItemAvatar>
              <Avatar
                style={{ width: 32, height: 32, backgroundColor: generateColor(ticket?.contact?.number), color: "white", fontWeight: "bold", fontSize: 12 }}
                src={ticket?.contact?.profilePicUrl}
                onClick={(e) => {
                  e.stopPropagation();
                  if (ticket?.contact?.profilePicUrl) setPreviewOpen(true);
                }}
              >
                { getInitials(ticket?.contact?.name || "") }
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              style={{ paddingBottom: 0 }}
              disableTypography
              primary={
                <span className={classes.contactNameWrapper}>

                  <Typography
                    noWrap
                    component="span"
                    variant="body2"
                    color="textPrimary"
                  >
                    {ticket.channel === "whatsapp" && (
                      <Tooltip title={`Atribuido à ${ticketUser}`}>
                        <WhatsAppIcon
                          fontSize="inherit"
                          style={{ color: chatwootUI ? grey[400] : grey[700] }}
                        />
                      </Tooltip>
                    )}{' '}
                    {ticket.contact.name}
                  </Typography>

                </span>
              }
              secondary={
                <span className={classes.contactNameWrapper}>
                  <Typography
                    className={classes.contactLastMessage}
                    noWrap
                    component="span"
                    variant="body2"
                    color="textSecondary"
                  >
                    {["composing", "recording"].includes(ticket?.presence) ? (
                      <span className={classes.presence}>
                        {i18n.t(`presence.${ticket.presence}`)}
                      </span>
                    ) : (
                    <>
                      {ticket.lastMessage?.includes('data:image/png;base64') ? <div>Localização</div> : <WhatsMarked oneline>{ticket.lastMessage.startsWith('{"ticketzvCard"') ? "🪪" : ticket.lastMessage.split("\n")[0] }</WhatsMarked>}
                    </>
                  )}
                  </Typography>
                  <TagsLine ticket={ticket} />
                  <ListItemSecondaryAction style={{ left: 72 }}>
                    <Box className={classes.ticketInfo1}>{renderTicketInfo()}</Box>
                  </ListItemSecondaryAction>
                </span>

              }
            />
            <ListItemSecondaryAction style={{}}>
              {ticket.status === "closed" && (
                <Badge
                  overlap="rectangular"
                  className={classes.Radiusdot}
                  badgeContent={i18n.t("common.closed")}
                  style={{
                    backgroundColor: ticket.queue?.color || "#ff0000",
                    height: 18,
                    padding: 5,
                    paddingHorizontal: 12,
                    borderRadius: 7,
                    color: "white",
                    top: -28,
                    marginRight: 5

                  }}
                />
              )}

              {ticket.lastMessage && (
                <>

                  <Typography
                    className={classes.lastMessageTime}
                    component="span"
                    variant="body2"
                    color="textSecondary"
                  >
                    {pastRelativeDate(parseISO(ticket.updatedAt))}
                  </Typography>

                  <Badge
                    overlap="rectangular"
                    className={classes.newMessagesCount}
                    badgeContent={ticket.unreadMessages ? ticket.unreadMessages : null}
                    classes={{
                      badge: classes.badgeStyle,
                    }}
                  />
                  <br />

                </>
              )}

            </ListItemSecondaryAction>
          </>
        )}

      </ListItem>
      <FullscreenImageDialog
        open={previewOpen}
        imageUrl={(ticket?.contact?.profilePicUrl || "").replace(/s96x96/gi, "s640x640")}
        onClose={() => setPreviewOpen(false)}
        alt="ticket-contact-avatar-fullscreen"
      />
      {!chatwootUI && <Divider variant="inset" component="li" />}
    </div>
  );
};

export default TicketListItemCustom;