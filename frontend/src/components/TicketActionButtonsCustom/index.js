import React, { useContext, useState } from "react";
import { useHistory } from "react-router-dom";

import { makeStyles, createTheme, ThemeProvider } from "@material-ui/core/styles";
import { IconButton } from "@material-ui/core";
import { MoreVert, Replay } from "@material-ui/icons";
import Button from "@material-ui/core/Button";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";

import { i18n } from "../../translate/i18n";
import api from "../../services/api";
import TicketOptionsMenu from "../TicketOptionsMenu";
import ButtonWithSpinner from "../ButtonWithSpinner";
import toastError from "../../errors/toastError";
import { AuthContext } from "../../context/Auth/AuthContext";
import { TicketsContext } from "../../context/Tickets/TicketsContext";
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import UndoRoundedIcon from '@material-ui/icons/UndoRounded';
import AddBoxIcon from '@material-ui/icons/AddBox';
import { Call, CallEnd } from "@material-ui/icons";
import Tooltip from '@material-ui/core/Tooltip';
import { green } from '@material-ui/core/colors';
import { PhoneCallContext } from "../../context/PhoneCall/PhoneCallContext";
import { wavoipAvailable, wavoipCall } from "../../helpers/wavoipCallManager";
import TicketCloseModal from "../TicketCloseModal";

const useStyles = makeStyles(theme => ({
	actionButtons: {
		marginRight: 6,
		flex: "none",
		alignSelf: "center",
		marginLeft: "auto",
		"& > *": {
			margin: theme.spacing(0.5),
		},
	},
  actionButtonsChatwoot: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    marginRight: 10,
    "& .MuiIconButton-root": {
      color: "#9ca3af",
      borderRadius: 6,
      background: "#1c1e21",
      border: "1px solid #2b2e33",
      padding: 6,
    },
    "& .MuiIconButton-root:hover": {
      background: "#272a2e",
    },
  },
  resolveBtnChatwoot: {
    background: "#1c64f2",
    color: "#fff",
    textTransform: "none",
    borderRadius: 6,
    border: "1px solid #1c64f2",
    padding: "6px 12px",
    minWidth: 92,
    height: 32,
    fontWeight: 600,
    fontSize: 12,
    "&:hover": {
      background: "#1a56db",
    },
  },
  acceptBtnChatwoot: {
    background: "#1c64f2",
    color: "#fff",
    textTransform: "none",
    borderRadius: 6,
    border: "1px solid #1c64f2",
    padding: "6px 12px",
    minWidth: 92,
    height: 32,
    fontWeight: 600,
    fontSize: 12,
    "&:hover": {
      background: "#1a56db",
    },
  },
}));

const TicketActionButtonsCustom = ({ ticket, showTabGroups, chatwootUI = false }) => {
	const classes = useStyles();
	const history = useHistory();
	const [anchorEl, setAnchorEl] = useState(null);
	const [loading, setLoading] = useState(false);
	const [closeModalOpen, setCloseModalOpen] = useState(false);
	const ticketOptionsMenuOpen = Boolean(anchorEl);
	const { user } = useContext(AuthContext);
	const { setCurrentTicket } = useContext(TicketsContext);
  const phoneContext = useContext(PhoneCallContext);

	const customTheme = createTheme({
		palette: {
		  	primary: green,
		}
	});

	const handleOpenTicketOptionsMenu = e => {
		setAnchorEl(e.currentTarget);
	};

	const handleCloseTicketOptionsMenu = e => {
		setAnchorEl(null);
	};

	const handleUpdateTicketStatus = async (e, status, userId, extraData = {}) => {
		setLoading(true);
		try {
			await api.put(`/tickets/${ticket.id}`, {
				status: status,
				userId: userId || null,
        ...extraData
			});

			setLoading(false);
			if (status === "open") {
				setCurrentTicket({ ...ticket, code: "#open" });
			} else {
				setCurrentTicket({ id: null, code: null })
				history.push("/tickets");
			}
		} catch (err) {
			setLoading(false);
			toastError(err);
		}
	};

  const handleConfirmClose = ({ closeReasonId, farewellTemplateId }) => {
    setCloseModalOpen(false);
    handleUpdateTicketStatus(null, "closed", user?.id, {
      closeReasonId,
      farewellTemplateId
    });
  };
  
  const handleCall = async () => {
    wavoipCall(ticket, () => {
      phoneContext.disconnect();
    })
      .then((wavoipInstance) => {
        phoneContext.updateCurrentCall({
          contact: ticket.contact,
          whatsapp: ticket.whatsapp,
          disconnect: () => {
            window.wavoipCallingSound.stop();
            wavoipInstance.endCall();
          }
        });
      })
      .catch(err => {
        toastError(err);
      });
  };
     
	return (
    <div className={chatwootUI ? classes.actionButtonsChatwoot : classes.actionButtons}>
      {ticket.status === "closed" && (!showTabGroups || !ticket.isGroup) && (
        <>
          <Tooltip title={i18n.t("ticketsManager.buttons.newTicket")}>
            <IconButton onClick={() => window.mentionClick({
              contactId: ticket.contactId,
              name: ticket.contact?.name,
              number: ticket.contact?.number
            })}>
              <AddBoxIcon />
            </IconButton>
          </Tooltip>
          {user.profile === "admin" && (
            <Tooltip title={i18n.t("messagesList.header.buttons.reopen")}>
              <IconButton onClick={e => handleUpdateTicketStatus(e, "open", user?.id)}>
                <Replay />
              </IconButton>
            </Tooltip>
          )}
        </>
			)}
			{(ticket.status === "open" || (showTabGroups && ticket.isGroup ) ) && (
				<>
          {
            wavoipAvailable() &&
            phoneContext &&
            !phoneContext.currentCall &&
            ticket.whatsapp.wavoip?.token &&
            !ticket.contact.isGroup &&
            < Tooltip title={i18n.t("messagesList.header.buttons.call")}>
              <IconButton
                onClick={handleCall}
              >
               <Call />
              </IconButton>
            </Tooltip>
          }
  
          {
            wavoipAvailable() &&
            phoneContext &&
            phoneContext.currentCall &&
            phoneContext.currentCall.contact.id === ticket.contact.id &&
            phoneContext.currentCall.whatsapp.id === ticket.whatsapp.id &&
            <Tooltip title={i18n.t("messagesList.header.buttons.endCall")}>
              <IconButton
                onClick={phoneContext.disconnect}
              >
                <CallEnd />
              </IconButton>
            </Tooltip>
          }
          
          {(!showTabGroups || !ticket.isGroup) &&
            <>
              <Tooltip title={i18n.t("messagesList.header.buttons.return")}>
                <IconButton onClick={e => handleUpdateTicketStatus(e, "pending", null)}>
                  <UndoRoundedIcon />
                </IconButton>
              </Tooltip>
              <ThemeProvider theme={customTheme}>
                <Tooltip title={i18n.t("messagesList.header.buttons.resolve")}>
                  {chatwootUI ? (
                    <Button
                      className={classes.resolveBtnChatwoot}
                      onClick={() => setCloseModalOpen(true)}
                      endIcon={<ExpandMoreIcon style={{ fontSize: 16 }} />}
                    >
                      Resolve
                    </Button>
                  ) : (
                    <IconButton onClick={() => setCloseModalOpen(true)} color="primary">
                      <CheckCircleIcon />
                    </IconButton>
                  )}
                </Tooltip>
              </ThemeProvider>
            </>
          }

          <IconButton onClick={handleOpenTicketOptionsMenu}>
						<MoreVert />
					</IconButton>
					<TicketOptionsMenu
						ticket={ticket}
						anchorEl={anchorEl}
						menuOpen={ticketOptionsMenuOpen}
						handleClose={handleCloseTicketOptionsMenu}
						showTabGroups={showTabGroups}
					/>
				</>
			)}
			{ticket.status === "pending" && (!showTabGroups || !ticket.isGroup) && (
        chatwootUI ? (
          <Button
            className={classes.acceptBtnChatwoot}
            onClick={e => handleUpdateTicketStatus(e, "open", user?.id)}
            disabled={loading}
          >
            {i18n.t("messagesList.header.buttons.accept")}
          </Button>
        ) : (
          <ButtonWithSpinner
            loading={loading}
            size="small"
            variant="contained"
            color="primary"
            onClick={e => handleUpdateTicketStatus(e, "open", user?.id)}
          >
            {i18n.t("messagesList.header.buttons.accept")}
          </ButtonWithSpinner>
        )
			)}
      <TicketCloseModal
        open={closeModalOpen}
        onClose={() => setCloseModalOpen(false)}
        onConfirm={handleConfirmClose}
        ticket={ticket}
        loading={loading}
      />
		</div>
	);
};

export default TicketActionButtonsCustom;
