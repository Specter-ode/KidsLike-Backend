import { Router } from "express";
import Joi from "joi";
import mongoose from "mongoose";
import validate from "../../helpers/validate.js";
import { authorize } from "../../auth/auth.controller.js";
import {
  addTask,
  deleteTask,
  updateTaskActiveStatus,
  updateTaskCompletedStatus,
} from "./task.controller.js";
import tryCatchWrapper from "../../helpers/try-catch-wrapper.js";

const addTaskSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  reward: Joi.number().required().min(1).max(10000),
});

// const updateTaskSchema = Joi.object({
//   date: Joi.date(),
//   isCompleted: Joi.bool(),
//   isActive: Joi.bool(),
// });

const updateTaskActiveStatusSchema = Joi.object({
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

const addOrGetTaskIdSchema = Joi.object({
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

const editOrDeleteTaskIdSchema = Joi.object({
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

const router = Router();

router.post(
  "/:childId",
  tryCatchWrapper(authorize),
  validate(addOrGetTaskIdSchema, "params"),
  validate(addTaskSchema),
  tryCatchWrapper(addTask)
);
router
  .route("/:taskId/active")
  .patch(
    tryCatchWrapper(authorize),
    validate(editOrDeleteTaskIdSchema, "params"),
    validate(updateTaskActiveStatusSchema),
    tryCatchWrapper(updateTaskActiveStatus)
  );

router.patch(
  "/:taskId/completed",
  tryCatchWrapper(authorize),
  validate(editOrDeleteTaskIdSchema, "params"),
  tryCatchWrapper(updateTaskCompletedStatus)
);
router
  .route("/:taskId/")
  .delete(
    tryCatchWrapper(authorize),
    validate(editOrDeleteTaskIdSchema, "params"),
    tryCatchWrapper(deleteTask)
  );

export default router;
