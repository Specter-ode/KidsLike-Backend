import Joi from "joi";
import mongoose from "mongoose";

export const addGiftSchema = Joi.object({
  title: Joi.string().min(3).max(40).required(),
  price: Joi.number().required().min(1).max(10000),
});

export const editGiftSchema = Joi.object({
  title: Joi.string().min(3).max(40),
  price: Joi.number().min(1).max(10000),
});

export const buyGiftsSchema = Joi.object({
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

export const addOrBuyParamsSchema = Joi.object({
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

export const editOrDeleteParamsSchema = Joi.object({
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
