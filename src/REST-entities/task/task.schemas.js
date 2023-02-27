import Joi from "joi";
import mongoose from "mongoose";

export const addTaskSchema = Joi.object({
  title: Joi.string().min(2).max(40).required(),
  reward: Joi.number().required().min(1).max(10000),
});

export const updateTaskActiveStatusSchema = Joi.object({
  days: Joi.array()
    .items(
      Joi.object({
        date: Joi.string().required(),
        isActive: Joi.boolean().required(),
        isCompleted: Joi.boolean().required(),
      })
    )
    .length(7)
    .required(),
});

export const addOrGetTaskSchema = Joi.object({
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

export const editOrDeleteTaskSchema = Joi.object({
  taskId: Joi.string()
    .custom((value, helpers) => {
      const isValidObjectId = mongoose.Types.ObjectId.isValid(value);
      if (!isValidObjectId) {
        return helpers.message({
          custom: "Invalid 'taskId'. Must be a MongoDB ObjectId",
        });
      }
      return value;
    })
    .required(),
});
