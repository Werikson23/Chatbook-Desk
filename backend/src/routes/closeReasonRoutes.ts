import { Router } from "express";
import isAuth from "../middleware/isAuth";
import isCompliant from "../middleware/isCompliant";
import * as CloseReasonController from "../controllers/CloseReasonController";

const closeReasonRoutes = Router();

closeReasonRoutes.get(
  "/close-reasons",
  isAuth,
  isCompliant,
  CloseReasonController.index
);

closeReasonRoutes.post(
  "/close-reasons",
  isAuth,
  isCompliant,
  CloseReasonController.store
);

closeReasonRoutes.put(
  "/close-reasons/:id",
  isAuth,
  isCompliant,
  CloseReasonController.update
);

closeReasonRoutes.delete(
  "/close-reasons/:id",
  isAuth,
  isCompliant,
  CloseReasonController.remove
);

export default closeReasonRoutes;
