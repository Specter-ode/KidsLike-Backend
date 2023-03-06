import { Router } from "express";
import Joi from "joi";
import mongoose from "mongoose";
import tryCatchWrapper from "../helpers/tryCatchWrapper.js";
import {
  register,
  login,
  googleAuth,
  facebookAuth,
  refreshTokens,
  logout,
} from "./auth.controller.js";
import authSocial from "../middlewares/authSocial.js";
import validate from "../middlewares/validate.js";
import { authenticate } from "../middlewares/authenticate.js";

const signUpSchema = Joi.object({
  email: Joi.string().min(3).max(100).required(),
  password: Joi.string().min(8).max(100).required(),
  username: Joi.string().min(3).max(40).required(),
});

const signInSchema = Joi.object({
  email: Joi.string().min(3).max(100).required(),
  password: Joi.string().min(8).max(40).required(),
});

const refreshTokensSchema = Joi.object({
  sid: Joi.string()
    .custom((value, helpers) => {
      const isValidObjectId = mongoose.Types.ObjectId.isValid(value);
      if (!isValidObjectId) {
        return helpers.message({
          custom: "Invalid 'sid'. Must be a MongoDB ObjectId",
        });
      }
      return value;
    })
    .required(),
});

const router = Router();

router.post("/register", validate(signUpSchema), tryCatchWrapper(register));
router.post("/login", validate(signInSchema), tryCatchWrapper(login));
router.post("/logout", authenticate, tryCatchWrapper(logout));
router.post(
  "/refresh",
  validate(refreshTokensSchema),
  tryCatchWrapper(refreshTokens)
);

router.get(
  "/google",
  authSocial.authenticate("google", { scope: ["email", "profile"] })
);

router.get(
  "/google/callback",
  authSocial.authenticate("google", { session: false }),
  tryCatchWrapper(googleAuth)
);

router.get(
  "/facebook",
  authSocial.authenticate("facebook", { scope: ["email", "public_profile"] })
);
router.get(
  "/facebook/callback",
  authSocial.authenticate("facebook", { session: false }),
  tryCatchWrapper(facebookAuth)
);

export default router;
