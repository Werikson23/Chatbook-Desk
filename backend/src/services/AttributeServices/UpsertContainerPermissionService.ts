import AttributeContainer from "../../models/AttributeContainer";
import AttributeContainerProfilePermission from "../../models/AttributeContainerProfilePermission";

interface Row {
  profile: string;
  canView: boolean;
  canEdit: boolean;
  canCopy: boolean;
}

const UpsertContainerPermissionService = async (
  companyId: number,
  containerId: number,
  rows: Row[]
) => {
  const c = await AttributeContainer.findOne({
    where: { id: containerId, companyId }
  });
  if (!c) {
    throw new Error("ERR_CONTAINER_NOT_FOUND");
  }

  await AttributeContainerProfilePermission.destroy({
    where: { companyId, containerId }
  });

  for (const r of rows) {
    await AttributeContainerProfilePermission.create({
      companyId,
      containerId,
      profile: r.profile,
      canView: r.canView,
      canEdit: r.canEdit,
      canCopy: r.canCopy
    });
  }

  return { ok: true };
};

export default UpsertContainerPermissionService;
