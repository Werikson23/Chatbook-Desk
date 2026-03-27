import AttributeContainer from "../../models/AttributeContainer";
import AttributeDefinition from "../../models/AttributeDefinition";

interface Params {
  companyId: number;
  containerId: number;
  name: string;
  key: string;
  dataType: string;
  isRequired?: boolean;
  isSearchable?: boolean;
  isRepeatable?: boolean;
  validationRules?: object;
  options?: object;
  defaultValue?: object;
  visibility?: string;
  sortOrder?: number;
}

const CreateAttributeDefinitionService = async (p: Params) => {
  const c = await AttributeContainer.findOne({
    where: { id: p.containerId, companyId: p.companyId }
  });
  if (!c) {
    throw new Error("ERR_CONTAINER_NOT_FOUND");
  }

  return AttributeDefinition.create({
    companyId: p.companyId,
    containerId: p.containerId,
    name: p.name,
    key: p.key,
    dataType: p.dataType,
    version: 1,
    isActive: true,
    isRequired: Boolean(p.isRequired),
    isSearchable: Boolean(p.isSearchable),
    isRepeatable: Boolean(p.isRepeatable),
    validationRules: p.validationRules || null,
    options: p.options || null,
    defaultValue: p.defaultValue || null,
    visibility: p.visibility || "all",
    sortOrder: p.sortOrder ?? 0
  });
};

export default CreateAttributeDefinitionService;
