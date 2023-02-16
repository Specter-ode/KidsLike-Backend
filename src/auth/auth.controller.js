import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import * as queryString from "query-string";
import axios from "axios";
import { URL } from "url";

import UserModel from "../REST-entities/user/user.model.js";
import SessionModel from "../REST-entities/session/session.model.js";
import ChildModel from "../REST-entities/child/child.model.js";
import TaskModel from "../REST-entities/task/task.model.js";
import GiftModel from "../REST-entities/gift/gift.model.js";
import { checkWeek, weekPeriod } from "../helpers/week.js";

export const register = async (req, res) => {
  const { email, password, username } = req.body;
  console.log("req.body: ", req.body);

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
  const newSession = await SessionModel.create({
    uid: user._id,
  });
  const accessToken = jwt.sign(
    { uid: user._id, sid: newSession._id },
    process.env.ACCESS_TOKEN_SECRET_KEY,
    {
      expiresIn: process.env.JWT_ACCESS_EXPIRE_TIME,
    }
  );
  const refreshToken = jwt.sign(
    { uid: user._id, sid: newSession._id },
    process.env.REFRESH_TOKEN_SECRET_KEY,
    {
      expiresIn: process.env.JWT_REFRESH_EXPIRE_TIME,
    }
  );

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
    sid: newSession._id,
    email: user.email,
    username: user.username,
    id: user._id,
    startWeekDate: user.startWeekDate,
    endWeekDate: user.endWeekDate,
    children: user.children,
  });
};

export const authorize = async (req, res, next) => {
  const authorizationHeader = req.get("Authorization");
  if (authorizationHeader) {
    const accessToken = authorizationHeader.replace("Bearer ", "");
    let payload;
    try {
      payload = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET_KEY);
    } catch (err) {
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
    req.user = user;
    req.session = session;
    next();
  } else return res.status(400).json({ message: "No token provided" });
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
    const newSession = await SessionModel.create({
      uid: user._id,
    });
    const newAccessToken = jwt.sign(
      { uid: user._id, sid: newSession._id },
      process.env.ACCESS_TOKEN_SECRET_KEY,
      {
        expiresIn: process.env.JWT_ACCESS_EXPIRE_TIME,
      }
    );
    const newRefreshToken = jwt.sign(
      { uid: user._id, sid: newSession._id },
      process.env.REFRESH_TOKEN_SECRET_KEY,
      { expiresIn: process.env.JWT_REFRESH_EXPIRE_TIME }
    );
    return res
      .status(200)
      .json({ newAccessToken, newRefreshToken, newSid: newSession._id });
  }
  return res.status(400).json({ message: "No token provided" });
};

export const logout = async (req, res) => {
  const currentSession = req.session;
  await SessionModel.deleteOne({ _id: currentSession._id });
  return res.status(204).end();
};

// export const googleAuth = async (req, res) => {
//   const stringifiedParams = queryString.stringify({
//     client_id: process.env.GOOGLE_CLIENT_ID,
//     redirect_uri: `${process.env.BASE_URL}/auth/google-redirect`,
//     scope: [
//       "https://www.googleapis.com/auth/userinfo.email",
//       "https://www.googleapis.com/auth/userinfo.profile",
//     ].join(" "),
//     response_type: "code",
//     access_type: "offline",
//     prompt: "consent",
//   });
//   return res.redirect(
//     `https://accounts.google.com/o/oauth2/v2/auth?${stringifiedParams}`
//   );
// };

// export const googleRedirect = async (req, res) => {
//   const fullUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
//   const urlObj = new URL(fullUrl);
//   const urlParams = queryString.parse(urlObj.search);
//   const code = urlParams.code;
//   const tokenData = await axios({
//     url: `https://oauth2.googleapis.com/token`,
//     method: "post",
//     data: {
//       client_id: process.env.GOOGLE_CLIENT_ID,
//       client_secret: process.env.GOOGLE_CLIENT_SECRET,
//       redirect_uri: `${process.env.BASE_URL}/auth/google-redirect`,
//       grant_type: "authorization_code",
//       code,
//     },
//   });
//   const userData = await axios({
//     url: "https://www.googleapis.com/oauth2/v2/userinfo",
//     method: "get",
//     headers: {
//       Authorization: `Bearer ${tokenData.data.access_token}`,
//     },
//   });
//   let existingParent = await UserModel.findOne({ email: userData.data.email });
//   if (!existingParent || !existingParent.originUrl) {
//     return res.status(403).json({
//       message:
//         "You should register from front-end first (not postman). Google/Facebook are only for sign-in",
//     });
//   }
//   const newSession = await SessionModel.create({
//     uid: existingParent._id,
//   });
//   const accessToken = jwt.sign(
//     { uid: existingParent._id, sid: newSession._id },
//     process.env.ACCESS_TOKEN_SECRET_KEY as string,
//     {
//       expiresIn: process.env.JWT_ACCESS_EXPIRE_TIME,
//     }
//   );
//   const refreshToken = jwt.sign(
//     { uid: existingParent._id, sid: newSession._id },
//     process.env.REFRESH_TOKEN_SECRET_KEY as string,
//     {
//       expiresIn: process.env.JWT_REFRESH_EXPIRE_TIME,
//     }
//   );
//   return res.redirect(
//     `${existingParent.originUrl}?accessToken=${accessToken}&refreshToken=${refreshToken}&sid=${newSession._id}`
//   );
// };

// export const facebookAuth = async (req, res) => {
//   const stringifiedParams = queryString.stringify({
//     client_id: process.env.FACEBOOK_APP_ID,
//     redirect_uri: `${process.env.BASE_URL}/auth/facebook-redirect/`,
//     scope: "email",
//     response_type: "code",
//     auth_type: "rerequest",
//     display: "popup",
//   });
//   return res.redirect(
//     `https://www.facebook.com/v4.0/dialog/oauth?${stringifiedParams}`
//   );
// };

// export const facebookRedirect = async (req, res) => {
//   const fullUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
//   const urlObj = new URL(fullUrl);
//   const urlParams = queryString.parse(urlObj.search);
//   const code = urlParams.code;
//   const tokenData = await axios({
//     url: "https://graph.facebook.com/v4.0/oauth/access_token",
//     method: "get",
//     params: {
//       client_id: process.env.FACEBOOK_APP_ID,
//       client_secret: process.env.FACEBOOK_APP_SECRET,
//       redirect_uri: `${process.env.BASE_URL}/auth/facebook-redirect/`,
//       code,
//     },
//   });
//   const userData = await axios({
//     url: "https://graph.facebook.com/me",
//     method: "get",
//     params: {
//       fields: ["email", "first_name"].join(","),
//       access_token: tokenData.data.access_token,
//     },
//   });
//   let existingParent = await UserModel.findOne({ email: userData.data.email });
//   if (!existingParent || !existingParent.originUrl) {
//     return res.status(403).json({
//       message:
//         "You should register from front-end first (not postman). Google/Facebook are only for sign-in",
//     });
//   }
//   const newSession = await SessionModel.create({
//     uid: existingParent._id,
//   });
//   const accessToken = jwt.sign(
//     { uid: existingParent._id, sid: newSession._id },
//     process.env.ACCESS_TOKEN_SECRET_KEY as string,
//     {
//       expiresIn: process.env.JWT_ACCESS_EXPIRE_TIME,
//     }
//   );
//   const refreshToken = jwt.sign(
//     { uid: existingParent._id, sid: newSession._id },
//     process.env.REFRESH_TOKEN_SECRET_KEY as string,
//     {
//       expiresIn: process.env.JWT_REFRESH_EXPIRE_TIME,
//     }
//   );
//   return res.redirect(
//     `${existingParent.originUrl}?accessToken=${accessToken}&refreshToken=${refreshToken}&sid=${newSession._id}`
//   );
// };
