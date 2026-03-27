import AttributeContainer from "../../models/AttributeContainer";
import AttributeGroupInstance from "../../models/AttributeGroupInstance";
import ShowContactService from "../ContactServices/ShowContactService";
import ShowTicketService from "../TicketServices/ShowTicketService";

interface Params {
  companyId: number;
  containerId: number;
  entityType: "contact" | "ticket";
  entityId: number;
  label: string;
  sortOrder?: number;
}

const CreateGroupInstanceService = async ({
  companyId,
  containerId,
  entityType,
  entityId,
  label,
  sortOrder = 0
}: Params) => {
  const container = await AttributeContainer.findOne({
    where: { id: containerId, companyId }
  });
  if (!container || !container.isRepeatable || container.entityType !== entityType) {
    throw new Error("ERR_INVALID_CONTAINER");
  }

  if (entityType === "contact") {
    await ShowContactService(entityId, companyId);
  } else {
    await ShowTicketService(entityId, companyId);
  }

  const inst = await AttributeGroupInstance.create({
    companyId,
    containerId,
    entityType,
    entityId,
    label,
    sortOrder
  });

  return inst;
};

export default CreateGroupInstanceService;
