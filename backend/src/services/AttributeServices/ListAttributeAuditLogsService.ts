import { Op } from "sequelize";
import AttributeAuditLog from "../../models/AttributeAuditLog";

interface Params {
  companyId: number;
  entityType?: string;
  entityId?: number;
  action?: string;
  dateFrom?: string;
  dateTo?: string;
  pageNumber?: string;
}

const limit = 50;

const ListAttributeAuditLogsService = async ({
  companyId,
  entityType,
  entityId,
  action,
  dateFrom,
  dateTo,
  pageNumber = "1"
}: Params) => {
  const page = Math.max(1, Number.parseInt(pageNumber, 10) || 1);
  const offset = limit * (page - 1);

  const where: Record<string, unknown> = { companyId };

  if (entityType) where.entityType = entityType;
  if (entityId !== undefined && entityId !== null) where.entityId = entityId;
  if (action) where.action = action;

  if (dateFrom || dateTo) {
    where.createdAt = {
      ...(dateFrom ? { [Op.gte]: new Date(dateFrom) } : {}),
      ...(dateTo ? { [Op.lte]: new Date(dateTo) } : {})
    };
  }

  const { rows, count } = await AttributeAuditLog.findAndCountAll({
    where,
    order: [["createdAt", "DESC"]],
    limit,
    offset
  });

  return {
    logs: rows,
    count,
    hasMore: count > offset + rows.length
  };
};

export default ListAttributeAuditLogsService;
