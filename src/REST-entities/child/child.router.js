import { Router } from "express";
import Joi from "joi";
import validate from "../../middlewares/validate.js";
import { authenticate } from "../../middlewares/authenticate.js";
import { addChild } from "./child.controller.js";
import tryCatchWrapper from "../../helpers/tryCatchWrapper.js";

const addChildSchema = Joi.object({
  name: Joi.string().required(),
  gender: Joi.string().valid("male", "female").required(),
});

const router = Router();

router.post(
  "/",
  authenticate,
  validate(addChildSchema),
  tryCatchWrapper(addChild)
);

export default router;
