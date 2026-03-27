import React from "react";
import SettingsOutlinedIcon from "@material-ui/icons/SettingsOutlined";
import EventIcon from "@material-ui/icons/Event";
import GroupIcon from "@material-ui/icons/Group";
import ListIcon from "@material-ui/icons/List";
import SyncAltIcon from "@material-ui/icons/SyncAlt";
import BuildIcon from "@material-ui/icons/Build";
import ForumIcon from "@material-ui/icons/Forum";
import DescriptionIcon from "@material-ui/icons/Description";
import SupervisorAccountIcon from "@material-ui/icons/SupervisorAccount";
import LocalOfferIcon from "@material-ui/icons/LocalOffer";
import HelpOutlineIcon from "@material-ui/icons/HelpOutline";

import { i18n } from "../translate/i18n";

export const SETTINGS_CATS = ["Atendimento", "Configurações", "Estratégia", "Administração", "Sistema"];

/** Itens da sidebar de Configurações (single source of truth). */
export function getSettingsNavItems() {
  return [
    { key: "inbox", label: "Inbox", cat: "Atendimento", color: "#ff9500", icon: <ForumIcon style={{ fontSize: 14 }} /> },
    {
      key: "macros",
      label: "Respostas Rápidas",
      cat: "Atendimento",
      color: "#34c759",
      icon: <BuildIcon style={{ fontSize: 14 }} />,
      route: "/settings/quick-messages"
    },
    { key: "departamento", label: "Departamento", cat: "Configurações", color: "#34c759", icon: <GroupIcon style={{ fontSize: 14 }} /> },
    {
      key: "fila",
      label: "Fila",
      cat: "Configurações",
      color: "#ff9500",
      icon: <ListIcon style={{ fontSize: 14 }} />,
      route: "/settings/queues"
    },
    {
      key: "canal",
      label: "Canal / Adapter",
      cat: "Configurações",
      color: "#5856d6",
      icon: <SyncAltIcon style={{ fontSize: 14 }} />,
      route: "/settings/channels"
    },
    { key: "automacao", label: "Automação", cat: "Estratégia", color: "#ff2d55", icon: <BuildIcon style={{ fontSize: 14 }} /> },
    { key: "chatbot", label: "Chatbot Flow", cat: "Estratégia", color: "#007aff", icon: <ForumIcon style={{ fontSize: 14 }} /> },
    { key: "templates", label: "Templates", cat: "Estratégia", color: "#af52de", icon: <DescriptionIcon style={{ fontSize: 14 }} /> },
    {
      key: "usuarios",
      label: "Usuários",
      cat: "Administração",
      color: "#34c759",
      icon: <SupervisorAccountIcon style={{ fontSize: 14 }} />,
      route: "/settings/users"
    },
    { key: "roles", label: "Roles", cat: "Administração", color: "#ff9500", icon: <SupervisorAccountIcon style={{ fontSize: 14 }} /> },
    {
      key: "atributos",
      label: "Atributos",
      cat: "Administração",
      color: "#ffcc00",
      icon: <SettingsOutlinedIcon style={{ fontSize: 14 }} />,
      route: "/settings/attributes"
    },
    {
      key: "tags",
      label: "Tags",
      cat: "Administração",
      color: "#ff9500",
      icon: <LocalOfferIcon style={{ fontSize: 14 }} />,
      route: "/settings/tags"
    },
    { key: "geral", label: "Geral", cat: "Sistema", color: "#8e8e93", icon: <SettingsOutlinedIcon style={{ fontSize: 14 }} />, route: "/settings" },
    {
      key: "integracoes",
      label: "Integrações",
      cat: "Sistema",
      color: "#5856d6",
      icon: <SyncAltIcon style={{ fontSize: 14 }} />,
      route: "/settings/integrations"
    },
    {
      key: "sla",
      label: "SLA / Horários",
      cat: "Sistema",
      color: "#007aff",
      icon: <EventIcon style={{ fontSize: 14 }} />,
      route: "/settings/sla"
    },
    {
      key: "motivos",
      label: "Motivos de Encerramento",
      cat: "Sistema",
      color: "#ff3b30",
      icon: <HelpOutlineIcon style={{ fontSize: 14 }} />,
      route: "/settings/close-reasons"
    },
    {
      key: "despedida",
      label: "Automação · Mensagens de Despedida",
      cat: "Sistema",
      color: "#007aff",
      icon: <DescriptionIcon style={{ fontSize: 14 }} />,
      route: "/settings/automation/farewell-messages"
    },
    { key: "logs", label: "Logs", cat: "Sistema", color: "#555", icon: <HelpOutlineIcon style={{ fontSize: 14 }} /> },
    {
      key: "superadmin",
      label: i18n.t("settings.superadminSaaSTitle"),
      cat: "Sistema",
      color: "#1d1d1f",
      icon: <SettingsOutlinedIcon style={{ fontSize: 14 }} />,
      route: "/settings/super-admin",
      superOnly: true
    }
  ];
}

/** Resolve qual item da sidebar está ativo (maior path primeiro). */
export function matchSettingsNavKey(pathname, navItems) {
  const p = pathname.replace(/\/$/, "") || "/settings";
  if (p === "/settings") return "geral";
  const withRoutes = navItems.filter((n) => n.route && n.route !== "/settings");
  const sorted = [...withRoutes].sort((a, b) => (b.route.length || 0) - (a.route.length || 0));
  const hit = sorted.find((n) => p.startsWith(n.route));
  return hit?.key || "geral";
}
