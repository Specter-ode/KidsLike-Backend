import cors from "cors";
import express from "express";
import morgan from "morgan";
import * as dotenv from "dotenv";
dotenv.config();
// import swaggerUi from "swagger-ui-express";
import authRouter from "./auth/auth.router.js";
import childRouter from "./REST-entities/child/child.router.js";
import taskRouter from "./REST-entities/task/task.router.js";
import giftRouter from "./REST-entities/gift/gift.router.js";
import userRouter from "./REST-entities/user/user.router.js";
// const swaggerDocument = require("../../swagger.json");

const app = express();
const formatsLogger = app.get("env") === "development" ? "dev" : "short";

app.use(morgan(formatsLogger));
app.use(cors());
app.use(express.json());

app.use("/auth", authRouter);
app.use("/child", childRouter);
app.use("/task", taskRouter);
app.use("/gift", giftRouter);
app.use("/user", userRouter);

app.use((req, res) => {
  res.status(404).json({ message: "Not found" });
});

app.use((err, req, res, next) => {
  const { status = 500, message = "Server error" } = err;
  res.status(status).json({ message });
});

export default app;
