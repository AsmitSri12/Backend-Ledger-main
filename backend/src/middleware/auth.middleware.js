//its job is to check whether the request is valid or not means the account exists or not
const userModel = require("../models/user.model");
const jwt = require("jsonwebtoken");
const tokenBlackListModel = require("../models/blackList.model");

// this authMiddleware function checks whether token is present in headers/cookies or not
async function authMiddleware(req, res, next) {
  const token = req.cookies?.token || req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      message: "Unauthorized access, token is missing",
    });
  }

  const isBlacklisted = await tokenBlackListModel.findOne({ token })

  if (isBlacklisted) {
    return res.status(401).json({
      message: "Unauthorized access, token is blacklisted",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await userModel.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ message: "Unauthorized access" });
    }
    req.user = user;
    return next();
  } catch (err) {
    return res.status(401).json({
      message: "Unauthorized access, token is missing",
    });
  }
}

async function authSystemUserMiddleware(req, res, next){

  const token = req.cookies?.token || req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      message: "Unauthorized access, token is missing",
    });
  }

 const isBlacklisted = await tokenBlackListModel.findOne({ token });

 if (isBlacklisted) {
   return res.status(401).json({
     message: "Unauthorized access, token is blacklisted",
   });
 }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await userModel.findById(decoded.userId).select("+systemUser");
    if (!user.systemUser) {
      return res.status(403).json({ message: "Forbidden access, not a system user" });
    }
    req.user = user;
    return next();
  } catch (err) {
    return res.status(401).json({
      message: "Unauthorized access, token is invalid",
    });
  }
}

module.exports = {
  authMiddleware,
  authSystemUserMiddleware
}
