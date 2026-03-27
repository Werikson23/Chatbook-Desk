import Backup from "../../models/Backup";

interface Params {
  companyId: number;
  pageNumber?: string;
}

const ListBackupsService = async ({
  companyId,
  pageNumber = "1"
}: Params): Promise<{ backups: Backup[]; count: number; hasMore: boolean }> => {
  const limit = 30;
  const page = Math.max(1, Number(pageNumber) || 1);
  const offset = (page - 1) * limit;

  const { count, rows } = await Backup.findAndCountAll({
    where: { companyId },
    order: [["createdAt", "DESC"]],
    limit,
    offset
  });

  return {
    backups: rows,
    count,
    hasMore: count > offset + rows.length
  };
};

export default ListBackupsService;
