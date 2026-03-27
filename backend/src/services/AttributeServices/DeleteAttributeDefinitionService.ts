import AttributeDefinition from "../../models/AttributeDefinition";

interface Params {
  companyId: number;
  definitionId: number;
}

const DeleteAttributeDefinitionService = async ({
  companyId,
  definitionId
}: Params) => {
  const row = await AttributeDefinition.findOne({
    where: { id: definitionId, companyId }
  });
  if (!row) {
    throw new Error("ERR_DEFINITION_NOT_FOUND");
  }
  await row.destroy();
  return { ok: true };
};

export default DeleteAttributeDefinitionService;
