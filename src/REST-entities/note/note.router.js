import { Router } from "express";
import validate from "../../middlewares/validate.js";
import { authenticate } from "../../middlewares/authenticate.js";
import tryCatchWrapper from "../../helpers/tryCatchWrapper.js";
import * as ctrl from "./note.controller.js";
import * as noteJoiSchemas from "./note.schemas.js";

const router = Router();

router
  .route("/")
  .get(authenticate, tryCatchWrapper(ctrl.getNotes))
  .post(
    authenticate,
    validate(noteJoiSchemas.addNoteSchema),
    tryCatchWrapper(ctrl.addNote)
  )
  .delete(authenticate, tryCatchWrapper(ctrl.deleteAllNotes));
router.delete(
  "/:noteId",
  authenticate,
  validate(noteJoiSchemas.deleteNoteParamsSchema, "params"),
  tryCatchWrapper(ctrl.deleteNote)
);

export default router;
