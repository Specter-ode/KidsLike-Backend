import mongoose, { Schema } from "mongoose";
import { handleSaveErrors } from "../../helpers/handleSaveErrors.js";

const taskSchema = new Schema(
  {
    title: { type: String, required: true },
    reward: { type: Number, required: true },
    childId: mongoose.Types.ObjectId,
    imageUrl: String,
    days: {
      type: [{ date: String, isActive: Boolean, isCompleted: Boolean }],
      length: 7,
    },
  },
  { versionKey: false }
);

// taskSchema.post("save", handleSaveErrors);

export default mongoose.model("Task", taskSchema);
