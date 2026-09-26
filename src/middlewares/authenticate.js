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
    // The token is validated against its own session instead of user.accessToken,
    // so the same account can stay logged in on several devices at once
    const user = await UserModel.findById(payload.uid);
    if (!user) {
      return res.status(401).json({ message: "Invalid token" });
    }

    const newSession = await SessionModel.findById(payload.sid);
    if (!newSession || newSession.uid?.toString() !== user._id.toString()) {
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
