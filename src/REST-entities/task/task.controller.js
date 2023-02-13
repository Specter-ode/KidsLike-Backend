import mongoose from "mongoose";
import { DateTime } from "luxon";
import ChildModel from "../child/child.model.js";
import TaskModel from "./task.model.js";
import UserModel from "../user/user.model.js";
import { weekPeriod } from "../../helpers/new-week.js";

export const addTask = async (req, res) => {
  const parent = req.user;
  const childToUpdateId = parent.children.find(
    (childId) => childId.toString() === req.params.childId
  );

  if (!childToUpdateId) {
    return res.status(404).send({ message: "Child not found" });
  }

  if (req.fileValidationError) {
    return res
      .status(415)
      .send({ message: req.fileValidationError, success: false });
  }

  let imageUrl;
  if (!req.file) {
    imageUrl =
      "https://storage.googleapis.com/kidslikev2_bucket/default-task.jpg";
  } else {
    imageUrl = await uploadImage(req.file);
  }

  const { days } = weekPeriod();

  const task = await TaskModel.create({
    ...req.body,
    childId: childToUpdateId,
    imageUrl,
    days,
  });
  await ChildModel.findByIdAndUpdate(childToUpdateId, {
    $push: { tasks: task },
  });
  // await currentChild.save();

  return res.status(201).send({
    name: task.name,
    reward: task.reward,
    imageUrl: task.imageUrl,
    childId: task.childId,
    id: task._id,
    days: task.days,
  });
};

export const updateTaskActiveStatus = async (req, res) => {
  const { taskId } = req.params;
  const parent = req.user;
  const taskBeforeUpdate = await TaskModel.findById(taskId);
  console.log("taskBeforeUpdate: ", taskBeforeUpdate);
  if (!taskBeforeUpdate) {
    return res.status(404).send({ message: "Task not found" });
  }
  const childToUpdateId = parent.children.find(
    (childId) => childId.toString() === taskBeforeUpdate.childId.toString()
  );

  if (!childToUpdateId) {
    return res.status(404).send({ message: "Child not found" });
  }

  const taskToUpdate = await TaskModel.findByIdAndUpdate(taskId, req.body, {
    new: true,
  });
  console.log("taskToUpdate: ", taskToUpdate);

  const childToUpdate = await ChildModel.findById(taskBeforeUpdate.childId);
  console.log("childToUpdate: ", childToUpdate);
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

  return res.status(200).send({
    updatedTask: {
      name: taskToUpdate.name,
      reward: taskToUpdate.reward,
      childId: taskToUpdate.childId,
      id: taskToUpdate._id,
      days: taskToUpdate.days,
    },
    rewardsPlanned: newRewardsPlanned,
  });
};

export const deleteTask = async (req, res) => {
  const parent = req.user;
  const taskToDelete = await TaskModel.findById(req.params.taskId);
  if (!taskToDelete) {
    return res.status(404).send({ message: "Task not found" });
  }
  const childToUpdate = parent.children.find(
    (childId) => childId.toString() === taskToDelete.childId.toString()
  );
  if (!childToUpdate) {
    return res.status(404).send({ message: "Child not found" });
  }
  const deletedTask = await TaskModel.findByIdAndDelete(req.params.taskId);
  await ChildModel.findByIdAndUpdate(deletedTask.childId, {
    $pull: { tasks: mongoose.Types.ObjectId(deletedTask._id) },
  });
  return res.status(204).end();
};

export const updateTaskCompletedStatus = async (req, res) => {
  const { date } = req.body;
  const parent = req.user;
  const taskToUpdate = await TaskModel.findById(req.params.taskId);
  if (!taskToUpdate) {
    return res.status(404).send({ message: "Task not found" });
  }
  const childToUpdateId = parent.children.find(
    (childId) => childId.toString() === taskToUpdate.childId.toString()
  );
  if (!childToUpdateId) {
    return res.status(404).send({ message: "Child not found" });
  }

  const dayToUpdate = taskToUpdate.days.find((day) => day.date === date);
  if (!dayToUpdate) {
    return res.status(404).send({ message: "Day not found", success: false });
  }
  if (!dayToUpdate.isActive) {
    return res.status(400).send({
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
  return res.status(200).send({
    message: "Task has been successfully switched",
    success: true,
    balance: childToUpdate?.balance,
    rewardsGained: childToUpdate?.rewardsGained,
    updatedTask: {
      name: taskToUpdate.name,
      reward: taskToUpdate.reward,
      imageUrl: taskToUpdate.imageUrl,
      id: taskToUpdate._id,
      days: taskToUpdate.days,
    },
  });
};
