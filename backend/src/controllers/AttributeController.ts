import { Request, Response } from "express";
import AppError from "../errors/AppError";
import AttributeContainer from "../models/AttributeContainer";
import GetEntityAttributeSchemaService from "../services/AttributeServices/GetEntityAttributeSchemaService";
import UpsertAttributeValuesService from "../services/AttributeServices/UpsertAttributeValuesService";
import CreateGroupInstanceService from "../services/AttributeServices/CreateGroupInstanceService";
import CopyGroupInstanceService from "../services/AttributeServices/CopyGroupInstanceService";
import CreateAttributeContainerService from "../services/AttributeServices/CreateAttributeContainerService";
import CreateAttributeDefinitionService from "../services/AttributeServices/CreateAttributeDefinitionService";
import UpsertContainerPermissionService from "../services/AttributeServices/UpsertContainerPermissionService";
import ListAttributeAuditLogsService from "../services/AttributeServices/ListAttributeAuditLogsService";
import GetAttributeContainerDetailService from "../services/AttributeServices/GetAttributeContainerDetailService";
import UpdateAttributeContainerService from "../services/AttributeServices/UpdateAttributeContainerService";
import DeleteAttributeDefinitionService from "../services/AttributeServices/DeleteAttributeDefinitionService";

const mapErr = (e: unknown): never => {
  const msg = e instanceof Error ? e.message : String(e);
  const map: Record<string, string> = {
    ERR_INVALID_ATTRIBUTE_DEFINITION: "Definição de atributo inválida",
    ERR_INVALID_CONTAINER: "Conjunto inválido",
    ERR_NO_PERMISSION_EDIT_ATTRIBUTES: "Sem permissão para editar atributos",
    ERR_INVALID_GROUP_INSTANCE: "Instância do conjunto inválida",
    ERR_GROUP_REQUIRED: "Instância do conjunto obrigatória para este container",
    ERR_GROUP_NOT_FOUND: "Instância não encontrada",
    ERR_CONTAINER_NOT_REPEATABLE:
      "Este conjunto não permite múltiplas instâncias",
    ERR_NO_PERMISSION_COPY: "Sem permissão para copiar",
    ERR_CONTAINER_NOT_FOUND: "Conjunto não encontrado",
    ERR_DEFINITION_NOT_FOUND: "Campo não encontrado",
    ERR_DUPLICATE_CONTAINER_KEY:
      "Já existe um conjunto com esta chave para este tipo de entidade"
  };
  const friendly = map[msg] || msg;
  throw new AppError(friendly, 400);
};

export const listContainers = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { entityType } = req.query as { entityType?: string };
  const companyId = req.user.companyId;

  const rows = await AttributeContainer.findAll({
    where: {
      companyId,
      ...(entityType ? { entityType } : {})
    },
    order: [["sortOrder", "ASC"]]
  });

  return res.json(rows);
};

export const createContainer = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const companyId = req.user.companyId;
  const row = await CreateAttributeContainerService({
    companyId,
    ...req.body
  });
  return res.status(201).json(row);
};

export const getContainerDetail = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const containerId = Number(req.params.containerId);
    const data = await GetAttributeContainerDetailService({
      companyId: req.user.companyId,
      containerId
    });
    return res.json(data);
  } catch (e) {
    mapErr(e);
  }
};

export const updateContainer = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const containerId = Number(req.params.containerId);
    const row = await UpdateAttributeContainerService({
      companyId: req.user.companyId,
      containerId,
      ...req.body
    });
    return res.json(row);
  } catch (e) {
    mapErr(e);
  }
};

export const deleteDefinition = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const definitionId = Number(req.params.definitionId);
    await DeleteAttributeDefinitionService({
      companyId: req.user.companyId,
      definitionId
    });
    return res.json({ ok: true });
  } catch (e) {
    mapErr(e);
  }
};

export const createDefinition = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const row = await CreateAttributeDefinitionService({
      companyId: req.user.companyId,
      ...req.body
    });
    return res.status(201).json(row);
  } catch (e) {
    mapErr(e);
  }
};

export const setPermissions = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const containerId = Number(req.params.containerId);
    await UpsertContainerPermissionService(
      req.user.companyId,
      containerId,
      req.body.rows || []
    );
    return res.json({ ok: true });
  } catch (e) {
    mapErr(e);
  }
};

export const createInstance = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const containerId = Number(req.params.containerId);
    const { entityType, entityId, label, sortOrder } = req.body;
    const inst = await CreateGroupInstanceService({
      companyId: req.user.companyId,
      containerId,
      entityType,
      entityId: Number(entityId),
      label,
      sortOrder
    });
    return res.status(201).json(inst);
  } catch (e) {
    mapErr(e);
  }
};

export const copyInstance = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const groupInstanceId = Number(req.params.groupInstanceId);
    const { newLabel } = req.body || {};
    const inst = await CopyGroupInstanceService({
      companyId: req.user.companyId,
      groupInstanceId,
      profile: req.user.profile,
      isSuper: Boolean(req.user.isSuper),
      newLabel
    });
    return res.status(201).json(inst);
  } catch (e) {
    mapErr(e);
  }
};

export const getSchema = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const entityType = req.params.entityType as "contact" | "ticket";
  const entityId = Number(req.params.entityId);
  const data = await GetEntityAttributeSchemaService({
    companyId: req.user.companyId,
    entityType,
    entityId,
    profile: req.user.profile,
    isSuper: Boolean(req.user.isSuper)
  });
  return res.json(data);
};

export const putValues = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    await UpsertAttributeValuesService({
      companyId: req.user.companyId,
      entityType: req.params.entityType as "contact" | "ticket",
      entityId: Number(req.params.entityId),
      profile: req.user.profile,
      isSuper: Boolean(req.user.isSuper),
      values: req.body.values || [],
      actorId: Number(req.user.id),
      ipAddress:
        (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress,
      userAgent: req.headers["user-agent"],
      source: "frontend_autosave"
    });
    return res.json({ ok: true });
  } catch (e) {
    mapErr(e);
  }
};

export const listAuditLogs = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { entityType, entityId, action, dateFrom, dateTo, pageNumber } =
    req.query as Record<string, string>;
  const data = await ListAttributeAuditLogsService({
    companyId: req.user.companyId,
    entityType,
    entityId: entityId ? Number(entityId) : undefined,
    action,
    dateFrom,
    dateTo,
    pageNumber
  });
  return res.json(data);
};
