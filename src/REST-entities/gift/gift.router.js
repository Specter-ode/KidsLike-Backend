import { Router } from "express";
import Joi from "joi";
import mongoose from "mongoose";
import validate from "../../helpers/validate.js";
import { authorize } from "../../auth/auth.controller.js";
import tryCatchWrapper from "../../helpers/try-catch-wrapper.js";
import {
  addGift,
  editGift,
  deleteGift,
  buyGift,
  getGifts,
  resetGift,
} from "./gift.controller.js";
import { multerMid } from "../../helpers/multer-config.js";

const addGiftSchema = Joi.object({
  name: Joi.string().min(3).max(20).required(),
  price: Joi.number().required().min(1).max(10000),
});

const editGiftSchema = Joi.object({
  name: Joi.string().min(3).max(20),
  price: Joi.number().min(1).max(10000),
});

const addGiftIdSchema = Joi.object({
  childId: Joi.string()
    .custom((value, helpers) => {
      const isValidObjectId = mongoose.Types.ObjectId.isValid(value);
      if (!isValidObjectId) {
        return helpers.message({
          custom: "Invalid 'childId'. Must be a MongoDB ObjectId",
        });
      }
      return value;
    })
    .required(),
});

const editOrDeleteGiftIdSchema = Joi.object({
  giftId: Joi.string()
    .custom((value, helpers) => {
      const isValidObjectId = mongoose.Types.ObjectId.isValid(value);
      if (!isValidObjectId) {
        return helpers.message({
          custom: "Invalid 'giftId'. Must be a MongoDB ObjectId",
        });
      }
      return value;
    })
    .required(),
});

const router = Router();

router.get("/", authorize, tryCatchWrapper(getGifts));
router.post(
  "/:childId",
  tryCatchWrapper(authorize),
  multerMid.single("file"),
  validate(addGiftIdSchema, "params"),
  validate(addGiftSchema),
  tryCatchWrapper(addGift)
);
router
  .route("/:giftId")
  .patch(
    tryCatchWrapper(authorize),
    multerMid.single("file"),
    validate(editOrDeleteGiftIdSchema, "params"),
    validate(editGiftSchema),
    tryCatchWrapper(editGift)
  )
  .delete(
    tryCatchWrapper(authorize),
    validate(editOrDeleteGiftIdSchema, "params"),
    tryCatchWrapper(deleteGift)
  );
router.patch(
  "/buy/:giftId",
  tryCatchWrapper(authorize),
  validate(editOrDeleteGiftIdSchema, "params"),
  tryCatchWrapper(buyGift)
);
router.patch(
  "/reset/:giftId",
  tryCatchWrapper(authorize),
  validate(editOrDeleteGiftIdSchema, "params"),
  tryCatchWrapper(resetGift)
);

export default router;
