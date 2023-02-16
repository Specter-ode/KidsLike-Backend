import mongoose, { Schema } from "mongoose";
import { handleSaveErrors } from "../../helpers/handleSaveErrors.js";

const childSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Child name is required"],
    },
    gender: {
      type: String,
      enum: ["male", "female"],
      required: [true, "Gender must be 'male' or 'female'"],
    },
    balance: {
      type: Number,
      required: true,
    },
    rewardsGained: {
      type: Number,
      required: true,
    },
    rewardsPlanned: {
      type: Number,
      required: true,
    },
    tasks: [{ type: mongoose.Types.ObjectId, ref: "Task" }],
    gifts: [{ type: mongoose.Types.ObjectId, ref: "Gift" }],
    parentId: mongoose.Types.ObjectId,
  },
  { versionKey: false }
);

// childSchema.post("save", handleSaveErrors);

export default mongoose.model("Child", childSchema);
