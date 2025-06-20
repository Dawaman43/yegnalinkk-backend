require("dotenv").config();
const express = require("express");
const { registerUser, loginUser } = require("../controllers/auth-controller");
const router = express.Router();
const passport = require("passport");
const jwt = require("jsonwebtoken");

router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: `${process.env.CLIENT_URL}/login`,
  }),
  (req, res) => {
    console.log("CLIENT_URL:", process.env.CLIENT_URL); // Should log "http://localhost:5173"
    const user = req.user;
    const token = jwt.sign(
      { _id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );
    res.redirect(`${process.env.CLIENT_URL}/auth/success?token=${token}`);
  }
);

router.post("/register", registerUser);
router.post("/login", loginUser);

module.exports = router;
