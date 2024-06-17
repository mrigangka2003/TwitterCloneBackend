import mongoose from "mongoose";
import dotenv from "dotenv";
import { app } from "./app.js";
import connectDB from "./config/db.js";


dotenv.config({
  path: "./.env",
});


const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    app.listen(PORT || 8000, () => {
      console.log(`⚙️ Server is running at port : ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.log("MONGO db connection failed !!! ", err);
});


app.get("/", (req, res) => {
  res.send("WE are working");
});
