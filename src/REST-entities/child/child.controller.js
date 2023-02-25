import { getDefaultTasksAndGifts } from "../../helpers/getDefaultTasksAndGifts.js";
import GiftModel from "../gift/gift.model.js";
import TaskModel from "../task/task.model.js";
import UserModel from "../user/user.model.js";
import ChildModel from "./child.model.js";

export const addChild = async (req, res) => {
  const { name, gender } = req.body;

  const { _id } = req.user;

  const existingChild = await ChildModel.findOne({
    parentId: _id,
    name,
    gender,
  });

  if (existingChild) {
    return res.status(409).json({
      message: `${gender} with name ${name} already exists`,
    });
  }
  const newChild = await ChildModel.create({
    name,
    gender,
    balance: 0,
    rewardsGained: 0,
    rewardsPlanned: 0,
    parentId: _id,
    tasks: [],
    gift: [],
  });

  await UserModel.findByIdAndUpdate(_id, {
    $push: { children: newChild },
  });

  const { tasks, gifts } = await getDefaultTasksAndGifts("ru", newChild._id);
  return ChildModel.findByIdAndUpdate(
    { _id: newChild._id },
    { tasks, gifts },
    { new: true }
  )
    .populate([
      { path: "tasks", model: TaskModel, select: "-days._id" },
      { path: "gifts", model: GiftModel },
    ])
    .exec((err, data) => {
      if (err) {
        next(err);
      }

      return res.status(201).json({
        _id: data._id,
        name: data.name,
        gender: data.gender,
        balance: data.balance,
        rewardsGained: data.rewardsGained,
        rewardsPlanned: data.rewardsPlanned,
        tasks: data.tasks,
        gifts: data.gifts,
      });
    });
};
