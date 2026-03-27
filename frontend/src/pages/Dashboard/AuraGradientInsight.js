import React from "react";
import Typography from "@material-ui/core/Typography";
import EmojiObjectsOutlinedIcon from "@material-ui/icons/EmojiObjectsOutlined";
import Box from "@material-ui/core/Box";
import { useDashboardStyles } from "./dashboardStyles";
import { i18n } from "../../translate/i18n";

export default function AuraGradientInsight({ titleKey, bodyKey }) {
  const dash = useDashboardStyles();
  return (
    <Box className={dash.auraGradientInsight} display="flex" alignItems="center" style={{ gap: 15 }}>
      <div className={dash.auraGradientIcon}>
        <EmojiObjectsOutlinedIcon style={{ fontSize: 22, color: "#fff" }} />
      </div>
      <div>
        <Typography style={{ fontSize: 16, fontWeight: 600, color: "#fff" }} component="h4" variant="subtitle1">
          {i18n.t(titleKey)}
        </Typography>
        <Typography style={{ fontSize: 13, opacity: 0.92, marginTop: 4, color: "#fff" }} component="p" variant="body2">
          {i18n.t(bodyKey)}
        </Typography>
      </div>
    </Box>
  );
}
