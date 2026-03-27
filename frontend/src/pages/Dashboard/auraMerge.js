/**
 * Injeta métricas reais do Ticketz nos cartões Aura quando disponíveis.
 */
export function mergeAuraKpis(template, real) {
  const list = template.map((k) => ({ ...k }));
  const setVal = (id, v) => {
    const i = list.findIndex((x) => x.id === id);
    if (i >= 0) list[i].value = v;
  };

  if (real.openedTotal != null || real.pendingTotal != null) {
    const open = Number(real.openedTotal || 0) + Number(real.pendingTotal || 0);
    setVal("openChats", String(open));
  }
  if (real.newContacts != null) {
    setVal("newToday", String(real.newContacts));
  }
  if (real.avgServiceTimeFormatted) {
    setVal("avgResolution", real.avgServiceTimeFormatted);
  }
  if (real.avgWaitTimeFormatted) {
    setVal("avgResponse", real.avgWaitTimeFormatted);
  }

  return list;
}

/** Alinha barras “Aberto” e “Aguardando cliente” com o /dashboard/status em tempo real. */
export function mergeLiveTicketStatusBars(template, openedTotal, pendingTotal) {
  const values = [...template.values];
  if (typeof openedTotal === "number") values[0] = openedTotal;
  if (typeof pendingTotal === "number") values[2] = pendingTotal;
  return { ...template, values };
}
