import { Router } from "express";
import isAuth from "../middleware/isAuth";
import isCompliant from "../middleware/isCompliant";
import * as FarewellTemplateController from "../controllers/FarewellTemplateController";

const farewellTemplateRoutes = Router();

farewellTemplateRoutes.get(
  "/farewell-templates",
  isAuth,
  isCompliant,
  FarewellTemplateController.index
);

farewellTemplateRoutes.post(
  "/farewell-templates",
  isAuth,
  isCompliant,
  FarewellTemplateController.store
);

farewellTemplateRoutes.put(
  "/farewell-templates/:id",
  isAuth,
  isCompliant,
  FarewellTemplateController.update
);

farewellTemplateRoutes.delete(
  "/farewell-templates/:id",
  isAuth,
  isCompliant,
  FarewellTemplateController.remove
);

export default farewellTemplateRoutes;
