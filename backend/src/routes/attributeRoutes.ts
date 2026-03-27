import express from "express";
import isAuth from "../middleware/isAuth";
import isAdmin from "../middleware/isAdmin";
import * as AttributeController from "../controllers/AttributeController";

const attributeRoutes = express.Router();

attributeRoutes.get("/attribute-containers", isAuth, AttributeController.listContainers);
attributeRoutes.post("/attribute-containers", isAuth, isAdmin, AttributeController.createContainer);
attributeRoutes.get(
  "/attribute-containers/:containerId/detail",
  isAuth,
  isAdmin,
  AttributeController.getContainerDetail
);
attributeRoutes.put(
  "/attribute-containers/:containerId",
  isAuth,
  isAdmin,
  AttributeController.updateContainer
);
attributeRoutes.post("/attribute-definitions", isAuth, isAdmin, AttributeController.createDefinition);
attributeRoutes.delete(
  "/attribute-definitions/:definitionId",
  isAuth,
  isAdmin,
  AttributeController.deleteDefinition
);
attributeRoutes.put(
  "/attribute-containers/:containerId/permissions",
  isAuth,
  isAdmin,
  AttributeController.setPermissions
);
attributeRoutes.post(
  "/attribute-containers/:containerId/instances",
  isAuth,
  isAdmin,
  AttributeController.createInstance
);
attributeRoutes.post(
  "/attribute-group-instances/:groupInstanceId/copy",
  isAuth,
  AttributeController.copyInstance
);

attributeRoutes.get(
  "/entities/:entityType/:entityId/attributes/schema",
  isAuth,
  AttributeController.getSchema
);
attributeRoutes.put(
  "/entities/:entityType/:entityId/attributes",
  isAuth,
  AttributeController.putValues
);

attributeRoutes.get("/attribute-audit-logs", isAuth, AttributeController.listAuditLogs);

export default attributeRoutes;
