import mongoose, { Schema } from "mongoose";
import { handleSaveErrors } from "../../helpers/handleSaveErrors.js";

const giftSchema = new Schema(
  {
    title: { type: String, required: true },
    price: {
      type: Number,
      required: true,
    },
    imageUrl: { type: String, required: true },
    imageId: String,
    isPurchased: { type: Boolean, default: false, required: true },
    childId: { type: mongoose.Types.ObjectId, required: true },
  },
  { versionKey: false }
);

giftSchema.post("save", handleSaveErrors);

export default mongoose.model("Gift", giftSchema);
