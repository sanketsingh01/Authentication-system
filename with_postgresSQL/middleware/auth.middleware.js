import jwt from "jsonwebtoken";

const isLoggedIn = async (req, res, next) => {
  try {
    console.log(req.cookies);
    const token = req.cookies?.token;

    console.log("Token Found: ", token ? "YES" : "NO");

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Authentication failed: Token is invalid or expired",
      });
    }

    const decodedeData = jwt.verify(token, process.env.JWT_ACCESS_TOKEN_SECRET);
    console.log(decodedeData);
    req.user = decodedeData;

    next();
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      success: false,
      message: "Erro while returning ",
    });
  }
};

export default isLoggedIn;
