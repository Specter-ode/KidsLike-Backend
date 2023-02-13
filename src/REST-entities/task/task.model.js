import mongoose, { Schema } from "mongoose";
import { handleSaveErrors } from "../../helpers/handleSaveErrors.js";

const taskSchema = new Schema(
  {
    name: { type: String, unique: true },
    reward: Number,
    childId: mongoose.Types.ObjectId,
    imageUrl: String,
    days: [{ date: String, isActive: Boolean, isCompleted: Boolean }],
  },
  { versionKey: false }
);

taskSchema.post("save", handleSaveErrors);

export default mongoose.model("Task", taskSchema);
