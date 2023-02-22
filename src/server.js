import mongoose from "mongoose";
import app from "./app.js";
const { MONGODB_URL, PORT } = process.env;

mongoose.set("strictQuery", false);
mongoose
  .connect(MONGODB_URL)
  .then(() => {
    console.log("Database connection successful");
    app.listen(PORT || 4000);
    console.log("Started listening on port", PORT);
  })
  .catch((error) => {
    console.log(error.message);
    process.exit(1);
  });
