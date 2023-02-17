import jwt from "jsonwebtoken";

const {
  ACCESS_TOKEN_SECRET_KEY,
  REFRESH_TOKEN_SECRET_KEY,
  JWT_ACCESS_EXPIRE_TIME,
  JWT_REFRESH_EXPIRE_TIME,
} = process.env;

export const createSidAndTokens = async (id) => {
  const newSession = await SessionModel.create({
    uid: id,
  });
  const sid = newSession._id;
  const accessToken = jwt.sign({ uid: id, sid }, ACCESS_TOKEN_SECRET_KEY, {
    expiresIn: JWT_ACCESS_EXPIRE_TIME,
  });
  const refreshToken = jwt.sign({ uid: id, sid }, REFRESH_TOKEN_SECRET_KEY, {
    expiresIn: JWT_REFRESH_EXPIRE_TIME,
  });

  return { accessToken, refreshToken, sid };
};
