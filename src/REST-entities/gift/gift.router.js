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
  buyGifts,
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

const buyGiftsSchema = Joi.object({
  giftIds: Joi.array().items(
    Joi.string().custom((value, helpers) => {
      const isValidObjectId = mongoose.Types.ObjectId.isValid(value);
      if (!isValidObjectId) {
        return helpers.message({
          custom: "Invalid 'GiftId'. Must be a MongoDB ObjectId",
        });
      }
      return value;
    })
  ),
});

const addOrBuyGiftIdSchema = Joi.object({
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
  validate(addOrBuyGiftIdSchema, "params"),
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
  "/buy/:childId",
  authenticate,
  validate(addOrBuyGiftIdSchema, "params"),
  validate(buyGiftsSchema),
  tryCatchWrapper(buyGifts)
);

export default router;
