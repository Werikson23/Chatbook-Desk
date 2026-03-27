import { Transaction } from "sequelize";
import sequelize from "../../database";
import AttributeDefinition from "../../models/AttributeDefinition";
import AttributeContainer from "../../models/AttributeContainer";
import AttributeValue from "../../models/AttributeValue";
import AttributeAuditLog from "../../models/AttributeAuditLog";
import AttributeGroupInstance from "../../models/AttributeGroupInstance";
import ShowContactService from "../ContactServices/ShowContactService";
import ShowTicketService from "../TicketServices/ShowTicketService";
import resolveContainerPermissions from "./resolveContainerPermissions";
import { decodeStoredValue, encodeValueForStorage, valuesEqual } from "./valueCodec";

interface ValueInput {
  attributeDefinitionId: number;
  groupInstanceId?: number | null;
  value: unknown;
}

interface Params {
  companyId: number;
  entityType: "contact" | "ticket";
  entityId: number;
  profile: string;
  isSuper: boolean;
  values: ValueInput[];
  actorId: number;
  ipAddress?: string;
  userAgent?: string;
  source?: string;
}

const UpsertAttributeValuesService = async (params: Params): Promise<{ ok: boolean }> => {
  const {
    companyId,
    entityType,
    entityId,
    profile,
    isSuper,
    values: payload,
    actorId,
    ipAddress,
    userAgent,
    source
  } = params;

  if (entityType === "contact") {
    await ShowContactService(entityId, companyId);
  } else {
    await ShowTicketService(entityId, companyId);
  }

  await sequelize.transaction(async (t: Transaction) => {
    for (const item of payload) {
      const def = await AttributeDefinition.findByPk(item.attributeDefinitionId, {
        transaction: t
      });

      if (!def || def.companyId !== companyId) {
        throw new Error("ERR_INVALID_ATTRIBUTE_DEFINITION");
      }

      const container = await AttributeContainer.findByPk(def.containerId, { transaction: t });
      if (!container || container.entityType !== entityType || container.companyId !== companyId) {
        throw new Error("ERR_INVALID_CONTAINER");
      }

      const perms = await resolveContainerPermissions(companyId, container.id, profile, isSuper);
      if (!perms.canEdit) {
        throw new Error("ERR_NO_PERMISSION_EDIT_ATTRIBUTES");
      }

      const groupId = item.groupInstanceId ?? null;
      if (groupId) {
        const gi = await AttributeGroupInstance.findOne({
          where: { id: groupId, companyId, containerId: container.id, entityType, entityId },
          transaction: t
        });
        if (!gi) {
          throw new Error("ERR_INVALID_GROUP_INSTANCE");
        }
      } else if (container.isRepeatable) {
        throw new Error("ERR_GROUP_REQUIRED");
      }

      const existing = await AttributeValue.findOne({
        where: {
          companyId,
          attributeDefinitionId: def.id,
          entityType,
          entityId,
          groupInstanceId: groupId
        },
        transaction: t
      });

      const oldDecoded = decodeStoredValue(existing, def.dataType);
      const newDecoded = item.value;
      if (valuesEqual(def.dataType, oldDecoded, newDecoded)) {
        continue;
      }

      const encoded = encodeValueForStorage(def.dataType, newDecoded);

      if (existing) {
        await existing.update(
          {
            ...encoded
          },
          { transaction: t }
        );
      } else {
        await AttributeValue.create(
          {
            companyId,
            attributeDefinitionId: def.id,
            entityType,
            entityId,
            groupInstanceId: groupId,
            ...encoded
          },
          { transaction: t }
        );
      }

      await AttributeAuditLog.create(
        {
          companyId,
          actorId,
          actorType: "user",
          action: "updated",
          entityType,
          entityId,
          fieldName: `${container.key}.${def.key}`,
          oldValue: oldDecoded as object,
          newValue: newDecoded as object,
          metadata: {
            containerId: container.id,
            attributeDefinitionId: def.id,
            groupInstanceId: groupId
          },
          ipAddress: ipAddress || null,
          userAgent: userAgent || null,
          source: source || "api"
        },
        { transaction: t }
      );
    }
  });

  return { ok: true };
};

export default UpsertAttributeValuesService;