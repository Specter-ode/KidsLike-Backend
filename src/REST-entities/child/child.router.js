import { Router } from "express";
import Joi from "joi";
import validate from "../../helpers/validate.js";
import { authorize } from "../../auth/auth.controller.js";
import { addChild } from "./child.controller.js";
import tryCatchWrapper from "../../helpers/try-catch-wrapper.js";

const addChildSchema = Joi.object({
  name: Joi.string().required(),
  gender: Joi.string().valid("male", "female").required(),
});

const router = Router();

router.post(
  "/",
  tryCatchWrapper(authorize),
  validate(addChildSchema),
  tryCatchWrapper(addChild)
);

export default router;
