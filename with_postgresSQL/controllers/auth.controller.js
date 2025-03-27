import bcrypt from "bcryptjs";
import crypto from "crypto";
import mail from "../utils/verifyMail.js";
import jwt from "jsonwebtoken";
import forgotMail from "../utils/forgotPassMail.js";

import { PrismaClient } from "@prisma/client";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/generateTokens.js";

const prisma = new PrismaClient();

const registerUser = async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({
      success: false,
      message: "All fields are required",
    });
  }

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    // Hashing the password
    const HashedPassword = await bcrypt.hash(password, 10);
    const token = crypto.randomBytes(32).toString("hex");

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: HashedPassword,
        verificationToken: token,
      },
    });

    // sending the verification mail
    mail(email, token);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      success: false,
      message: "Error while regestring user ",
    });
  }
};

const verifyUser = async (req, res) => {
  const { token } = req.params;
  if (!token) {
    return res.status(400).json({
      success: false,
      message: "No, token found",
    });
  }

  try {
    const user = await prisma.user.findFirst({
      where: { verificationToken: token },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found",
      });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        isVerified: true,
        verificationToken: null,
      },
    });

    res.status(200).json({
      success: true,
      message: "User registered successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      success: false,
      message: `Error while verification: ${error}`,
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
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not exists",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid passsword!",
      });
    }

    if (!user.isVerified) {
      return res.status(400).json({
        success: false,
        message: "The user is not verified yet! Please verify the user",
      });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        refreshToken,
      },
    });

    const cookieOptionAccess = {
      httpOnly: true,
      secure: true,
      maxAge: 2 * 60 * 1000,
    };

    const cookieOptionRefresh = {
      httpOnly: true,
      secure: true,
      maxAge: 24 * 60 * 60 * 1000,
    };

    res.cookie("token", accessToken, cookieOptionAccess);
    res.cookie("refreshToken", refreshToken, cookieOptionRefresh);

    res.status(200).json({
      success: true,
      user: {
        email,
        accessToken,
        refreshToken,
      },
      message: "User logged in successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      success: false,
      message: `Error occured while log in process: ${error}`,
    });
  }
};

const refresh = async (req, res) => {
  try {
    console.log(req.cookies);
    const refreshToken = req.cookies?.refreshToken;

    console.log("Refresh Token found: ", refreshToken ? "YES" : "NO");
    if (!refreshToken) {
      return res.status(403).json({
        success: false,
        message: "Refresh Token required!",
      });
    }

    const user = await prisma.user.findFirst({
      where: { refreshToken },
    });
    if (!user) {
      return res.status(403).json({
        success: false,
        message: "Invalid refresh token",
      });
    }

    const decodedeData = jwt.verify(
      refreshToken,
      process.env.JWT_REFERSH_TOKEN_SECRET
    );
    console.log(decodedeData);
    if (!decodedeData) {
      return res.status(403).json({
        success: false,
        message: "Refresh Token expiried!",
      });
    }

    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        refreshToken: newRefreshToken,
      },
    });

    const cookieOptionAccess = {
      httpOnly: true,
      secure: true,
      maxAge: 2 * 60 * 1000,
    };

    const cookieOptionRefresh = {
      httpOnly: true,
      secure: true,
      maxAge: 24 * 60 * 60 * 1000,
    };

    res.cookie("token", newAccessToken, cookieOptionAccess);
    res.cookie("refreshToken", refreshToken, cookieOptionRefresh);

    res.status(200).json({
      success: true,
      message: "Tokens refreshed successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      success: false,
      message: "Intrenall error occured!",
    });
  }
};

const profile = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "User profile loaded successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(403).json({
      success: false,
      message: "Intrenal error occured",
    });
  }
};

const logout = async (req, res) => {
  try {
    res.cookie("token", "", {});
    res.cookie("refreshToken", "", {});

    // removing refresh token from database
    await prisma.user.update({
      where: { id: req.user.id },
      data: {
        refreshToken: null,
      },
    });

    res.status(200).json({
      success: true,
      message: "User logged out successfully!",
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      success: false,
      message: "Internall error Occired while logout process",
    });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found!",
      });
    }

    // generating resetpassword token
    const token = crypto.randomBytes(32).toString("hex");
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: token,
        passwordResetExpiry: new Date(Date.now() + 10 * 60 * 1000),
      },
    });

    // sedning the mail to user
    forgotMail(user.email, token);

    res.status(200).json({
      success: true,
      message: "Mail to reset passwprd sent to user",
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      success: false,
      message: "Error Occured internally",
    });
  }
};

const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { newPassword } = req.body;
  if (!token) {
    return res.status(400).json({
      success: false,
      message: "Password reset token required",
    });
  }

  if (!newPassword) {
    return res.status(400).json({
      success: false,
      message: "New Password required",
    });
  }

  try {
    const user = await prisma.user.findFirst({
      where: {
        passwordResetToken: token,
        passwordResetExpiry: { gt: new Date() },
      },
    });

    if (!user) {
      return rmSync.status(400).json({
        success: false,
        message: "User not found!",
      });
    }

    const HashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { email: user.email },
      data: {
        password: HashedPassword,
        passwordResetToken: null,
        passwordResetExpiry: null,
      },
    });

    res.status(201).json({
      success: true,
      message: "Password Reset Successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      success: false,
      message: "Error Occured internally",
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
