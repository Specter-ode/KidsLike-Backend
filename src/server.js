import cors from "cors";
import path from "path";
import express from "express";
import mongoose from "mongoose";

import morgan from "morgan";
// import swaggerUi from "swagger-ui-express";
import dotenv from "dotenv";

dotenv.config();
import authRouter from "./auth/auth.router.js";
import childRouter from "./REST-entities/child/child.router.js";
import taskRouter from "./REST-entities/task/task.router.js";
import giftRouter from "./REST-entities/gift/gift.router.js";
import userRouter from "./REST-entities/user/user.router.js";
// const swaggerDocument = require("../../swagger.json");

const { MONGODB_URL, PORT } = process.env;
class Server {
  constructor() {
    this.app = express();
  }

  start() {
    this.initMiddlewares();
    this.initDbConnection();
    this.initRoutes();
    this.initErrorHandling();
  }

  initMiddlewares() {
    const formatsLogger =
      this.app.get("env") === "development" ? "dev" : "short";
    this.app.use(morgan(formatsLogger));
    this.app.use(express.json());
    this.app.use(cors());
  }

  initDbConnection() {
    try {
      mongoose.set("strictQuery", false);
      mongoose.connect(MONGODB_URL).then(() => {
        console.log("Database connection is successful");
        this.app.listen(PORT || 4000);
        console.log("Started listening on port", PORT);
      });
    } catch (error) {
      console.log("Database connection failed", error);
      process.exit(1);
    }
  }

  initRoutes() {
    this.app.use("/auth", authRouter);
    this.app.use("/child", childRouter);
    this.app.use("/task", taskRouter);
    this.app.use("/gift", giftRouter);
    this.app.use("/user", userRouter);
    // this.app.use(
    //   "/api-docs",
    //   swaggerUi.serve,
    //   swaggerUi.setup(swaggerDocument)
    // );
  }

  initErrorHandling() {
    this.app.use((err, req, res, next) => {
      let status = 500;
      if (err.response) {
        status = err.response.status;
      }
      return res.status(status).json(err.message);
    });
  }
}

new Server().start();
