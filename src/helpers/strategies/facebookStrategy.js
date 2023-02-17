import { Strategy } from "passport-facebook";
import UserModel from "../../REST-entities/user/user.model.js";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();
const {
  FACEBOOK_CLIENT_ID,
  FACEBOOK_SECRET_KEY,
  FACEBOOK_CALLBACK_URL,
  APP_URL,
  HASH_NUMBER,
} = process.env;

const callbackURL = `${APP_URL}${FACEBOOK_CALLBACK_URL}`;

const facebookParams = {
  clientID: FACEBOOK_CLIENT_ID,
  clientSecret: FACEBOOK_SECRET_KEY,
  callbackURL,
  profileFields: ["id", "displayName", "email", "photos"],
};

const facebookCallback = async (accessToken, refreshToken, profile, done) => {
  try {
    const { emails, displayName } = profile;
    const email = emails[0].value;
    const user = await UserModel.findOne({ email });
    if (user) {
      return done(null, user);
    }

    const hashPassword = await bcrypt.hash(uuidv4(), HASH_NUMBER);
    const { startWeekDate, endWeekDate } = weekPeriod();
    const newUser = await UserModel.create({
      name: displayName.trim(),
      email,
      password: hashPassword,
      startWeekDate,
      endWeekDate,
      children: [],
    });
    done(null, newUser);
  } catch (error) {
    done(error, false);
  }
};

export const facebookStrategy = new Strategy(facebookParams, facebookCallback);
