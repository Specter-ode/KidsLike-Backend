export const authenticate = async (req, res, next) => {
  try {
    const { authorization = "" } = req.headers;
    const [bearer, token] = authorization.split(" ");
    if (bearer !== "Bearer") {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const payload = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET_KEY);
    const user = await UserModel.findById(payload.uid);
    if (!user || !user.accessToken || user.accessToken !== token) {
      return res.status(401).json({ message: "Invalid token" });
    }

    const session = await SessionModel.findById(payload.sid);
    if (!session) {
      return res.status(404).json({ message: "Invalid session" });
    }
    req.user = user;
    req.session = session;
    next();
  } catch (error) {
    if (!error.status) {
      error.status = 401;
      error.message = "Unauthorized | No token provided";
    }
    next(error);
  }
};
