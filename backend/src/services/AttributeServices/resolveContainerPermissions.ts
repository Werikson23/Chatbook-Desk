import AttributeContainerProfilePermission from "../../models/AttributeContainerProfilePermission";

export type ContainerPermission = {
  canView: boolean;
  canEdit: boolean;
  canCopy: boolean;
};

const resolveContainerPermissions = async (
  companyId: number,
  containerId: number,
  profile: string,
  isSuper: boolean
): Promise<ContainerPermission> => {
  if (isSuper || profile === "admin" || profile === "supervisor") {
    return { canView: true, canEdit: true, canCopy: true };
  }

  const row = await AttributeContainerProfilePermission.findOne({
    where: { companyId, containerId, profile }
  });

  if (!row) {
    return { canView: true, canEdit: false, canCopy: false };
  }

  return {
    canView: row.canView,
    canEdit: row.canEdit,
    canCopy: row.canCopy
  };
};

export default resolveContainerPermissions;
