import { Op } from "sequelize";
import AttributeContainer from "../../models/AttributeContainer";
import AttributeDefinition from "../../models/AttributeDefinition";
import AttributeGroupInstance from "../../models/AttributeGroupInstance";
import AttributeValue from "../../models/AttributeValue";
import ShowContactService from "../ContactServices/ShowContactService";
import ShowTicketService from "../TicketServices/ShowTicketService";
import resolveContainerPermissions from "./resolveContainerPermissions";
import { decodeStoredValue } from "./valueCodec";

interface Params {
  companyId: number;
  entityType: "contact" | "ticket";
  entityId: number;
  profile: string;
  isSuper: boolean;
}

const GetEntityAttributeSchemaService = async ({
  companyId,
  entityType,
  entityId,
  profile,
  isSuper
}: Params) => {
  if (entityType === "contact") {
    await ShowContactService(entityId, companyId);
  } else {
    await ShowTicketService(entityId, companyId);
  }

  const containers = await AttributeContainer.findAll({
    where: { companyId, entityType },
    order: [["sortOrder", "ASC"]]
  });

  const out: unknown[] = [];

  for (const c of containers) {
    const perms = await resolveContainerPermissions(
      companyId,
      c.id,
      profile,
      isSuper
    );
    if (!perms.canView) continue;

    const defs = await AttributeDefinition.findAll({
      where: { containerId: c.id, companyId, isActive: true },
      order: [["sortOrder", "ASC"]]
    });

    const basePayload = {
      id: c.id,
      key: c.key,
      name: c.name,
      icon: c.icon,
      color: c.color,
      category: c.category,
      uiLayout: c.uiLayout,
      isRepeatable: c.isRepeatable,
      isCollapsible: c.isCollapsible,
      sortOrder: c.sortOrder,
      permissions: perms
    };

    if (!c.isRepeatable) {
      const values = await AttributeValue.findAll({
        where: {
          companyId,
          entityType,
          entityId,
          groupInstanceId: { [Op.is]: null }
        }
      });
      const byDef = new Map(values.map(v => [v.attributeDefinitionId, v]));

      const attributes = defs.map(d => ({
        id: d.id,
        key: d.key,
        name: d.name,
        dataType: d.dataType,
        isRequired: d.isRequired,
        validationRules: d.validationRules,
        options: d.options,
        defaultValue: d.defaultValue,
        visibility: d.visibility,
        sortOrder: d.sortOrder,
        value: decodeStoredValue(byDef.get(d.id) || null, d.dataType)
      }));

      out.push({
        ...basePayload,
        instances: [
          {
            id: null,
            label: c.name,
            sortOrder: 0,
            attributes
          }
        ]
      });
    } else {
      const instances = await AttributeGroupInstance.findAll({
        where: { companyId, containerId: c.id, entityType, entityId },
        order: [["sortOrder", "ASC"]]
      });

      const instOut = [];
      for (const inst of instances) {
        const values = await AttributeValue.findAll({
          where: {
            companyId,
            entityType,
            entityId,
            groupInstanceId: inst.id
          }
        });
        const byDef = new Map(values.map(v => [v.attributeDefinitionId, v]));

        instOut.push({
          id: inst.id,
          label: inst.label,
          sortOrder: inst.sortOrder,
          attributes: defs.map(d => ({
            id: d.id,
            key: d.key,
            name: d.name,
            dataType: d.dataType,
            isRequired: d.isRequired,
            validationRules: d.validationRules,
            options: d.options,
            defaultValue: d.defaultValue,
            visibility: d.visibility,
            sortOrder: d.sortOrder,
            value: decodeStoredValue(byDef.get(d.id) || null, d.dataType)
          }))
        });
      }

      out.push({
        ...basePayload,
        instances: instOut
      });
    }
  }

  return { containers: out };
};

export default GetEntityAttributeSchemaService;
