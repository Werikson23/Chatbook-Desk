import { makeStyles } from "@material-ui/core/styles";
import { alpha } from "@material-ui/core/styles";

export const DASH_PAGE_BG_LIGHT = "#f5f5f7";

export const useDashboardStyles = makeStyles((theme) => {
  const surface =
    theme.palette.type === "dark"
      ? theme.palette.background.paper
      : theme.palette.common.white;

  const border =
    theme.palette.type === "dark"
      ? alpha(theme.palette.common.white, 0.08)
      : "rgba(0, 0, 0, 0.06)";

  const titleMuted =
    theme.palette.type === "dark"
      ? theme.palette.text.secondary
      : alpha("#1d1d1f", 0.55);

  return {
    pageRoot: {
      backgroundColor:
        theme.palette.type === "dark"
          ? theme.palette.background.default
          : DASH_PAGE_BG_LIGHT,
      minHeight: "100%",
      width: "100%",
      paddingBottom: theme.spacing(4),
    },
    container: {
      paddingTop: theme.spacing(3),
      paddingBottom: theme.spacing(2),
      maxWidth: 1280,
      marginLeft: "auto",
      marginRight: "auto",
      paddingLeft: theme.spacing(2),
      paddingRight: theme.spacing(2),
    },
    pageHeader: {
      marginBottom: theme.spacing(3),
    },
    pageTitle: {
      fontWeight: 600,
      fontSize: "1.75rem",
      letterSpacing: "-0.02em",
      color:
        theme.palette.type === "dark"
          ? theme.palette.text.primary
          : "#1d1d1f",
    },
    pageSubtitle: {
      marginTop: theme.spacing(0.5),
      color: theme.palette.text.secondary,
      fontSize: "0.9375rem",
      maxWidth: 640,
    },
    adsSection: {
      marginBottom: theme.spacing(2),
    },
    sectionLabel: {
      fontSize: "0.75rem",
      fontWeight: 600,
      textTransform: "uppercase",
      letterSpacing: "0.06em",
      color: titleMuted,
      marginBottom: theme.spacing(1.5),
    },
    filterPanel: {
      borderRadius: 12,
      border: `1px solid ${border}`,
      backgroundColor: surface,
      padding: theme.spacing(2, 2.5),
      boxShadow:
        theme.palette.type === "dark"
          ? "none"
          : "0 1px 2px rgba(0, 0, 0, 0.04)",
      marginBottom: theme.spacing(3),
    },
    chartPanel: {
      padding: theme.spacing(2.5),
      display: "flex",
      flexDirection: "column",
      minHeight: 320,
      borderRadius: 12,
      border: `1px solid ${border}`,
      backgroundColor: surface,
      boxShadow:
        theme.palette.type === "dark"
          ? "none"
          : "0 1px 2px rgba(0, 0, 0, 0.04)",
      overflow: "hidden",
      ...theme.scrollbarStyles,
    },
    attendantsPanel: {
      borderRadius: 12,
      border: `1px solid ${border}`,
      backgroundColor: surface,
      boxShadow:
        theme.palette.type === "dark"
          ? "none"
          : "0 1px 2px rgba(0, 0, 0, 0.04)",
    },
    kpiSurface: {
      borderRadius: 12,
      border: `1px solid ${border}`,
      backgroundColor: surface,
      boxShadow:
        theme.palette.type === "dark"
          ? "none"
          : "0 1px 2px rgba(0, 0, 0, 0.04)",
      height: "100%",
      minHeight: 112,
      overflow: "hidden",
    },
    kpiPrimary: {
      borderRadius: 12,
      background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
      color: theme.palette.primary.contrastText,
      height: "100%",
      minHeight: 128,
      overflow: "hidden",
      boxShadow:
        theme.palette.type === "dark"
          ? `0 4px 20px ${alpha(theme.palette.primary.main, 0.35)}`
          : `0 4px 16px ${alpha(theme.palette.primary.main, 0.25)}`,
    },
    kpiBody: {
      display: "flex",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      padding: theme.spacing(2, 2.5),
      height: "100%",
      gap: theme.spacing(1),
    },
    kpiText: {
      flex: 1,
      minWidth: 0,
    },
    kpiTitle: {
      color: "inherit",
      opacity: 0.85,
      fontWeight: 500,
      lineHeight: 1.3,
    },
    kpiTitleOnPrimary: {
      color: "inherit",
      opacity: 0.9,
    },
    kpiValue: {
      fontWeight: 600,
      marginTop: theme.spacing(0.5),
      lineHeight: 1.2,
      color: "inherit",
    },
    kpiValuePrimary: {
      fontWeight: 700,
    },
    kpiIconWrap: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      width: 52,
      height: 52,
      borderRadius: "50%",
      flexShrink: 0,
      backgroundColor: alpha(theme.palette.primary.main, 0.08),
      color: theme.palette.primary.main,
      "& svg": {
        fontSize: 28,
      },
    },
    kpiGraph: {
      flexShrink: 0,
      display: "flex",
      alignItems: "center",
      opacity: 0.95,
    },
    kpiGraphOnPrimary: {
      opacity: 0.92,
    },
    // legacy promo / registry (keep readable on new bg)
    ticketzRegistryPaper: {
      padding: theme.spacing(2),
      display: "flex",
      flexDirection: "column",
      overflowY: "auto",
      backgroundColor: surface,
      color: theme.palette.text.primary,
      border: `1px solid ${border}`,
      borderRadius: 12,
      marginBottom: theme.spacing(2),
      ...theme.scrollbarStyles,
    },
    supportPaper: {
      padding: theme.spacing(2),
      display: "flex",
      flexDirection: "column",
      overflowY: "clip",
      height: 300,
      backgroundColor: theme.palette.secondary.main,
      color: theme.palette.secondary.contrastText,
      borderRadius: 12,
      ...theme.scrollbarStyles,
    },
    extrasCard: {
      borderRadius: 12,
      border: `1px solid ${border}`,
      backgroundColor: surface,
      boxShadow:
        theme.palette.type === "dark"
          ? "none"
          : "0 1px 2px rgba(0, 0, 0, 0.04)",
    },
    headerActions: {
      display: "flex",
      flexDirection: "column",
      alignItems: "flex-end",
      gap: theme.spacing(1),
    },
    mockChip: {
      fontWeight: 600,
      height: 26,
    },
    auraEyebrow: {
      fontSize: "0.8125rem",
      color:
        theme.palette.type === "dark" ? theme.palette.text.secondary : "#86868b",
      fontWeight: 500,
      marginBottom: theme.spacing(0.25),
    },
    auraHubTitle: {
      fontSize: "1.75rem",
      fontWeight: 700,
      letterSpacing: "-0.03em",
      lineHeight: 1.15,
      color:
        theme.palette.type === "dark"
          ? theme.palette.text.primary
          : "#1d1d1f",
    },
    auraHeaderRow: {
      display: "flex",
      flexWrap: "wrap",
      justifyContent: "space-between",
      alignItems: "flex-end",
      gap: theme.spacing(2),
      marginBottom: theme.spacing(2),
    },
    auraFilterCluster: {
      display: "flex",
      flexDirection: "column",
      alignItems: "flex-end",
      gap: theme.spacing(1),
    },
    auraSegment: {
      display: "flex",
      gap: 4,
      padding: 4,
      borderRadius: 10,
      backgroundColor:
        theme.palette.type === "dark"
          ? theme.palette.action.hover
          : "#eeeef0",
      width: "fit-content",
    },
    auraSegBtn: {
      padding: "6px 16px",
      borderRadius: 8,
      fontSize: "0.75rem",
      fontWeight: 500,
      cursor: "pointer",
      border: "none",
      background: "transparent",
      color: theme.palette.text.secondary,
      fontFamily: "inherit",
      transition: "0.2s",
    },
    auraSegBtnActive: {
      backgroundColor: theme.palette.background.paper,
      boxShadow: theme.shadows[1],
      color:
        theme.palette.type === "dark"
          ? theme.palette.text.primary
          : "#000",
    },
    auraSelect: {
      minWidth: 140,
      fontSize: "0.75rem",
    },
    auraKpiGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
      gap: theme.spacing(2),
      marginBottom: theme.spacing(3),
    },
    auraKpiCard: {
      padding: theme.spacing(2),
      borderRadius: 16,
      border: `1px solid ${border}`,
      backgroundColor: surface,
      boxShadow:
        theme.palette.type === "dark"
          ? "none"
          : "0 1px 3px rgba(0, 0, 0, 0.02)",
      transition: "0.25s ease",
      "&:hover": {
        transform: "translateY(-2px)",
        boxShadow:
          theme.palette.type === "dark"
            ? theme.shadows[4]
            : "0 8px 24px rgba(0, 0, 0, 0.05)",
      },
    },
    auraKpiLabel: {
      fontSize: "0.6875rem",
      fontWeight: 600,
      textTransform: "uppercase",
      letterSpacing: "0.02em",
      color:
        theme.palette.type === "dark" ? theme.palette.text.secondary : "#86868b",
      display: "block",
      marginBottom: theme.spacing(0.5),
    },
    auraKpiValue: {
      fontSize: "1.5rem",
      fontWeight: 700,
      display: "block",
      marginBottom: 4,
    },
    auraKpiTrend: {
      fontSize: "0.6875rem",
      fontWeight: 600,
      marginTop: theme.spacing(1),
      display: "flex",
      alignItems: "center",
      gap: 4,
    },
    trendUp: { color: "#1db440" },
    trendDown: { color: "#ff3b30" },
    trendNeutral: { color: "#ffcc00" },
    auraChartCard: {
      padding: theme.spacing(2.5),
      borderRadius: 20,
      border: `1px solid ${border}`,
      backgroundColor: surface,
      display: "flex",
      flexDirection: "column",
      minHeight: 340,
      boxShadow:
        theme.palette.type === "dark"
          ? "none"
          : "0 1px 2px rgba(0, 0, 0, 0.04)",
    },
    auraChartHeader: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: theme.spacing(2),
    },
    auraChartTitle: {
      fontSize: "0.9375rem",
      fontWeight: 600,
    },
    auraChartBody: {
      width: "100%",
      height: 280,
      minHeight: 280,
      position: "relative",
    },
    tagsStrip: {
      display: "flex",
      flexWrap: "wrap",
      gap: theme.spacing(1),
      marginBottom: theme.spacing(2),
    },
    tagChip: {
      fontWeight: 600,
      borderColor: border,
    },
    tagsSectionRoot: {
      width: "100%",
    },
    tagsCardsPanel: {
      padding: theme.spacing(2.5),
      borderRadius: 20,
      border: `1px solid ${border}`,
      backgroundColor: surface,
      minHeight: 340,
      display: "flex",
      flexDirection: "column",
      boxShadow:
        theme.palette.type === "dark"
          ? "none"
          : "0 1px 2px rgba(0, 0, 0, 0.04)",
    },
    tagsCardsGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
      gap: theme.spacing(1.5),
      marginTop: theme.spacing(1),
      maxHeight: 280,
      overflowY: "auto",
      paddingRight: 4,
      ...theme.scrollbarStyles,
    },
    tagStatCard: {
      padding: theme.spacing(1.5),
      borderRadius: 12,
      border: `1px solid ${border}`,
      backgroundColor:
        theme.palette.type === "dark"
          ? theme.palette.action.hover
          : alpha("#f5f5f7", 0.9),
      transition: "transform 0.15s ease",
      "&:hover": {
        transform: "translateY(-1px)",
      },
    },
    tagStatName: {
      fontSize: "0.8125rem",
      fontWeight: 600,
      lineHeight: 1.3,
      marginBottom: theme.spacing(0.5),
      overflow: "hidden",
      textOverflow: "ellipsis",
      display: "-webkit-box",
      WebkitLineClamp: 2,
      WebkitBoxOrient: "vertical",
    },
    tagStatValue: {
      fontSize: "1.375rem",
      fontWeight: 700,
      letterSpacing: "-0.02em",
    },
    tagStatMeta: {
      fontSize: "0.6875rem",
      color: theme.palette.text.secondary,
      marginTop: 2,
    },
    auraPanelsGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
      gap: theme.spacing(3),
      marginBottom: theme.spacing(3),
    },
    auraPanel: {
      padding: theme.spacing(2.5),
      borderRadius: 18,
      border: `1px solid ${border}`,
      backgroundColor: surface,
      boxShadow:
        theme.palette.type === "dark"
          ? "none"
          : "0 1px 2px rgba(0, 0, 0, 0.04)",
    },
    auraPanelTitle: {
      fontSize: "0.9375rem",
      fontWeight: 600,
      marginBottom: theme.spacing(2),
    },
    auraRtGrid: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: theme.spacing(1),
      marginBottom: theme.spacing(2),
    },
    auraRtBox: {
      backgroundColor:
        theme.palette.type === "dark"
          ? theme.palette.action.hover
          : "#f5f5f7",
      padding: theme.spacing(1.5),
      borderRadius: 12,
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
    },
    auraRtLabel: {
      fontSize: "0.6875rem",
      color:
        theme.palette.type === "dark" ? theme.palette.text.secondary : "#86868b",
      marginBottom: 4,
    },
    auraRtValue: {
      fontSize: "1.125rem",
      fontWeight: 700,
    },
    auraAlertStrip: {
      borderRadius: 8,
      padding: theme.spacing(1.5),
      marginBottom: theme.spacing(1),
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      fontSize: "0.75rem",
    },
    auraTable: {
      width: "100%",
      borderCollapse: "collapse",
      fontSize: "0.75rem",
      "& th": {
        textAlign: "left",
        padding: "8px 6px",
        color:
          theme.palette.type === "dark" ? theme.palette.text.secondary : "#86868b",
        fontWeight: 600,
        borderBottom: `1px solid ${theme.palette.divider}`,
        fontSize: "0.6875rem",
        textTransform: "uppercase",
      },
      "& td": {
        padding: "10px 6px",
        borderBottom: `1px solid ${theme.palette.divider}`,
      },
    },
    auraBadge: {
      padding: "4px 8px",
      borderRadius: 6,
      fontSize: "0.625rem",
      fontWeight: 600,
      textTransform: "uppercase",
    },
    auraBadgeOnline: {
      backgroundColor: "rgba(29, 180, 64, 0.15)",
      color: "#1db440",
    },
    auraBadgePause: {
      backgroundColor: "rgba(255, 149, 0, 0.15)",
      color: "#ff9500",
    },
    auraBadgeOffline: {
      backgroundColor: "rgba(255, 59, 48, 0.12)",
      color: "#ff3b30",
    },
    auraGradientInsight: {
      padding: theme.spacing(3),
      borderRadius: 20,
      background: "linear-gradient(135deg, #007aff, #5856d6)",
      color: "#fff",
      marginBottom: theme.spacing(3),
    },
    auraGradientIcon: {
      minWidth: 40,
      height: 40,
      borderRadius: "50%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "rgba(255,255,255,0.2)",
    },
  };
});
