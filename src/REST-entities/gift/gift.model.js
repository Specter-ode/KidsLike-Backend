import mongoose, { Schema } from "mongoose";
import { handleSaveErrors } from "../../helpers/handleSaveErrors.js";

const giftSchema = new Schema(
  {
    title: { type: String, required: true },
    price: {
      type: Number,
      required: true,
    },
    imageUrl: String,
    isPurchased: Boolean,
    childId: mongoose.Types.ObjectId,
  },
  { versionKey: false }
);

// giftSchema.post("save", handleSaveErrors);

export default mongoose.model("Gift", giftSchema);
