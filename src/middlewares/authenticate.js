import jwt from "jsonwebtoken";
import UserModel from "../REST-entities/user/user.model.js";
import SessionModel from "../REST-entities/session/session.model.js";

export const authenticate = async (req, res, next) => {
  try {
    const { authorization = "" } = req.headers;
    const [bearer, token] = authorization.split(" ");

    if (bearer !== "Bearer") {
      return res.status(401).json({ message: "Invalid token" });
    }

    const payload = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET_KEY);
    const user = await UserModel.findById(payload.uid);
    if (!user || !user.accessToken || user.accessToken !== token) {
      return res.status(401).json({ message: "Invalid token" });
    }

    const newSession = await SessionModel.findById(payload.sid);
    if (!newSession) {
      return res.status(404).json({ message: "Invalid session" });
    }
    req.user = user;
    req.session = newSession;
    next();
  } catch (error) {
    if (!error.status) {
      error.status = 401;
      error.message = "Unauthorized | Invalid token";
    }
    next(error);
  }
};
