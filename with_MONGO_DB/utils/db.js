import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const db = () => {
  mongoose
    .connect(process.env.MONGO_URL)
    .then(() => {
      console.log("Connected to mongoDB");
    })
    .catch((error) => {
      console.log(`${error} while connecting to mongoDB`);
    });
};

export default db;
