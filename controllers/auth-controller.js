const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Username, email, and password are required",
      });
    }

    const findUser = await User.findOne({
      $or: [{ username }, { email }],
    });

    if (findUser) {
      return res.status(400).json({
        success: false,
        message: "User with this username or email already exists",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);

    const registerNewUser = await User.create({
      username,
      email,
      password: hashPassword,
    });

    res.status(200).json({
      success: true,
      message: "User registration successful",
      data: {
        _id: registerNewUser._id,
        username: registerNewUser.username,
        email: registerNewUser.email,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while registering user",
    });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const findUser = await User.findOne({ email });

    if (!findUser) {
      return res.status(400).json({
        success: false,
        message: "Cannot find user with a given Email. Please register",
      });
    }

    const checkPassword = await bcrypt.compare(password, findUser.password);

    if (!checkPassword) {
      return res.status(400).json({
        success: false,
        message: "Wrong password. Please try again",
      });
    }

    const generateToken = await jwt.sign(
      {
        _id: findUser._id,
        email: findUser.email,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "30m",
      }
    );

    res.status(200).json({
      success: true,
      message: "User logged successfully",
      generateToken,
      id: findUser._id,
    });
  } catch (error) {
    console.error("Logging error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while logging user",
    });
  }
};

module.exports = { registerUser, loginUser };
