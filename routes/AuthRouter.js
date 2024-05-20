const express = require("express");
const User = require("../db/userModel");
const router = express.Router();
const argon2 = require("argon2");
const jwt = require("jsonwebtoken");
const { verifyToken } = require("../middleware/auth");

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
  const { login_name, password, ...rest } = req.body;

  if (!login_name || !password)
    return res
      .status(400)
      .json("Missing username and/or password");

  try {
    // Check for existing user
    const user = await User.findOne({ login_name });
    console.log("user", user);

    if (user)
      return res
        .status(400)
        .json("Username already taken");

    const hashedPassword = await argon2.hash(password);
    const newUser = new User({ login_name, password: hashedPassword, ...rest });
    await newUser.save();

    // Return token
    const accessToken = jwt.sign(
      { userId: newUser._id },
      process.env.ACCESS_TOKEN_SECRET
    );

    res.json(accessToken);
  } catch (error) {
    console.log(error);
    res.status(500).json("Internal server error");
  }
});


router.post("/login", async (req, res) => {
  const { login_name, password } = req.body;

  if (!login_name || !password)
    return res.status(400).json("Missing username and/or password");

  try {
    const user = await User.findOne({ login_name });
    if (!user)
      return res.status(400).json("Incorrect username");

    const passwordValid = await argon2.verify(user.password, password);
    if (!passwordValid)
      return res.status(400).json("Incorrect username or password");

    const accessToken = jwt.sign(
      { userId: user._id },
      process.env.ACCESS_TOKEN_SECRET
    );

    res.json(accessToken);
  } catch (error) {
    console.log(error);
    res.status(500).json("Internal server error");
  }
});

module.exports = router;