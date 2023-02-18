import mongoose from "mongoose";
import ChildModel from "../child/child.model.js";
import TaskModel from "./task.model.js";
import { weekPeriod } from "../../helpers/week.js";
import cloudinary from "../../helpers/cloudinary.js";

export const addTask = async (req, res) => {
  const parent = req.user;

  const childToUpdateId = parent.children.find(
    (childId) => childId?.toString() === req.params.childId
  );

  if (!childToUpdateId) {
    return res.status(404).json({ message: "Child not found" });
  }

  if (req.fileValidationError) {
    return res
      .status(415)
      .json({ message: req.fileValidationError, success: false });
  }
  const image = await cloudinary.uploader.upload(req.file.path);
  const { days } = weekPeriod();

  const task = await TaskModel.create({
    ...req.body,
    childId: childToUpdateId,
    imageUrl: image.secure_url,
    imageId: image.public_id,
    days,
  });
  await ChildModel.findByIdAndUpdate(childToUpdateId, {
    $push: { tasks: task },
  });
  // await currentChild.save();

  return res.status(201).json({
    title: task.title,
    reward: task.reward,
    imageUrl: task.imageUrl,
    childId: task.childId,
    id: task._id,
    days: task.days,
  });
};

export const editTask = async (req, res) => {
  const parent = req.user;
  const taskToEdit = await TaskModel.findById(req.params.taskId);
  if (!taskToEdit) {
    return res.status(404).json({ message: "Task not found" });
  }
  const childToUpdate = parent.children.find(
    (childId) => childId.toString() === taskToEdit.childId.toString()
  );
  if (!childToUpdate) {
    return res.status(404).json({ message: "Child not found" });
  }
  if (!req.file && !req.body.title && !req.body.reward) {
    return res
      .status(400)
      .json({ message: "At least fields must be required" });
  }
  if (req.fileValidationError) {
    return res.status(415).json({ message: req.fileValidationError });
  }

  if (taskToEdit.imageId) {
    await cloudinary.uploader.destroy(taskToEdit.imageId);
  }

  const image = await cloudinary.uploader.upload(req.file.path);
  const newTask = {
    ...taskToEdit.toObject(),
    ...req.body,
    imageUrl: image.secure_url,
    imageId: image.public_id,
  };
  await TaskModel.findByIdAndUpdate(req.params.taskId, newTask, {
    overwrite: true,
  });
  return res.status(200).json({
    title: newTask.title,
    reward: newTask.reward,
    imageUrl: newTask.imageUrl,
    childId: newTask.childId,
    id: newTask._id,
    days: newTask.days,
  });
};

export const deleteTask = async (req, res) => {
  const parent = req.user;
  const taskToDelete = await TaskModel.findById(req.params.taskId);
  if (!taskToDelete) {
    return res.status(404).json({ message: "Task not found" });
  }
  const childToUpdate = parent.children.find(
    (childId) => childId.toString() === taskToDelete.childId.toString()
  );
  if (!childToUpdate) {
    return res.status(404).json({ message: "Child not found" });
  }

  const deletedTask = await TaskModel.findByIdAndDelete(req.params.taskId);
  if (deletedTask.imageId) {
    await cloudinary.uploader.destroy(deletedTask.imageId);
  }
  await ChildModel.findByIdAndUpdate(deletedTask.childId, {
    $pull: { tasks: mongoose.Types.ObjectId(deletedTask._id) },
  });

  return res.json({ taskId: deletedTask._id, childId: deletedTask.childId });
};

export const updateTaskActiveStatus = async (req, res) => {
  const { taskId } = req.params;
  const parent = req.user;
  const taskBeforeUpdate = await TaskModel.findById(taskId);
  if (!taskBeforeUpdate) {
    return res.status(404).json({ message: "Task not found" });
  }
  const childToUpdateId = parent.children.find(
    (childId) => childId.toString() === taskBeforeUpdate.childId.toString()
  );

  if (!childToUpdateId) {
    return res.status(404).json({ message: "Child not found" });
  }

  const taskToUpdate = await TaskModel.findByIdAndUpdate(taskId, req.body, {
    new: true,
  });
  const childToUpdate = await ChildModel.findById(taskBeforeUpdate.childId);
  function updateRewardsPlanned() {
    for (let i = 0; i < taskBeforeUpdate.days.length; i++) {
      if (taskToUpdate.days[i].isActive && !taskBeforeUpdate.days[i].isActive) {
        childToUpdate.rewardsPlanned += taskToUpdate.reward;
      }
      if (!taskToUpdate.days[i].isActive && taskBeforeUpdate.days[i].isActive) {
        childToUpdate.rewardsPlanned -= taskToUpdate.reward;
      }
    }
    return childToUpdate.rewardsPlanned;
  }

  const newRewardsPlanned = updateRewardsPlanned();
  await ChildModel.findByIdAndUpdate(taskBeforeUpdate.childId, {
    rewardsPlanned: newRewardsPlanned,
  });

  return res.status(200).json({
    updatedTask: {
      title: taskToUpdate.title,
      reward: taskToUpdate.reward,
      imageUrl: taskToUpdate.imageUrl,
      childId: taskToUpdate.childId,
      id: taskToUpdate._id,
      days: taskToUpdate.days,
    },
    rewardsPlanned: newRewardsPlanned,
  });
};

export const updateTaskCompletedStatus = async (req, res) => {
  const { date } = req.body;
  const parent = req.user;
  const taskToUpdate = await TaskModel.findById(req.params.taskId);
  if (!taskToUpdate) {
    return res.status(404).json({ message: "Task not found" });
  }
  const childToUpdateId = parent.children.find(
    (childId) => childId.toString() === taskToUpdate.childId.toString()
  );
  if (!childToUpdateId) {
    return res.status(404).json({ message: "Child not found" });
  }

  const dayToUpdate = taskToUpdate.days.find((day) => day.date === date);
  if (!dayToUpdate) {
    return res.status(404).json({ message: "Day not found", success: false });
  }
  if (!dayToUpdate.isActive) {
    return res.status(400).json({
      message: "This task doesn't exist on provided day",
      success: false,
    });
  }
  const childToUpdate = await ChildModel.findById(taskToUpdate.childId);
  if (dayToUpdate.isCompleted) {
    childToUpdate.balance -= taskToUpdate.reward;
    childToUpdate.rewardsGained -= taskToUpdate.reward;
  } else {
    childToUpdate.balance += taskToUpdate.reward;
    childToUpdate.rewardsGained += taskToUpdate.reward;
  }
  dayToUpdate.isCompleted = !dayToUpdate.isCompleted;
  await taskToUpdate.save();
  await parent.save();
  await childToUpdate.save();
  return res.status(200).json({
    message: "Task has been successfully change active status",
    success: true,
    balance: childToUpdate?.balance,
    rewardsGained: childToUpdate?.rewardsGained,
    updatedTask: {
      title: taskToUpdate.title,
      reward: taskToUpdate.reward,
      imageUrl: taskToUpdate.imageUrl,
      childId: taskToUpdate.childId,
      id: taskToUpdate._id,
      days: taskToUpdate.days,
    },
  });
};
