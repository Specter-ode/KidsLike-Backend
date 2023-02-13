import mongoose from "mongoose";
import GiftModel from "./gift.model.js";
import { uploadImage } from "../../helpers/multer-config.js";
import ChildModel from "../child/child.model.js";
import UserModel from "../user/user.model.js";

export const addGift = async (req, res) => {
  const parent = req.user;
  const childToUpdateId = parent.children.find(
    (childId) => childId.toString() === req.params.childId
  );
  if (!childToUpdateId) {
    return res.status(404).send({ message: "Child not found" });
  }
  const giftImage = req.file;
  if (req.fileValidationError) {
    return res.status(415).send({ message: req.fileValidationError });
  }
  const imageUrl = await uploadImage(giftImage);
  const gift = await GiftModel.create({
    ...req.body,
    imageUrl,
    isPurchased: false,
    childId: childToUpdateId,
  });
  await ChildModel.findByIdAndUpdate(childToUpdateId, {
    $push: { gifts: gift },
  });
  return res.status(201).send({
    name: gift.name,
    price: gift.price,
    isPurchased: gift.isPurchased,
    imageUrl: gift.imageUrl,
    childId: gift.childId,
    id: gift._id,
  });
};

export const editGift = async (req, res) => {
  const parent = req.user;
  const giftToEdit = await GiftModel.findById(req.params.giftId);
  if (!giftToEdit) {
    return res.status(404).send({ message: "Gift not found" });
  }
  const childToUpdate = parent.children.find(
    (childId) => childId.toString() === giftToEdit.childId.toString()
  );
  if (!childToUpdate) {
    return res.status(404).send({ message: "Child not found" });
  }
  if (!req.file && !req.body.name && !req.body.price) {
    return res.status(400).send({ message: "At least one field is required" });
  }
  let imageUrl = giftToEdit.imageUrl;
  const giftImage = req.file;
  if (req.fileValidationError) {
    return res.status(415).send({ message: req.fileValidationError });
  }
  if (giftImage) {
    imageUrl = await uploadImage(req.file);
  }
  const newGift = { ...giftToEdit.toObject(), ...req.body, imageUrl };
  await GiftModel.findByIdAndUpdate(req.params.giftId, newGift, {
    overwrite: true,
  });
  return res.status(200).send({
    name: newGift.name,
    price: newGift.price,
    isPurchased: newGift.isPurchased,
    imageUrl: newGift.imageUrl,
    childId: newGift.childId,
    id: newGift._id,
  });
};

export const deleteGift = async (req, res) => {
  const parent = req.user;
  const giftToDelete = await GiftModel.findById(req.params.giftId);
  if (!giftToDelete) {
    return res.status(404).send({ message: "Gift not found" });
  }
  const childToUpdate = parent.children.find(
    (childId) => childId.toString() === giftToDelete.childId.toString()
  );
  if (!childToUpdate) {
    return res.status(404).send({ message: "Child not found" });
  }
  const deletedGift = await GiftModel.findByIdAndDelete(req.params.giftId);
  await ChildModel.findByIdAndUpdate(deletedGift.childId, {
    $pull: { gifts: mongoose.Types.ObjectId(deletedGift._id) },
  });
  return res.status(204).end();
};

export const buyGift = async (req, res) => {
  const parent = req.user;
  const giftToBuy = await GiftModel.findById(req.params.giftId);
  if (!giftToBuy) {
    return res.status(404).send({ message: "Gift not found" });
  }
  const childToUpdateId = parent.children.find(
    (childId) => childId.toString() === giftToBuy.childId.toString()
  );
  if (!childToUpdateId) {
    return res.status(404).send({ message: "Child not found" });
  }
  const childToUpdate = await ChildModel.findById(childToUpdateId);
  if (giftToBuy.isPurchased) {
    return res
      .status(403)
      .send({ message: "This gift has already been purchased" });
  }
  if (childToUpdate.balance >= giftToBuy.price) {
    const updatedRewards = childToUpdate.balance - giftToBuy.price;
    const purchasedGift = await GiftModel.findByIdAndUpdate(
      giftToBuy._id,
      { $set: { isPurchased: true } },
      { new: true }
    );
    await ChildModel.findByIdAndUpdate(childToUpdateId, {
      $set: { balance: updatedRewards },
    });
    return res.status(200).send({
      updatedRewards,
      purchasedGift: {
        name: purchasedGift.name,
        price: purchasedGift.price,
        isPurchased: purchasedGift.isPurchased,
        imageUrl: purchasedGift.imageUrl,
        childId: purchasedGift.childId,
        id: purchasedGift._id,
      },
    });
  }
  return res
    .status(409)
    .send({ message: "Not enough balance for gaining this gift" });
};

export const getGifts = async (req, res, next) => {
  const parent = req.user;
  return UserModel.findOne(parent)
    .populate({
      path: "children",
      model: ChildModel,
      populate: [{ path: "gifts", model: GiftModel }],
    })
    .exec((err, data) => {
      if (err) {
        next(err);
      }
      const dataToEdit = data.children.map((child) => child.gifts);
      const dataToSend = dataToEdit.map((childArray) => {
        return childArray.map((childGift) => ({
          name: childGift.name,
          price: childGift.price,
          isPurchased: childGift.isPurchased,
          imageUrl: childGift.imageUrl,
          childId: childGift.childId,
          id: childGift._id,
        }));
      });
      return res.status(200).send(dataToSend);
    });
};

export const resetGift = async (req, res) => {
  const parent = req.user;
  const giftToReset = await GiftModel.findById(req.params.giftId);
  if (!giftToReset) {
    return res.status(404).send({ message: "Gift not found" });
  }
  const childToUpdateId = parent.children.find(
    (childId) => childId.toString() === giftToReset.childId.toString()
  );
  if (!childToUpdateId) {
    return res.status(404).send({ message: "Child not found" });
  }
  if (!giftToReset.isPurchased) {
    return res
      .status(403)
      .send({ message: "This gift has been already reset" });
  }
  giftToReset.isPurchased = false;
  // await giftToReset.save();
  res.status(200).send({
    name: giftToReset.name,
    price: giftToReset.price,
    isPurchased: giftToReset.isPurchased,
    imageUrl: giftToReset.imageUrl,
    childId: giftToReset.childId,
    id: giftToReset._id,
  });
};
