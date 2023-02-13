import { DateTime } from "luxon";

import { ruTasks, uaTasks } from "../REST-entities/task/default-tasks.js";

export const weekPeriod = () => {
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

  return {
    startWeekDate: startOfTheWeek.toFormat("yyyy-MM-dd"),
    endWeekDate: startOfTheWeek.plus({ days: 6 }).toFormat("yyyy-MM-dd"),
    days,
  };
};

// export const newWeek = async (lang) => {
//   let defaultTasks = [];
//   if (lang === "ru") {
//     defaultTasks = [...ruTasks];
//   }
//   if (lang === "ua") {
//     defaultTasks = [...uaTasks];
//   }

//   const startOfTheWeek = DateTime.local().startOf("week");
//   const days = [];
//   for (let i = 0; i < 7; i++) {
//     const day = {
//       date: startOfTheWeek.plus({ days: i }).toFormat("yyyy-MM-dd"),
//       isActive: false,
//       isCompleted: false,
//     };
//     days.push(day);
//   }
//   const tasks = [];
//   for (let i = 0; i < defaultTasks.length; i++) {
//     const task = await TaskModel.create({
//       title: defaultTasks[i].title,
//       reward: defaultTasks[i].reward,
//       imageUrl: defaultTasks[i].imageUrl,
//       days,
//     });
//     tasks.push(task._id);
//   }
//   const week = await WeekModel.create({
//     startWeekDate: startOfTheWeek.toFormat("yyyy-MM-dd"),
//     endWeekDate: startOfTheWeek.plus({ days: 6 }).toFormat("yyyy-MM-dd"),
//     rewardsGained: 0,
//     rewardsPlanned: 0,
//     tasks,
//   });
//   return week;
// };

// export const checkWeek = async (user) => {
//   const startOfTheWeek = DateTime.local().startOf("week");
//   const userCurrentWeek = await WeekModel.findOne({
//     _id: user.currentWeek,
//   }).populate("tasks");
//   if (userCurrentWeek.startWeekDate === startOfTheWeek.toFormat("yyyy-MM-dd")) {
//     return userCurrentWeek;
//   }
//   return false;
// };
