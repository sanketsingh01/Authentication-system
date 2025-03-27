import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import db from "./utils/db.js";
import cookieParser from "cookie-parser";

// Exporting user routes
import UserRoutes from "./routes/User.routes.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;

app.use(
  cors({
    origin: process.env.BASE_URL,
    credentials: true,
    methods: ["GET", "POST", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send("Hello, Cohort!");
});

app.get("/test", (req, res) => {
  res.send("This is test talking from backend");
});

// Connecting to Database
db();

// Using user routes
app.use("/api/v1/Users", UserRoutes);

app.listen(port, () => {
  console.log(`Our Backend is listining on port ${port}`);
});
