import { Router } from "express";
import Joi from "joi";
import mongoose from "mongoose";
import validate from "../../middlewares/validate.js";
import { authenticate } from "../../middlewares/authenticate.js";
import tryCatchWrapper from "../../helpers/tryCatchWrapper.js";
import {
  addGift,
  editGift,
  deleteGift,
  buyGift,
  getGifts,
} from "./gift.controller.js";
import { upload } from "../../middlewares/multer.js";

const addGiftSchema = Joi.object({
  title: Joi.string().min(3).max(40).required(),
  price: Joi.number().required().min(1).max(10000),
});

const editGiftSchema = Joi.object({
  title: Joi.string().min(3).max(40),
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

router.get("/", authenticate, tryCatchWrapper(getGifts));
router.post(
  "/:childId",
  authenticate,
  upload.single("avatar"),
  validate(addGiftIdSchema, "params"),
  validate(addGiftSchema),
  tryCatchWrapper(addGift)
);
router
  .route("/:giftId")
  .patch(
    authenticate,
    upload.single("avatar"),
    validate(editOrDeleteGiftIdSchema, "params"),
    validate(editGiftSchema),
    tryCatchWrapper(editGift)
  )
  .delete(
    authenticate,
    validate(editOrDeleteGiftIdSchema, "params"),
    tryCatchWrapper(deleteGift)
  );
router.patch(
  "/buy/:giftId",
  authenticate,
  validate(editOrDeleteGiftIdSchema, "params"),
  tryCatchWrapper(buyGift)
);

export default router;
