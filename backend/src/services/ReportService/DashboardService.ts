import { Op, fn, col, WhereOptions, literal, QueryTypes } from "sequelize";
import Ticket from "../../models/Ticket";
import Queue from "../../models/Queue";
import { GetCompanySetting } from "../../helpers/CheckSettings";
import User from "../../models/User";
import TicketTraking from "../../models/TicketTraking";
import sequelize from "../../database";
import { listCounterSerie } from "../CounterServices/ListCounterSerie";
import { regionFromDdd, BrazilRegionId } from "../../helpers/brazilDddRegion";

type TicketTrackingStatistics = {
  avgWaitTime: number;
  avgServiceTime: number;
  totalClosed: number;
  newContacts: number;
};

export type DashboardDateRange = {
  date_from?: string;
  date_to?: string;
  hour_from?: string;
  hour_to?: string;
  tz?: string;
  closeReasonId?: string | number;
  queueId?: string | number;
  channel?: string;
};

type TicketsStatisticsData = {
  start: string;
  end: string;
  hour_start?: string;
  hour_end?: string;
  ticketCounters: {
    create: any;
    accept: any;
    transfer: any;
    close: any;
  };
  ticketStatistics: {
    avgWaitTime: number;
    avgServiceTime: number;
    totalClosed: number;
  };
};

type UserStatistics = {
  id: number;
  name: string;
  avgWaitTime: number;
  avgServiceTime: number;
  totalTickets: number;
  openTickets: number;
  closedTickets: number;
  averageRating: number;
  online: boolean;
};

type UserReportData = {
  start: string;
  end: string;
  userReport: UserStatistics[];
};

export async function calculateTicketStatistics(
  companyId: number,
  start: Date,
  end: Date,
  closeReasonId?: number | null,
  queueId?: number | null,
  channel?: string | null
): Promise<TicketTrackingStatistics> {
  const trackingWhere: WhereOptions<TicketTraking> = {
    companyId,
    createdAt: {
      [Op.between]: [start, end]
    },
    finishedAt: {
      [Op.between]: [start, end]
    }
  };

  const ticketSubParts = [`"companyId" = ${Number(companyId)}`];
  if (closeReasonId) {
    ticketSubParts.push(`"closeReasonId" = ${Number(closeReasonId)}`);
  }
  if (queueId) {
    ticketSubParts.push(`"queueId" = ${Number(queueId)}`);
  }
  if (channel) {
    ticketSubParts.push(`"channel" = ${sequelize.escape(channel)}`);
  }
  if (ticketSubParts.length > 1) {
    trackingWhere.ticketId = {
      [Op.in]: literal(
        `(SELECT "id" FROM "Tickets" WHERE ${ticketSubParts.join(" AND ")})`
      )
    };
  }

  const ticketStatistics = (await TicketTraking.findOne({
    attributes: [
      [fn("AVG", col("waitTime")), "avgWaitTime"],
      [fn("AVG", col("serviceTime")), "avgServiceTime"],
      [fn("COUNT", col("id")), "totalClosed"]
    ],
    where: trackingWhere,
    raw: true
  })) as unknown as TicketTrackingStatistics;

  // force to numbers
  ticketStatistics.avgWaitTime = Number(ticketStatistics.avgWaitTime) || null;
  ticketStatistics.avgServiceTime =
    Number(ticketStatistics.avgServiceTime) || null;
  ticketStatistics.totalClosed = Number(ticketStatistics.totalClosed) || null;

  const countContactsQuery = `
  SELECT COUNT(*) AS count FROM (SELECT FROM (
    SELECT 
        t.id AS "ticketId",
        t."contactId",
        c."createdAt"
    FROM 
        "TicketTraking" tt
    JOIN 
        "Tickets" t ON tt."ticketId" = t.id
    JOIN 
        "Contacts" c ON t."contactId" = c.id
    WHERE 
        (tt."createdAt" BETWEEN :startDate AND :endDate)
        AND (tt."companyId" = :companyId)
        AND (tt."finishedAt" BETWEEN :startDate AND :endDate)
        AND (c."createdAt" BETWEEN :startDate AND :endDate)
        AND (:closeReasonId IS NULL OR t."closeReasonId" = :closeReasonId)
        AND (:queueId IS NULL OR t."queueId" = :queueId)
        AND (:channel IS NULL OR t."channel" = :channel)
  ) counters_list GROUP BY "contactId") counters_totals
  `;

  const newContacts = (await sequelize.query(countContactsQuery, {
    replacements: {
      companyId,
      startDate: start,
      endDate: end,
      closeReasonId: closeReasonId || null,
      queueId: queueId || null,
      channel: channel || null
    },
    type: QueryTypes.SELECT
  })) as unknown as [{ count: number }];

  ticketStatistics.newContacts = Number(newContacts[0]?.count) || null;

  return ticketStatistics;
}

export async function ticketsStatusSummary(companyId: number) {
  const where: WhereOptions<Ticket> = {
    companyId,
    status: {
      [Op.or]: ["open", "pending"]
    }
  };

  const groupsEnabled =
    (await GetCompanySetting(companyId, "groupsTab", "disabled")) === "enabled";

  if (groupsEnabled) {
    where.isGroup = false;
  }

  const ticketsSummary = await Ticket.findAll({
    attributes: ["status", "queueId", [fn("COUNT", "*"), "count"]],
    where,
    include: [
      {
        model: Queue,
        attributes: ["id", "name", "color"],
        required: false
      }
    ],
    group: ["status", "queueId", "queue.id", "queue.name"]
  });

  return ticketsSummary;
}

export async function ticketsChannelSummary(companyId: number) {
  const where: WhereOptions<Ticket> = {
    companyId,
    status: { [Op.or]: ["open", "pending"] }
  };
  const rows = await Ticket.findAll({
    attributes: ["channel", [fn("COUNT", "*"), "count"]],
    where,
    group: ["channel"],
    raw: true
  });
  return rows as unknown as { channel: string; count: string }[];
}

export async function usersStatusSummary(companyId) {
  const usersSummary = await User.findAll({
    attributes: [
      "id",
      "name",
      [
        literal(`(
          SELECT COUNT(*)
          FROM "UserSocketSessions"
          WHERE "UserSocketSessions"."userId" = "User"."id"
            AND "UserSocketSessions"."active" = true
        ) > 0`),
        "online"
      ],
      [fn("COUNT", col("tickets.id")), "openTicketsCount"]
    ],
    where: {
      companyId
    },
    include: [
      {
        model: Ticket,
        as: "tickets",
        attributes: [],
        where: {
          status: "open"
        },
        required: false
      }
    ],
    group: ["User.id"]
  });

  return usersSummary;
}

export async function userReport(companyId: number, start: Date, end: Date) {
  return userReportByFilter(companyId, start, end, null, null, null);
}

export async function userReportByFilter(
  companyId: number,
  start: Date,
  end: Date,
  closeReasonId?: number | null,
  queueId?: number | null,
  channel?: string | null
) {
  const ticketFilterWhere: WhereOptions<Ticket> = {};
  if (closeReasonId) {
    ticketFilterWhere.closeReasonId = closeReasonId;
  }
  if (queueId) {
    ticketFilterWhere.queueId = queueId;
  }
  if (channel) {
    ticketFilterWhere.channel = channel;
  }

  const result = await User.findAll({
    attributes: [
      "id",
      "name",
      [fn("AVG", col("tickets.ticketTrakings.waitTime")), "avgWaitTime"],
      [fn("AVG", col("tickets.ticketTrakings.serviceTime")), "avgServiceTime"],
      [fn("COUNT", col("tickets.id")), "totalTickets"],
      [
        literal(`(
          SELECT COUNT(*)
          FROM "TicketTraking" AS tt
          JOIN "Tickets" AS t ON tt."ticketId" = t.id
          WHERE t."userId" = "User"."id"
            AND tt."startedAt" < :endDate
            AND (tt."finishedAt" > :endDate OR tt."finishedAt" IS NULL)
        )`),
        "openTickets"
      ],
      [
        literal(`(
          SELECT COUNT(*)
          FROM "TicketTraking" AS tt
          JOIN "Tickets" AS t ON tt."ticketId" = t.id
          WHERE t."userId" = "User"."id"
            AND tt."finishedAt" BETWEEN :startDate AND :endDate
        )`),
        "closedTickets"
      ],
      [
        literal(`(
          SELECT AVG("rate")
          FROM "UserRatings"
          WHERE "UserRatings"."userId" = "User"."id"
            AND "UserRatings"."createdAt" BETWEEN :startDate AND :endDate
        )`),
        "averageRating"
      ],
      [
        literal(`(
          SELECT COUNT(*)>0
          FROM "UserSocketSessions"
          WHERE "UserSocketSessions"."userId" = "User"."id"
            AND "UserSocketSessions"."active" = true
        )`),
        "online"
      ]
    ],
    where: {
      companyId
    },
    include: [
      {
        model: Ticket,
        as: "tickets",
        attributes: [],
        where: ticketFilterWhere,
        required: false,
        include: [
          {
            model: TicketTraking,
            as: "ticketTrakings",
            attributes: [],
            where: {
              [Op.or]: [
                {
                  startedAt: { [Op.between]: [start, end] }
                },
                {
                  finishedAt: { [Op.between]: [start, end] }
                },
                {
                  startedAt: { [Op.lt]: end },
                  finishedAt: { [Op.gt]: end }
                },
                {
                  startedAt: { [Op.lt]: end },
                  finishedAt: null
                }
              ]
            }
          }
        ]
      }
    ],
    replacements: {
      startDate: start,
      endDate: end
    },
    group: ["User.id"]
  });

  return result as unknown[] as UserStatistics[];
}

export async function statusSummaryService(companyId: number) {
  return {
    ticketsStatusSummary: await ticketsStatusSummary(companyId),
    usersStatusSummary: await usersStatusSummary(companyId),
    channelBreakdown: await ticketsChannelSummary(companyId)
  };
}

export async function ticketsStatisticsService(
  companyId: number,
  params: DashboardDateRange
): Promise<TicketsStatisticsData> {
  let start: Date;
  let end = new Date();
  const tz = params.tz || "Z";
  const closeReasonId = params.closeReasonId
    ? Number(params.closeReasonId)
    : null;
  const queueId = params.queueId ? Number(params.queueId) : null;
  const channel = params.channel || null;

  if (params.date_from && params.date_to) {
    start = new Date(
      `${params.date_from}T${params?.hour_from || "00:00:00"}${tz}`
    );
    end = new Date(`${params.date_to}T${params?.hour_to || "23:59:59"}${tz}`);
  } else {
    throw new Error("Invalid date range");
  }

  return {
    start: params.date_from,
    end: params.date_to,
    hour_start: params?.hour_from,
    hour_end: params?.hour_to,
    ticketCounters: {
      create: await listCounterSerie(companyId, "ticket-create", start, end),
      accept: await listCounterSerie(companyId, "ticket-accept", start, end),
      transfer: await listCounterSerie(
        companyId,
        "ticket-transfer",
        start,
        end
      ),
      close: await listCounterSerie(companyId, "ticket-close", start, end)
    },
    ticketStatistics: await calculateTicketStatistics(
      companyId,
      start,
      end,
      closeReasonId,
      queueId,
      channel
    )
  };
}

export async function closeReasonsStatsService(
  companyId: number,
  params: DashboardDateRange
): Promise<{ id: number; name: string; count: number }[]> {
  let start: Date;
  let end = new Date();
  const tz = params.tz || "Z";
  const queueId = params.queueId ? Number(params.queueId) : null;
  const channel = params.channel || null;

  if (params.date_from && params.date_to) {
    start = new Date(
      `${params.date_from}T${params?.hour_from || "00:00:00"}${tz}`
    );
    end = new Date(`${params.date_to}T${params?.hour_to || "23:59:59"}${tz}`);
  } else {
    throw new Error("Invalid date range");
  }

  let extra = "";
  if (queueId) {
    extra += ` AND t."queueId" = ${queueId}`;
  }
  if (channel) {
    extra += ` AND t."channel" = ${sequelize.escape(channel)}`;
  }

  const rows = (await sequelize.query(
    `
    SELECT cr.id AS "id", cr.name AS "name", COUNT(t.id)::int AS "count"
    FROM "Tickets" t
    INNER JOIN "CloseReasons" cr ON t."closeReasonId" = cr.id
    WHERE t."companyId" = :companyId
    AND t.status = 'closed'
    AND t."updatedAt" BETWEEN :startDate AND :endDate
    AND t."closeReasonId" IS NOT NULL
    ${extra}
    GROUP BY cr.id, cr.name
    ORDER BY COUNT(t.id) DESC
  `,
    {
      replacements: {
        companyId,
        startDate: start,
        endDate: end
      },
      type: QueryTypes.SELECT
    }
  )) as unknown as { id: number; name: string; count: number }[];

  return rows;
}

export async function usersReportService(
  companyId: number,
  params: DashboardDateRange
): Promise<UserReportData> {
  let start: Date;
  let end = new Date();
  const tz = params.tz || "Z";
  const closeReasonId = params.closeReasonId
    ? Number(params.closeReasonId)
    : null;
  const queueId = params.queueId ? Number(params.queueId) : null;
  const channel = params.channel || null;

  if (params.date_from && params.date_to) {
    start = new Date(`${params.date_from}T00:00:00${tz}`);
    end = new Date(`${params.date_to}T23:59:59${tz}`);
  } else {
    throw new Error("Invalid date range");
  }

  return {
    start: params.date_from,
    end: params.date_to,
    userReport: await userReportByFilter(
      companyId,
      start,
      end,
      closeReasonId,
      queueId,
      channel
    )
  };
}

const GEO_REGION_LAYOUT: Record<
  BrazilRegionId,
  { leftPct: number; topPct: number; labelKey: string }
> = {
  norte: {
    leftPct: 38,
    topPct: 28,
    labelKey: "dashboard.extras.geoRegionNorte"
  },
  nordeste: {
    leftPct: 58,
    topPct: 38,
    labelKey: "dashboard.extras.geoRegionNordeste"
  },
  centro_oeste: {
    leftPct: 45,
    topPct: 50,
    labelKey: "dashboard.extras.geoRegionCentroOeste"
  },
  sudeste: {
    leftPct: 55,
    topPct: 60,
    labelKey: "dashboard.extras.geoRegionSudeste"
  },
  sul: { leftPct: 50, topPct: 78, labelKey: "dashboard.extras.geoRegionSul" },
  desconhecido: {
    leftPct: 50,
    topPct: 45,
    labelKey: "dashboard.extras.geoRegionUnknown"
  }
};

export type DashboardGeoByDddPoint = {
  id: string;
  labelKey: string;
  leftPct: number;
  topPct: number;
  volume: number;
};

export type DashboardGeoByDddRegionRow = {
  regionId: string;
  labelKey: string;
  count: number;
};

export type DashboardGeoByDddDddRow = {
  ddd: string;
  regionId: string;
  count: number;
};

export type DashboardGeoByDddResponse = {
  centerLabelKey: string;
  points: DashboardGeoByDddPoint[];
  regions: DashboardGeoByDddRegionRow[];
  ddds: DashboardGeoByDddDddRow[];
  totalWithDdd: number;
};

/**
 * Contatos da empresa: extrai DDD do número (55 + DDD ou DDD local) e agrega por região.
 * Opcionalmente restringe por data de criação do contato (alinhado ao filtro do dashboard).
 */
export async function geoByDddService(
  companyId: number,
  params?: Pick<
    DashboardDateRange,
    "date_from" | "date_to" | "hour_from" | "hour_to" | "tz"
  >
): Promise<DashboardGeoByDddResponse> {
  const replacements: Record<string, unknown> = { companyId };
  let dateClause = "";

  if (params?.date_from && params?.date_to) {
    const tz = params.tz || "Z";
    replacements.geoStart = new Date(
      `${params.date_from}T${params?.hour_from || "00:00:00"}${tz}`
    );
    replacements.geoEnd = new Date(
      `${params.date_to}T${params?.hour_to || "23:59:59"}${tz}`
    );
    dateClause = ` AND c."createdAt" BETWEEN :geoStart AND :geoEnd `;
  }

  const rows = (await sequelize.query(
    `
    WITH digits AS (
      SELECT regexp_replace(c."number", '[^0-9]', '', 'g') AS d
      FROM "Contacts" c
      WHERE c."companyId" = :companyId
      ${dateClause}
    ),
    parsed AS (
      SELECT
        CASE
          WHEN LENGTH(d) >= 12 AND SUBSTRING(d FROM 1 FOR 2) = '55'
            THEN SUBSTRING(d FROM 3 FOR 2)
          WHEN LENGTH(d) IN (10, 11) AND SUBSTRING(d FROM 1 FOR 1) <> '0'
            THEN SUBSTRING(d FROM 1 FOR 2)
          ELSE NULL
        END AS ddd
      FROM digits
    )
    SELECT ddd, COUNT(*)::int AS count
    FROM parsed
    WHERE ddd IS NOT NULL
      AND LENGTH(ddd) = 2
      AND ddd ~ '^[0-9]{2}$'
    GROUP BY ddd
    ORDER BY count DESC
    `,
    {
      replacements,
      type: QueryTypes.SELECT
    }
  )) as { ddd: string; count: number }[];

  const regionTotals: Record<BrazilRegionId, number> = {
    norte: 0,
    nordeste: 0,
    centro_oeste: 0,
    sudeste: 0,
    sul: 0,
    desconhecido: 0
  };

  const ddds: DashboardGeoByDddDddRow[] = rows.map(row => {
    const rid = regionFromDdd(row.ddd);
    regionTotals[rid] += row.count;
    return { ddd: row.ddd, regionId: rid, count: row.count };
  });

  const totalWithDdd = rows.reduce((s, r) => s + r.count, 0);

  const regions: DashboardGeoByDddRegionRow[] = (
    Object.entries(regionTotals) as [BrazilRegionId, number][]
  )
    .filter(([, c]) => c > 0)
    .map(([regionId, count]) => ({
      regionId,
      labelKey: GEO_REGION_LAYOUT[regionId].labelKey,
      count
    }))
    .sort((a, b) => b.count - a.count);

  const points: DashboardGeoByDddPoint[] = regions.map(r => {
    const layout =
      GEO_REGION_LAYOUT[r.regionId as BrazilRegionId] ||
      GEO_REGION_LAYOUT.desconhecido;
    return {
      id: r.regionId,
      labelKey: layout.labelKey,
      leftPct: layout.leftPct,
      topPct: layout.topPct,
      volume: r.count
    };
  });

  return {
    centerLabelKey: "dashboard.extras.geoCenterLabelReal",
    points,
    regions,
    ddds,
    totalWithDdd
  };
}
