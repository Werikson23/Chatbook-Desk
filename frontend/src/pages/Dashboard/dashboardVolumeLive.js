import { getISOStringWithTimezone } from "../../helpers/getISOStringWithTimezone";

/**
 * Constrói série alinhada ao TicketCountersChart a partir de ticketCounters da API.
 */
export function buildVolumeLiveFromTickets(ticketCounters) {
  if (!ticketCounters?.create?.field || !ticketCounters?.create?.counters || !ticketCounters?.close?.counters) {
    return null;
  }

  const createMap = {};
  ticketCounters.create.counters.forEach((item) => {
    const date = new Date(item.time);
    const key =
      ticketCounters.create.field === "day"
        ? getISOStringWithTimezone(date).split("T")[0]
        : getISOStringWithTimezone(date).split(".")[0];
    createMap[key] = Number(item.counter);
  });

  const closeMap = {};
  ticketCounters.close.counters.forEach((item) => {
    const date = new Date(item.time);
    const key =
      ticketCounters.close.field === "day"
        ? getISOStringWithTimezone(date).split("T")[0]
        : getISOStringWithTimezone(date).split(".")[0];
    closeMap[key] = Number(item.counter);
  });

  const keySet = new Set([...Object.keys(createMap), ...Object.keys(closeMap)]);
  const keys = [...keySet].sort();
  if (!keys.length) return null;

  const chartData = keys.map((k) => ({
    label: k,
    novos: createMap[k] || 0,
    resolvidos: closeMap[k] || 0,
  }));

  return {
    chartData,
    field: ticketCounters.create.field,
  };
}
