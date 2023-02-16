import { DateTime } from "luxon";
import { ruTasks, uaTasks } from "../REST-entities/task/default-tasks.js";
import taskModel from "../REST-entities/task/task.model.js";

export const getDefaultTasks = async (lang, childId) => {
  let defaultTasks = [];
  if (lang === "ru") {
    defaultTasks = [...ruTasks];
  }
  if (lang === "ua") {
    defaultTasks = [...uaTasks];
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

  for (let i = 0; i < defaultTasks.length; i++) {
    const task = await taskModel.create({
      title: defaultTasks[i].title,
      reward: defaultTasks[i].reward,
      imageUrl: defaultTasks[i].imageUrl,
      childId,
      days,
    });
    tasks.push(task._id);
  }
  return tasks;
};
