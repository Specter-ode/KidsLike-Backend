import { DateTime } from "luxon";
import { ruTasks, uaTasks } from "../REST-entities/task/default-tasks.js";
import { ruGifts, uaGifts } from "../REST-entities/gift/default-gifts.js";
import TaskModel from "../REST-entities/task/task.model.js";
import GiftModel from "../REST-entities/gift/gift.model.js";

export const getDefaultTasksAndGifts = async (lang, childId) => {
  let defaultTasks = [];
  let defaultGifts = [];

  if (lang === "ru-RU") {
    defaultTasks = [...ruTasks];
    defaultGifts = [...ruGifts];
  }
  if (lang === "uk-UA") {
    defaultTasks = [...uaTasks];
    defaultGifts = [...uaGifts];
  }

  const startOfTheWeek = DateTime.local().startOf("week");
  const days = [];
  for (let i = 0; i < 7; i++) {
    const day = {
      date: startOfTheWeek.plus({ days: i }).toFormat("yyyy-MM-dd"),
      isActive: false,
      isCompleted: false,
    };
    days.push(day);
  }

  const tasks = [];
  const gifts = [];
  for (let i = 0; i < defaultTasks.length; i++) {
    const task = await TaskModel.create({
      title: defaultTasks[i].title,
      reward: defaultTasks[i].reward,
      imageUrl: defaultTasks[i].imageUrl,
      childId,
      days,
    });
    tasks.push(task._id);
  }
  for (let i = 0; i < defaultGifts.length; i++) {
    const gift = await GiftModel.create({
      title: defaultGifts[i].title,
      price: defaultGifts[i].reward,
      imageUrl: defaultGifts[i].imageUrl,
      childId,
    });
    gifts.push(gift._id);
  }

  return { tasks, gifts };
};
