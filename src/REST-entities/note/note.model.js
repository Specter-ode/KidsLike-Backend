import mongoose, { Schema } from "mongoose";
import { handleSaveErrors } from "../../helpers/handleSaveErrors.js";

export const MAX_NOTE_LENGTH = 2000;
export const MAX_NOTES_PER_PARENT = 20;

const noteSchema = new Schema(
  {
    text: {
      type: String,
      required: [true, "Note text is required"],
      maxlength: MAX_NOTE_LENGTH,
    },
    date: { type: Date, default: Date.now, required: true },
    childId: { type: mongoose.Types.ObjectId, ref: "Child", required: true },
    parentId: { type: mongoose.Types.ObjectId, required: true, index: true },
  },
  { versionKey: false }
);

noteSchema.post("save", handleSaveErrors);

export default mongoose.model("Note", noteSchema);
