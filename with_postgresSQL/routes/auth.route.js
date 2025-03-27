import express from "express";
import {
  forgotPassword,
  login,
  logout,
  profile,
  refresh,
  registerUser,
  resetPassword,
  verifyUser,
} from "../controllers/auth.controller.js";
import isLoggedIn from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/register", registerUser);
router.get("/verify/:token", verifyUser);
router.post("/login", login);
router.get("/refresh", refresh);
router.get("/profile", isLoggedIn, profile);
router.get("/logout", isLoggedIn, logout);
router.get("/forgotPassword", isLoggedIn, forgotPassword);
router.post("/resetPassword/:token", resetPassword);

export default router;
