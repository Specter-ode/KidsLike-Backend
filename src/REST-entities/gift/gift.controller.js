import mongoose from "mongoose";
import GiftModel from "./gift.model.js";
import ChildModel from "../child/child.model.js";
import UserModel from "../user/user.model.js";
import cloudinary from "../../helpers/cloudinary.js";

export const addGift = async (req, res) => {
  const parent = req.user;
  const childToUpdateId = parent.children.find(
    (childId) => childId.toString() === req.params.childId
  );
  if (!childToUpdateId) {
    return res.status(404).json({ message: "Child not found" });
  }

  if (req.fileValidationError) {
    return res.status(415).json({ message: req.fileValidationError });
  }

  const image = await cloudinary.uploader.upload(req.file.path);

  const gift = await GiftModel.create({
    ...req.body,
    imageUrl: image.secure_url,
    imageId: image.public_id,
    isPurchased: false,
    childId: childToUpdateId,
  });
  await ChildModel.findByIdAndUpdate(childToUpdateId, {
    $push: { gifts: gift },
  });
  return res.status(201).json({
    title: gift.title,
    price: gift.price,
    imageUrl: gift.imageUrl,
    childId: gift.childId,
    isPurchased: gift.isPurchased,
    _id: gift._id,
  });
};

export const editGift = async (req, res) => {
  const parent = req.user;
  const giftToEdit = await GiftModel.findById(req.params.giftId);
  if (!giftToEdit) {
    return res.status(404).json({ message: "Gift not found" });
  }
  const childToUpdate = parent.children.find(
    (childId) => childId.toString() === giftToEdit.childId.toString()
  );

  if (!childToUpdate) {
    return res.status(404).json({ message: "Child not found" });
  }
  if (!req.file && !req.body.title && !req.body.price) {
    return res
      .status(400)
      .json({ message: "At least fields must be required" });
  }
  if (req.fileValidationError) {
    return res.status(415).json({ message: req.fileValidationError });
  }

  if (giftToEdit.imageId) {
    await cloudinary.uploader.destroy(giftToEdit.imageId);
  }

  const image = await cloudinary.uploader.upload(req.file.path);
  const newGift = {
    ...giftToEdit.toObject(),
    ...req.body,
    imageUrl: image.secure_url,
    imageId: image.public_id,
  };
  await GiftModel.findByIdAndUpdate(req.params.giftId, newGift, {
    overwrite: true,
  });
  return res.status(200).json({
    title: newGift.title,
    price: Number(newGift.price),
    isPurchased: newGift.isPurchased,
    imageUrl: newGift.imageUrl,
    childId: newGift.childId,
    _id: newGift._id,
  });
};

export const deleteGift = async (req, res) => {
  const parent = req.user;
  const giftToDelete = await GiftModel.findById(req.params.giftId);
  if (!giftToDelete) {
    return res.status(404).json({ message: "Gift not found" });
  }
  const childToUpdate = parent.children.find(
    (childId) => childId.toString() === giftToDelete.childId.toString()
  );
  if (!childToUpdate) {
    return res.status(404).json({ message: "Child not found" });
  }
  const deletedGift = await GiftModel.findByIdAndDelete(req.params.giftId);
  if (deletedGift.imageId) {
    await cloudinary.uploader.destroy(deletedGift.imageId);
  }
  await ChildModel.findByIdAndUpdate(deletedGift.childId, {
    $pull: { gifts: mongoose.Types.ObjectId(deletedGift._id) },
  });
  return res.status(204).end();
};

export const buyGifts = async (req, res) => {
  const parent = req.user;
  const { giftIds } = req.body;
  const childToUpdateId = parent.children.find(
    (childId) => childId.toString() === req.params.childId
  );
  if (!childToUpdateId) {
    return res.status(404).json({ message: "Child not found" });
  }
  const childToUpdate = await ChildModel.findById(childToUpdateId);

  const gifts = await GiftModel.find({ _id: { $in: giftIds } });
  let totalExpenses = 0;
  gifts.forEach((gift) => (totalExpenses += gift.price));

  if (childToUpdate.balance < totalExpenses) {
    return res
      .status(409)
      .json({ message: "Not enough balance for gaining this gifts" });
  }
  const updatedGifts = gifts.map(async (gift) => {
    if (gift.isPurchased) {
      return res.status(409).json({
        message: `The gift ${gift._id} has already been purchased`,
      });
    } else {
      gift.isPurchased = true;
      return await gift.save();
    }
  });
  await Promise.all(updatedGifts);
  const updatedBalance = childToUpdate.balance - totalExpenses;
  return ChildModel.findByIdAndUpdate(
    { _id: childToUpdateId },
    { balance: updatedBalance },
    { new: true }
  )
    .populate([{ path: "gifts", model: GiftModel }])
    .exec((err, data) => {
      if (err) {
        next(err);
      }

      return res.status(200).json({
        childId: data._id,
        balance: data.balance,
        gifts: data.gifts,
      });
    });
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
          title: childGift.title,
          price: childGift.price,
          isPurchased: childGift.isPurchased,
          imageUrl: childGift.imageUrl,
          childId: childGift.childId,
          id: childGift._id,
        }));
      });
      return res.status(200).json(dataToSend);
    });
};
