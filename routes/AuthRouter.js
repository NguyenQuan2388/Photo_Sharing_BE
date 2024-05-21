const express = require("express");
const User = require("../db/userModel");
const router = express.Router();
const jwt = require("jsonwebtoken");
const { verifyToken } = require("../middleware/auth");
const bcrypt = require("bcrypt");

router.get("/", verifyToken, async (req, res) => {
  console.log(req);
  try {
    const user = await User.findById(req.userId).select("-password");
    if (!user) {
      return res.status(400).json("User not found");
    }
    res.json(user);
  } catch (error) {
    console.log(error);
    res.status(500).json("Internal server error");
  }
});

router.post("/user", async (req, res) => {
  const { login_name, password, confirmPassword, ...rest } = req.body;

  if (!login_name || !password)
    return res.status(400).json("Missing username or password");

  try {
    // Check if user already exists
    const user = await User.findOne({ login_name });

    if (user)
      return res.status(400).json("Username already taken");

    //hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({ login_name, password: hashedPassword, ...rest });
    await newUser.save();

    const accessToken = jwt.sign(
      { userId: newUser._id },
      process.env.ACCESS_TOKEN_SECRET
    );

    res.json(accessToken);
  } catch (error) {
    console.log("Error in Register route: ",error.message);
    res.status(500).json("Internal server error");
  }
});


router.post("/login", async (req, res) => {
  const { login_name, password } = req.body;

  // if (!login_name || !password)
  //   return res.status(400).json("Missing username or password");

  try {
    const user = await User.findOne({ login_name });
    if (!user)
      return res.status(400).json("Incorrect username");

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid)
      return res.status(400).json("Incorrect password");

    const accessToken = jwt.sign(
      { userId: user._id },
      process.env.ACCESS_TOKEN_SECRET
    );

    res.json(accessToken);
  } catch (error) {
    console.log("Error in login route:",error.message);
    res.status(500).json("Internal server error");
  }
});

module.exports = router;