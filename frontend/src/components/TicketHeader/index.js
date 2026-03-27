import React from "react";
import clsx from "clsx";

import { Card } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import TicketHeaderSkeleton from "../TicketHeaderSkeleton";

const useStyles = makeStyles(theme => ({
	ticketHeader: {
		display: "flex",
		flex: "none",
		borderBottom: "1px solid rgba(0, 0, 0, 0.12)",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "8px 10px 8px 4px",
	},
  ticketHeaderChatwoot: {
    backgroundColor: "#151718",
    color: "#f8f9fa",
    borderBottom: "1px solid #2b2e33",
    boxShadow: "none",
  },
}));

const TicketHeader = ({ loading, children, chatwootUI }) => {
	const classes = useStyles();

	return (
		<>
			{loading ? (
				<TicketHeaderSkeleton />
			) : (
				<Card
                  square
                  className={clsx(classes.ticketHeader, {
                    [classes.ticketHeaderChatwoot]: chatwootUI,
                  })}
                >
					{children}
				</Card>
			)}
		</>
	);
};

export default TicketHeader;
