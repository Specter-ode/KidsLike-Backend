import { DateTime } from "luxon";
import UserModel from "../REST-entities/user/user.model.js";
import TaskModel from "../REST-entities/task/task.model.js";
import GiftModel from "../REST-entities/gift/gift.model.js";

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

export const checkWeek = async (_id) => {
  const startOfTheWeek = DateTime.local().startOf("week");
  console.log(
    'startOfTheWeek.toFormat("yyyy-MM-dd"): ',
    startOfTheWeek.toFormat("yyyy-MM-dd")
  );
  const isCorrectWeek = await UserModel.findOne({
    _id,
    startWeekDate: startOfTheWeek.toFormat("yyyy-MM-dd"),
  });
  console.log("isCorrectWeek: ", isCorrectWeek);

  if (!isCorrectWeek) {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = {
        date: startOfTheWeek.plus({ days: i }).toFormat("yyyy-MM-dd"),
        isActive: false,
        isCompleted: false,
      };
      days.push(day);
    }
    await UserModel.updateMany(
      {},
      {
        startWeekDate: startOfTheWeek.toFormat("yyyy-MM-dd"),
        endWeekDate: startOfTheWeek.plus({ days: 6 }).toFormat("yyyy-MM-dd"),
      }
    );
    await TaskModel.updateMany({}, { days });
    await GiftModel.updateMany({}, { isPurchased: false });
  }
};
