import { Router } from "express";
import Joi from "joi";
import validate from "../../middlewares/validate.js";
import { authenticate } from "../../middlewares/authenticate.js";
import tryCatchWrapper from "../../helpers/tryCatchWrapper.js";
import * as ctrl from "./user.controller.js";

const clearAllInfoSchema = Joi.object({
  email: Joi.string().required(),
  password: Joi.string().required(),
});

const router = Router();

router
  .route("/")
  .get(authenticate, tryCatchWrapper(ctrl.getAllInfo))
  .delete(validate(clearAllInfoSchema), tryCatchWrapper(ctrl.clearAllInfo));

export default router;
