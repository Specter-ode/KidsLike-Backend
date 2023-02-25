// task.model.js
import mongoose, { Schema } from "mongoose";
import { handleSaveErrors } from "../../helpers/handleSaveErrors.js";

const taskSchema = new Schema(
  {
    title: { type: String, required: true },
    reward: { type: Number, required: true },
    childId: { type: mongoose.Types.ObjectId, required: true },
    imageUrl: { type: String, required: true },
    imageId: String,
    days: {
      type: [{ date: String, isActive: Boolean, isCompleted: Boolean }],
      length: 7,
      required: true,
    },
  },
  { versionKey: false }
);

taskSchema.post("save", handleSaveErrors);

export default mongoose.model("Task", taskSchema);
