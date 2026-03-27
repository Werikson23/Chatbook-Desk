import sequelize from "../../database";
import AttributeContainer from "../../models/AttributeContainer";
import AttributeGroupInstance from "../../models/AttributeGroupInstance";
import AttributeValue from "../../models/AttributeValue";
import ShowContactService from "../ContactServices/ShowContactService";
import ShowTicketService from "../TicketServices/ShowTicketService";
import resolveContainerPermissions from "./resolveContainerPermissions";

interface Params {
  companyId: number;
  groupInstanceId: number;
  profile: string;
  isSuper: boolean;
  newLabel?: string;
}

const CopyGroupInstanceService = async ({
  companyId,
  groupInstanceId,
  profile,
  isSuper,
  newLabel
}: Params) => {
  const src = await AttributeGroupInstance.findOne({
    where: { id: groupInstanceId, companyId }
  });
  if (!src) {
    throw new Error("ERR_GROUP_NOT_FOUND");
  }

  const container = await AttributeContainer.findByPk(src.containerId);
  if (!container || !container.isRepeatable) {
    throw new Error("ERR_CONTAINER_NOT_REPEATABLE");
  }

  const perms = await resolveContainerPermissions(companyId, container.id, profile, isSuper);
  if (!perms.canCopy) {
    throw new Error("ERR_NO_PERMISSION_COPY");
  }

  const entityType = src.entityType as "contact" | "ticket";
  const entityId = src.entityId;

  if (entityType === "contact") {
    await ShowContactService(entityId, companyId);
  } else {
    await ShowTicketService(entityId, companyId);
  }

  const maxSort = await AttributeGroupInstance.max<number, AttributeGroupInstance>("sortOrder", {
    where: {
      companyId,
      containerId: container.id,
      entityType: src.entityType,
      entityId: src.entityId
    }
  });

  const label = newLabel?.trim() || `${src.label} (cópia)`;

  const created = await sequelize.transaction(async (transaction) => {
    const inst = await AttributeGroupInstance.create(
      {
        companyId,
        containerId: container.id,
        entityType: src.entityType,
        entityId: src.entityId,
        label,
        sortOrder: (maxSort || 0) + 1
      },
      { transaction }
    );

    const vals = await AttributeValue.findAll({
      where: {
        companyId,
        entityType: src.entityType,
        entityId: src.entityId,
        groupInstanceId: src.id
      },
      transaction
    });

    for (const v of vals) {
      await AttributeValue.create(
        {
          companyId,
          attributeDefinitionId: v.attributeDefinitionId,
          entityType: src.entityType,
          entityId: src.entityId,
          groupInstanceId: inst.id,
          valueText: v.valueText,
          valueNumber: v.valueNumber,
          valueBoolean: v.valueBoolean,
          valueDate: v.valueDate,
          valueJson: v.valueJson,
          valueStringIndex: v.valueStringIndex,
          valueNumberIndex: v.valueNumberIndex,
          valueDateIndex: v.valueDateIndex
        },
        { transaction }
      );
    }

    return inst;
  });

  return created;
};

export default CopyGroupInstanceService;
