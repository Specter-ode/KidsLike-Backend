import bcrypt from "bcryptjs";
import UserModel from "./user.model.js";
import ChildModel from "../child/child.model.js";
import TaskModel from "../task/task.model.js";
import GiftModel from "../gift/gift.model.js";
import { checkWeek, weekPeriod } from "../../helpers/week.js";

export const getAllInfo = async (req, res, next) => {
  console.log("req.user: ", req.user);

  const email = req.user.email;
  await checkWeek(req.user._id);

  const { startWeekDate, endWeekDate } = weekPeriod();
  return UserModel.findOne({ email })
    .populate({
      path: "children",
      model: ChildModel,
      populate: [
        { path: "tasks", model: TaskModel },
        { path: "gifts", model: GiftModel },
      ],
    })
    .exec((err, data) => {
      if (err) {
        next(err);
      }
      return res.status(200).json({
        email: data.email,
        username: data.username,
        id: data._id,
        startWeekDate,
        endWeekDate,
        children: data.children,
      });
    });
};

export const clearAllInfo = async (req, res, next) => {
  const { email, password } = req.body;
  const user = await UserModel.findOne({ email });
  if (!user) {
    return res
      .status(403)
      .json({ message: `User with ${email} email doesn't exist` });
  }
  const isPasswordCorrect = await bcrypt.compare(password, user.passwordHash);
  if (!isPasswordCorrect) {
    return res.status(403).json({ message: "Password is wrong" });
  }
  await UserModel.findOne({ email })
    .populate({
      path: "children",
      model: ChildModel,
      populate: [
        { path: "tasks", model: TaskModel },
        { path: "gifts", model: GiftModel },
      ],
    })
    .exec((err, data) => {
      if (err) {
        next(err);
      }
      data.children.forEach(async (child) => {
        child.tasks.forEach(async (task) => {
          await TaskModel.deleteOne({
            _id: task._id,
          });
        });
        child.gifts.forEach(async (gift) => {
          await GiftModel.deleteOne({
            _id: gift._id,
          });
        });
        await ChildModel.deleteOne({ _id: child._id });
      });
    });
  await UserModel.deleteOne({ email });
  return res.status(204).end();
};
