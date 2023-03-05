import { Router } from "express";
import validate from "../../middlewares/validate.js";
import { authenticate } from "../../middlewares/authenticate.js";
import tryCatchWrapper from "../../helpers/tryCatchWrapper.js";
import * as ctrl from "./task.controller.js";
import * as taskJoiSchemas from "./task.schemas.js";
import { upload } from "../../middlewares/multer.js";

const router = Router();

router.post(
  "/:childId",
  authenticate,
  upload.single("avatar"),
  validate(taskJoiSchemas.addOrGetTaskSchema, "params"),
  validate(taskJoiSchemas.addTaskSchema),
  tryCatchWrapper(ctrl.addTask)
);
router
  .route("/:taskId/active")
  .patch(
    authenticate,
    validate(taskJoiSchemas.editOrDeleteTaskSchema, "params"),
    validate(taskJoiSchemas.updateTaskActiveStatusSchema),
    tryCatchWrapper(ctrl.updateTaskActiveStatus)
  );

router.patch(
  "/:taskId/completed",
  authenticate,
  validate(taskJoiSchemas.editOrDeleteTaskSchema, "params"),
  tryCatchWrapper(ctrl.updateTaskCompletedStatus)
);

router
  .route("/:taskId")
  .put(
    authenticate,
    upload.single("avatar"),
    validate(taskJoiSchemas.editOrDeleteTaskSchema, "params"),
    validate(taskJoiSchemas.addTaskSchema),
    tryCatchWrapper(ctrl.editTask)
  )
  .delete(
    authenticate,
    validate(taskJoiSchemas.editOrDeleteTaskSchema, "params"),
    tryCatchWrapper(ctrl.deleteTask)
  );

export default router;
