import jwt from "jsonwebtoken";

export const isLoggedIn = async (req, res, next) => {
  try {
    console.log(req.cookies);
    const token = req.cookies?.token;

    console.log("Token Found: ", token ? "YES" : "NO");

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "AUthentication failed: Acess token expired or invalid",
      });
    }

    const decodedData = jwt.verify(token, process.env.JWT_TOKEN_SECRET);
    console.log(decodedData);
    req.user = decodedData;

    next();
  } catch (error) {
    console.log(error);
    return res.status(501).json({
      success: false,
      message: "Intrenall error occured while verfiying",
    });
  }
};
