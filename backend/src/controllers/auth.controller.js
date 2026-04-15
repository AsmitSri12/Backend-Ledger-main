const userModel = require("../models/user.model");
const jwt = require("jsonwebtoken");
const emailService = require("../services/email.service");
const tokenBlackListModel = require("../models/blackList.model");

/**
 * - User register controller
 * - POST /api/auth/register
 */
async function userRegisterController(req, res) {
  const { email, password, name } = req.body;

  const isExists = await userModel.findOne({
    email: email,
  });

  if (isExists) {
    return res.status(422).json({
      message: "User account already exists with this email.",
      status: "Failed",
    });
  }

  const user = await userModel.create({
    email,
    password,
    name,
  });

  const token = jwt.sign(
    {
      userId: user._id,
    },
    process.env.JWT_SECRET,
    { expiresIn: "3d" },
  );

  const cookieOptions = {
    expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict"
  };

  res.cookie("token", token, cookieOptions);

  try {
    await emailService.sendRegistrationEmail(user.email, user.name);
  } catch (error) {
    console.error("Email sending failed:", error);
  }

  res.status(201).json({
    user: {
      _id: user._id,
      email: user.email,
      name: user.name,
    },
    token,
  });
}

/**
 * - User login controller
 * - POST /api/auth/login
 */
async function userLoginController(req, res) {
  const { email, password } = req.body;

  const user = await userModel.findOne({ email }).select("+password");

  if (!user) {
        return res.status(401).json({
            message: "Email or Password is Invalid."
        })
  }
  const isValidPassword = await user.comparePassword(password);

  if (!isValidPassword) {
      return res.status(401).json({
        message: "Email or Password is Invalid.",
      })
  }

  const token = jwt.sign(
    {
      userId: user._id,
    },
    process.env.JWT_SECRET,
    { expiresIn: "3d" },
  );

  const cookieOptions = {
    expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict"
  };

  res.cookie("token", token, cookieOptions);

  res.status(200).json({
    user: {
      _id: user._id,
      email: user.email,
      name: user.name,
    },
    token,
  });
}

/**
 * - User logout controller
 * - POST /api/auth/logout
 */
async function userLogoutController(req, res) {
  const token = req.cookies.token || req.headers.authorization?.split(" ")[1]

  if (!token) {
    return res.status(400).json({
      message: "Token is missing",
    });
  }
  res.clearCookie("token")

  await tokenBlackListModel.create({
    token: token
  })

  res.status(200).json({
    message: "Logged out successfully",
  })
}
 

module.exports = {
  userRegisterController,
  userLoginController,
  userLogoutController
}
