import React, { useMemo } from "react";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  root: {
    overflow: "hidden",
    whiteSpace: "nowrap",
    textOverflow: "ellipsis",
    display: "flex",
    alignItems: "center",
    gap: 4,
  },
  tag: {
    color: "#fff",
    fontSize: 10,
    height: 18,
    lineHeight: "18px",
    borderRadius: 4,
    padding: "0 6px",
    whiteSpace: "nowrap",
    fontWeight: 600,
  },
  moreTag: {
    background: "#e5e7eb",
    color: "#555",
  },
  vip: { background: "#7e5bef" },
  urgente: { background: "#ef4444" },
  financeiro: { background: "#3b82f6" },
  suporte: { background: "#10b981" },
  defaultTag: { background: "#6b7280" },
}));

const PRIORITY_ORDER = ["Urgente", "VIP", "Financeiro", "Suporte"];

const normalizeTagName = (name = "") => String(name).trim();

const TagsLine = ({ ticket }) => {
  const classes = useStyles();
  const tags = useMemo(() => {
    const merged = [...(ticket?.tags || []), ...(ticket?.contact?.tags || [])];
    const deduped = merged.filter(
      (tag, idx, arr) =>
        arr.findIndex((t) => normalizeTagName(t?.name).toLowerCase() === normalizeTagName(tag?.name).toLowerCase()) === idx
    );
    return deduped.sort((a, b) => {
      const aIdx = PRIORITY_ORDER.indexOf(normalizeTagName(a?.name));
      const bIdx = PRIORITY_ORDER.indexOf(normalizeTagName(b?.name));
      const pa = aIdx === -1 ? 999 : aIdx;
      const pb = bIdx === -1 ? 999 : bIdx;
      return pa - pb;
    });
  }, [ticket]);

  const visible = tags.slice(0, 2);
  const remaining = Math.max(0, tags.length - visible.length);

  const getTagClass = (name = "") => {
    const key = normalizeTagName(name).toLowerCase();
    if (key === "vip") return classes.vip;
    if (key === "urgente") return classes.urgente;
    if (key === "financeiro") return classes.financeiro;
    if (key === "suporte") return classes.suporte;
    return classes.defaultTag;
  };

  return (
    <div className={classes.root}>
      {visible.map((tag) => (
        <span key={normalizeTagName(tag?.name)} className={`${classes.tag} ${getTagClass(tag?.name)}`}>
          {normalizeTagName(tag?.name)}
        </span>
      ))}
      {remaining > 0 && <span className={`${classes.tag} ${classes.moreTag}`}>+{remaining}</span>}
    </div>
  );
};

export default TagsLine;
