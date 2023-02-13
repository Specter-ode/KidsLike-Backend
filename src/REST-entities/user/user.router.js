import { Router } from "express";
import Joi from "joi";
import validate from "../../helpers/validate.js";
import { authorize } from "../../auth/auth.controller.js";
import tryCatchWrapper from "../../helpers/try-catch-wrapper.js";
import { getAllInfo, clearAllInfo } from "./user.controller.js";

const clearAllInfoSchema = Joi.object({
  email: Joi.string().required(),
  password: Joi.string().required(),
});

const router = Router();

router
  .route("/")
  .get(tryCatchWrapper(authorize), tryCatchWrapper(getAllInfo))
  .delete(validate(clearAllInfoSchema), tryCatchWrapper(clearAllInfo));

export default router;
