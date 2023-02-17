import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import UserModel from "../REST-entities/user/user.model.js";
import SessionModel from "../REST-entities/session/session.model.js";
import ChildModel from "../REST-entities/child/child.model.js";
import TaskModel from "../REST-entities/task/task.model.js";
import GiftModel from "../REST-entities/gift/gift.model.js";
import { checkWeek, weekPeriod } from "../helpers/week.js";
import { createSidAndTokens } from "../helpers/createSidAndTokens.js";

export const register = async (req, res) => {
  const { email, password, username } = req.body;
  console.log("req.headers: ", req.headers);
  console.log("req.headers.origin: ", req.headers.origin);

  const existingUser = await UserModel.findOne({ email });
  if (existingUser) {
    return res
      .status(409)
      .json({ message: `User with ${email} email already exists` });
  }
  const passwordHash = await bcrypt.hash(
    password,
    Number(process.env.HASH_NUMBER)
  );
  const { startWeekDate, endWeekDate } = weekPeriod();
  const newParent = await UserModel.create({
    email,
    passwordHash,
    username,
    originUrl: req.headers.origin,
    startWeekDate,
    endWeekDate,
    children: [],
  });
  return res.status(201).json({
    email,
    username,
    id: newParent._id,
  });
};

export const login = async (req, res, next) => {
  const { email, password } = req.body;
  const user = await UserModel.findOne({ email });
  if (!user) {
    return res
      .status(403)
      .json({ message: `User with ${email} email doesn't exist` });
  }
  if (!user.passwordHash) {
    return res.status(403).json({ message: "Forbidden" });
  }
  const isPasswordCorrect = await bcrypt.compare(password, user.passwordHash);
  if (!isPasswordCorrect) {
    return res.status(403).json({ message: "Password is wrong" });
  }

  const { accessToken, refreshToken, sid } = await createSidAndTokens(user._id);
  await checkWeek();
  await UserModel.findByIdAndUpdate(user._id, {
    accessToken,
    refreshToken,
  }).populate({
    path: "children",
    model: ChildModel,
    populate: [
      { path: "tasks", model: TaskModel },
      { path: "gifts", model: GiftModel },
    ],
  });

  return res.json({
    accessToken,
    refreshToken,
    sid,
    email: user.email,
    username: user.username,
    id: user._id,
    startWeekDate: user.startWeekDate,
    endWeekDate: user.endWeekDate,
    children: user.children,
  });
};

export const refreshTokens = async (req, res) => {
  const authorizationHeader = req.get("Authorization");
  if (authorizationHeader) {
    const activeSession = await SessionModel.findById(req.body.sid);
    if (!activeSession) {
      return res.status(404).json({ message: "Invalid session" });
    }
    const reqRefreshToken = authorizationHeader.replace("Bearer ", "");
    let payload;
    try {
      payload = jwt.verify(
        reqRefreshToken,
        process.env.REFRESH_TOKEN_SECRET_KEY
      );
    } catch (err) {
      await SessionModel.findByIdAndDelete(req.body.sid);
      return res.status(401).json({ message: "Unauthorized" });
    }
    const user = await UserModel.findById(payload.uid);
    const session = await SessionModel.findById(payload.sid);
    if (!user) {
      return res.status(404).json({ message: "Invalid user" });
    }
    if (!session) {
      return res.status(404).json({ message: "Invalid session" });
    }
    await SessionModel.findByIdAndDelete(payload.sid);

    const { accessToken, refreshToken, sid } = await createSidAndTokens(
      user._id
    );

    return res.status(200).json({
      newAccessToken: accessToken,
      newRefreshToken: refreshToken,
      newSid: sid,
    });
  }
  return res.status(400).json({ message: "No token provided" });
};

export const logout = async (req, res) => {
  const { _id } = req.user;
  await User.findByIdAndUpdate(_id, { accessToken: "", refreshToken: "" });
  const currentSession = req.session;
  await SessionModel.deleteOne({ _id: currentSession._id });
  return res.status(204).end();
};

const { SOCIAL_REDIRECT_URL } = process.env;

export const facebookAuth = async (req, res) => {
  const { accessToken, refreshToken, sid } = await createSidAndTokens(
    req.user._id
  );
  await checkWeek();
  await UserModel.findByIdAndUpdate(req.user._id, {
    accessToken,
    refreshToken,
  });

  res.redirect(
    `${SOCIAL_REDIRECT_URL}?accessToken=${accessToken}&refreshToken=${refreshToken}&sid=${sid}`
  );
};

export const googleAuth = async (req, res) => {
  const { accessToken, refreshToken, sid } = await createTokens(req.user._id);
  await checkWeek();
  await UserModel.findByIdAndUpdate(req.user._id, {
    accessToken,
    refreshToken,
  });
  res.redirect(
    `${SOCIAL_REDIRECT_URL}?accessToken=${accessToken}&refreshToken=${refreshToken}&sid=${sid}`
  );
};
