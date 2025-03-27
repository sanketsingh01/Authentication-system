import User from "../model/User.model.js";
import crypto from "crypto";
import mail from "../utils/verifymail.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import resetMail from "../utils/resetPassMail.js";

import dotenv from "dotenv";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/generateTokens.js";

dotenv.config();

const registerUser = async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({
      success: false,
      message: "ALL FILEDS ARE REQUIRED",
    });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    const user = await User.create({
      name,
      email,
      password,
    });

    const token = crypto.randomBytes(32).toString("hex");
    user.verificationToken = token;
    user.save();

    // Sending the vrification mail to user
    mail(user.email, token);

    console.log(user);
    res.status(201).json({
      success: true,
      message: "USer registered Successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      success: false,
      message: "Intrenall error Occured while registiration",
    });
  }
};

const verifyUser = async (req, res) => {
  const { token } = req.params;
  if (!token) {
    return res.status(400).json({
      success: false,
      message: "Invalid Token",
    });
  }

  try {
    const user = await User.findOne({ verificationToken: token });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found!",
      });
    }

    user.isverified = true;
    user.verificationToken = undefined;
    user.save();

    res.status(200).json({
      success: true,
      message: "User verified successfully",
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "Intrenall error occured",
    });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "All fields are required",
    });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not Found",
      });
    }

    const isMatch = bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid password!",
      });
    }

    if (!user.isverified) {
      return res.status(400).json({
        success: false,
        message: "Please verify the user!",
      });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    user.refreshToken = refreshToken;
    user.save();

    const cookieOptionsAccess = {
      httpOnly: true,
      secure: true,
      maxAge: 2 * 60 * 1000,
    };

    const cookieOptionsRefresh = {
      httpOnly: true,
      secure: true,
      maxAge: 24 * 60 * 60 * 1000,
    };

    res.cookie("token", accessToken, cookieOptionsAccess);
    res.cookie("refreshToken", refreshToken, cookieOptionsRefresh);

    res.status(200).json({
      success: true,
      message: "User logged in successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      success: false,
      message: "Intrenall error Occured",
    });
  }
};

const refresh = async (req, res) => {
  try {
    console.log(req.cookies);
    const refreshToken = req.cookies?.refreshToken;

    console.log("Refersh Token found: ", refreshToken ? "YES" : "NO");

    if (!refreshToken) {
      return res.status(403).json({
        success: false,
        message: "Refresh token required!",
      });
    }

    const user = await User.findOne({ refreshToken });
    if (!user) {
      return res.status(403).json({
        success: false,
        message: "Invalid refersh token",
      });
    }

    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_TOKEN_SECRET
    );
    console.log(decoded);
    if (!decoded) {
      return res.status(403).json({
        success: false,
        message: "Refresh token Expired!",
      });
    }

    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);

    user.refreshToken = newRefreshToken;
    user.save();

    const cookieOptionsAccess = {
      httpOnly: true,
      secure: true,
      maxAge: 2 * 60 * 1000,
    };

    const cookieOptionsRefresh = {
      httpOnly: true,
      secure: true,
      maxAge: 24 * 60 * 60 * 1000,
    };

    res.cookie("token", newAccessToken, cookieOptionsAccess);
    res.cookie("refreshToken", newRefreshToken, cookieOptionsRefresh);

    res.json({
      success: true,
      accessToken: newAccessToken,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Token refersh failed!",
    });
  }
};

const profile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Loaded user profile",
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      success: false,
      message: "Internall error Occured",
    });
  }
};

const logout = async (req, res) => {
  try {
    res.cookie("token", "", {});
    res.cookie("refreshToken", "", {});

    // remove refreshToken from Database
    await User.updateOne(
      { refreshToken: req.cookies.refreshToken },
      { refreshToken: null }
    );

    res.status(200).json({
      success: true,
      message: "User loggedOut Successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      success: false,
      message: "Intrenall error Occured",
    });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found!",
      });
    }

    const token = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = token;
    user.resetPasswordExpiry = Date.now() + 10 * 60 * 1000;
    user.save();

    // sending the resertpassowrd mail to user
    resetMail(user.email, token);

    res.status(200).json({
      success: true,
      message: "Reset password mail sent!",
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      success: false,
      message: "Intrenall error occured",
    });
  }
};

const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { email, newPassword } = req.body;

  if (!token) {
    return res.status(400).json({
      success: false,
      message: "Invalid or expired token",
    });
  }

  if (!email || !newPassword) {
    return res.status(400).json({
      success: false,
      message: "All fileds are required",
    });
  }

  try {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpiry: { $gt: Date.now() },
    });
    console.log(user);
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found!",
      });
    }

    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiry = undefined;
    user.save();

    res.status(201).json({
      success: true,
      message: "Password reset Successful",
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      success: false,
      messsage: "Internall error Occcured",
    });
  }
};

export {
  registerUser,
  verifyUser,
  login,
  refresh,
  profile,
  logout,
  forgotPassword,
  resetPassword,
};
