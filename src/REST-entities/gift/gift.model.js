import mongoose, { Schema } from "mongoose";
import { handleSaveErrors } from "../../helpers/handleSaveErrors.js";

const giftSchema = new Schema(
  {
    name: { type: String, unique: true },
    price: Number,
    imageUrl: String,
    isPurchased: Boolean,
    childId: mongoose.Types.ObjectId,
  },
  { versionKey: false }
);

giftSchema.post("save", handleSaveErrors);

export default mongoose.model("Gift", giftSchema);
