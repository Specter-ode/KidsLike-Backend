import { Strategy } from "passport-google-oauth2";
import UserModel from "../../REST-entities/user/user.model.js";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcryptjs";
import { weekPeriod } from "../../helpers/week.js";

const {
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_CALLBACK_URL,
  APP_URL,
  HASH_NUMBER,
} = process.env;

const callbackURL = `${APP_URL}${GOOGLE_CALLBACK_URL}`;

const googleParams = {
  clientID: GOOGLE_CLIENT_ID,
  clientSecret: GOOGLE_CLIENT_SECRET,
  callbackURL,
};

const googleCallback = async (
  req,
  accessToken,
  refreshToken,
  profile,
  done
) => {
  try {
    const { email, displayName } = profile;
    const user = await UserModel.findOne({ email });
    if (user) {
      return done(null, user);
    }

    const passwordHash = await bcrypt.hash(uuidv4(), Number(HASH_NUMBER));
    const { startWeekDate, endWeekDate } = weekPeriod();

    const newUser = await UserModel.create({
      username: displayName.trim(),
      email,
      passwordHash,
      // originUrl: req.headers.origin,
      startWeekDate,
      endWeekDate,
      children: [],
    });

    done(null, newUser);
  } catch (err) {
    done(err, false);
  }
};

export const googleStrategy = new Strategy(googleParams, googleCallback);
