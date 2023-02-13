import mongoose, { Schema } from "mongoose";
import { handleSaveErrors } from "../../helpers/handleSaveErrors.js";

const childSchema = new Schema(
  {
    name: String,
    gender: String,
    balance: Number,
    rewardsGained: Number,
    rewardsPlanned: Number,
    tasks: [{ type: mongoose.Types.ObjectId, ref: "Task" }],
    gifts: [{ type: mongoose.Types.ObjectId, ref: "Gift" }],
  },
  { versionKey: false }
);

childSchema.post("save", handleSaveErrors);

export default mongoose.model("Child", childSchema);
