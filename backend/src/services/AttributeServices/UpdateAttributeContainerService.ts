import { Op } from "sequelize";
import AttributeContainer from "../../models/AttributeContainer";

interface Params {
  companyId: number;
  containerId: number;
  name?: string;
  key?: string;
  entityType?: string;
  category?: string | null;
  icon?: string | null;
  color?: string | null;
  uiLayout?: string;
  isRepeatable?: boolean;
  isCollapsible?: boolean;
  sortOrder?: number;
}

const UpdateAttributeContainerService = async (p: Params) => {
  const c = await AttributeContainer.findOne({
    where: { id: p.containerId, companyId: p.companyId }
  });
  if (!c) {
    throw new Error("ERR_CONTAINER_NOT_FOUND");
  }

  const nextKey = p.key !== undefined ? p.key : c.key;
  const nextEntity = p.entityType !== undefined ? p.entityType : c.entityType;

  if (nextKey !== c.key || nextEntity !== c.entityType) {
    const dup = await AttributeContainer.findOne({
      where: {
        companyId: p.companyId,
        key: nextKey,
        entityType: nextEntity,
        id: { [Op.ne]: p.containerId }
      }
    });
    if (dup) {
      throw new Error("ERR_DUPLICATE_CONTAINER_KEY");
    }
  }

  await c.update({
    ...(p.name !== undefined && { name: p.name }),
    ...(p.key !== undefined && { key: p.key }),
    ...(p.entityType !== undefined && { entityType: p.entityType }),
    ...(p.category !== undefined && { category: p.category }),
    ...(p.icon !== undefined && { icon: p.icon }),
    ...(p.color !== undefined && { color: p.color }),
    ...(p.uiLayout !== undefined && { uiLayout: p.uiLayout }),
    ...(p.isRepeatable !== undefined && { isRepeatable: p.isRepeatable }),
    ...(p.isCollapsible !== undefined && { isCollapsible: p.isCollapsible }),
    ...(p.sortOrder !== undefined && { sortOrder: p.sortOrder })
  });

  return c;
};

export default UpdateAttributeContainerService;
