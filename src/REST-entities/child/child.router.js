import { Router } from "express";
import validate from "../../middlewares/validate.js";
import { authenticate } from "../../middlewares/authenticate.js";
import * as ctrl from "./child.controller.js";
import * as childJoiSchemas from "./child.schemas.js";
import tryCatchWrapper from "../../helpers/tryCatchWrapper.js";

const router = Router();

router.post(
  "/",
  authenticate,
  validate(childJoiSchemas.addChildSchema),
  tryCatchWrapper(ctrl.addChild)
);

export default router;
