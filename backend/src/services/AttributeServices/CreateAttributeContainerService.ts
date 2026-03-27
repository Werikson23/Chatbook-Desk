import AttributeContainer from "../../models/AttributeContainer";

interface Params {
  companyId: number;
  name: string;
  key: string;
  entityType: string;
  category?: string;
  icon?: string;
  color?: string;
  uiLayout?: string;
  isRepeatable?: boolean;
  isCollapsible?: boolean;
  sortOrder?: number;
}

const CreateAttributeContainerService = async (p: Params) => {
  return AttributeContainer.create({
    companyId: p.companyId,
    name: p.name,
    key: p.key,
    entityType: p.entityType,
    category: p.category || null,
    icon: p.icon || null,
    color: p.color || null,
    uiLayout: p.uiLayout || "tabs",
    isRepeatable: Boolean(p.isRepeatable),
    isCollapsible: p.isCollapsible !== false,
    sortOrder: p.sortOrder ?? 0
  });
};

export default CreateAttributeContainerService;
