import Joi from "joi";
import mongoose from "mongoose";
import { MAX_NOTE_LENGTH } from "./note.model.js";

const objectId = (name) =>
  Joi.string()
    .custom((value, helpers) => {
      const isValidObjectId = mongoose.Types.ObjectId.isValid(value);
      if (!isValidObjectId) {
        return helpers.message({
          custom: `Invalid '${name}'. Must be a MongoDB ObjectId`,
        });
      }
      return value;
    })
    .required();

export const addNoteSchema = Joi.object({
  childId: objectId("childId"),
  text: Joi.string().trim().min(1).max(MAX_NOTE_LENGTH).required(),
});

export const deleteNoteParamsSchema = Joi.object({
  noteId: objectId("noteId"),
});
