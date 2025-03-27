import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";

// importing user routes
import userRoutes from "./routes/auth.route.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;

app.use(
  cors({
    origin: process.env.BASE_URL,
    credential: true,
    methods: ["GET", "POST", "DELETE", "OPTIONS"],
    allowedHeadres: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send("Hello, Cohort!");
});

app.get("/test", (req, res) => {
  res.send("Hi, i am backend talking to you!");
});

// linking to user routes
app.use("/api/v1/Users", userRoutes);

app.listen(port, () => {
  console.log(`Backend is listining on port: ${port}`);
});
