const express = require("express");
const {
  getProfile,
  updateProfile,
  getAllProfiles,
  createProfile,
} = require("../controllers/profile-controller");

const router = express.Router();
const authMiddleware = require("../middleware/auth-middleware");
const profileMiddleware = require("../middleware/profile-middleware");
const { storage } = require("../config/cloudinary");
const multer = require("multer");

const upload = multer({ storage });

router.get("/all", authMiddleware, getAllProfiles);
router.get("/:userId", authMiddleware, getProfile);
router.post(
  "/create",
  authMiddleware,
  profileMiddleware,
  upload.single("profilePicture"),
  createProfile
);
router.put(
  "/:userId",
  authMiddleware,
  profileMiddleware,
  upload.single("profilePicture"),
  updateProfile
);

module.exports = router;
