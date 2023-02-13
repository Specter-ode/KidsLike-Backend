import mongoose, { Schema } from "mongoose";
import { handleSaveErrors } from "../../helpers/handleSaveErrors.js";

const userSchema = new Schema(
  {
    email: String,
    passwordHash: String,
    username: String,
    startWeekDate: String,
    endWeekDate: String,
    children: [{ type: mongoose.Types.ObjectId, ref: "Child" }],
    originUrl: String,
  },
  { versionKey: false }
);

userSchema.post("save", handleSaveErrors);

export default mongoose.model("User", userSchema);
