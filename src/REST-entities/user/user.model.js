import mongoose, { Schema } from "mongoose";
import { handleSaveErrors } from "../../helpers/handleSaveErrors.js";

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: [true, "Name is required"],
    },
    passwordHash: {
      type: String,
      required: [true, "Password is required"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
    },
    accessToken: {
      type: String,
      default: "",
    },
    refreshToken: {
      type: String,
      default: "",
    },
    startWeekDate: {
      type: String,
      default: "",
    },
    endWeekDate: {
      type: String,
      default: "",
    },
    children: [{ type: mongoose.Types.ObjectId, ref: "Child" }],
    originUrl: String,
  },
  { versionKey: false }
);

// userSchema.post("save", handleSaveErrors);

export default mongoose.model("User", userSchema);
