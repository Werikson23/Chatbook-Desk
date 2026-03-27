import React, { useState, useEffect } from "react";

import { Avatar, CardHeader } from "@material-ui/core";
import FullscreenImageDialog from "../FullscreenImageDialog";

import { i18n } from "../../translate/i18n";
import { getInitials } from "../../helpers/getInitials";
import { generateColor } from "../../helpers/colorGenerator";

const TicketInfo = ({ contact, ticket, onClick }) => {
	const { user } = ticket
	const [userName, setUserName] = useState('')
	const [contactName, setContactName] = useState('')
  const [previewOpen, setPreviewOpen] = useState(false);
  const highResAvatar = (contact?.profilePicUrl || "").replace(/s96x96/gi, "s640x640");

	useEffect(() => {
		if (contact) {
			setContactName(contact.name);
			if(document.body.offsetWidth < 600) {
				if (contact.name.length > 10) {
					const truncadName = contact.name.substring(0, 10) + '...';
					setContactName(truncadName);
				}
			}
		}

		if (user && contact) {
			setUserName(`${i18n.t("messagesList.header.assignedTo")} ${user.name}`);

			if(document.body.offsetWidth < 600) {
				setUserName(`${user.name}`);
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	return (
    <>
		<CardHeader
			onClick={onClick}
			style={{ cursor: "pointer" }}
			titleTypographyProps={{ noWrap: true }}
			subheaderTypographyProps={{ noWrap: true }}
			avatar={
        <Avatar
          style={{ width: 24, height: 24, backgroundColor: generateColor(contact?.number), color: "white", fontWeight: "bold", fontSize: 11, cursor: contact?.profilePicUrl ? "pointer" : "default" }}
          src={contact.profilePicUrl}
          alt="contact_image"
          onClick={(e) => {
            e.stopPropagation();
            if (contact?.profilePicUrl) setPreviewOpen(true);
          }}
        >
          { getInitials(contact?.name) }
        </Avatar>
      }
			title={contactName}
			subheader={
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
          <span>{ticket?.whatsapp?.name || ticket?.channel || (ticket.user ? `${userName}` : i18n.t("messagesList.header.buttons.accept"))}</span>
          <span style={{ color: "#1c64f2" }}>Close details</span>
        </span>
      }
		/>
      <FullscreenImageDialog
        open={previewOpen}
        imageUrl={highResAvatar || contact?.profilePicUrl}
        onClose={() => setPreviewOpen(false)}
        alt="contact-avatar-fullscreen"
      />
    </>
	);
};

export default TicketInfo;
