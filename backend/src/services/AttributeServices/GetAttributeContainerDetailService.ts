import AttributeContainer from "../../models/AttributeContainer";
import AttributeContainerProfilePermission from "../../models/AttributeContainerProfilePermission";
import AttributeDefinition from "../../models/AttributeDefinition";

interface Params {
  companyId: number;
  containerId: number;
}

const GetAttributeContainerDetailService = async ({
  companyId,
  containerId
}: Params) => {
  const container = await AttributeContainer.findOne({
    where: { id: containerId, companyId }
  });
  if (!container) {
    throw new Error("ERR_CONTAINER_NOT_FOUND");
  }

  const definitions = await AttributeDefinition.findAll({
    where: { companyId, containerId },
    order: [
      ["sortOrder", "ASC"],
      ["id", "ASC"]
    ]
  });

  const permissions = await AttributeContainerProfilePermission.findAll({
    where: { companyId, containerId },
    order: [["profile", "ASC"]]
  });

  return { container, definitions, permissions };
};

export default GetAttributeContainerDetailService;
