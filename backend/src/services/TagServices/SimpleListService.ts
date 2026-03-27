import { Op } from "sequelize";
import Tag from "../../models/Tag";
import ContactTag from "../../models/ContactTag";
import TicketTag from "../../models/TicketTag";

interface Request {
  companyId: number;
  searchParam?: string;
}

export type TagListRow = {
  id: number;
  name: string;
  color: string;
  kanban: number;
  ticketsCount: number;
  contactsCount: number;
};

const ListService = async ({
  companyId,
  searchParam
}: Request): Promise<TagListRow[]> => {
  let whereCondition = {};

  if (searchParam) {
    whereCondition = {
      [Op.or]: [
        { name: { [Op.like]: `%${searchParam}%` } },
        { color: { [Op.like]: `%${searchParam}%` } },
        // { kanban: { [Op.like]: `%${searchParam}%` } }
      ]
    };
  }

  const tags = await Tag.findAll({
    where: { ...whereCondition, companyId },
    order: [["name", "ASC"]],
    include: [
      {
        model: TicketTag,
        as: "ticketTags",
        attributes: ["ticketId"],
        required: false
      },
      {
        model: ContactTag,
        as: "contactTags",
        attributes: ["contactId"],
        required: false
      }
    ],
    attributes: ["id", "name", "color", "kanban", "companyId"]
  });

  return tags.map((t) => ({
    id: t.id,
    name: t.name,
    color: t.color,
    kanban: t.kanban,
    ticketsCount: t.ticketTags?.length ?? 0,
    contactsCount: t.contactTags?.length ?? 0
  }));
};

export default ListService;
