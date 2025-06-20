const Profile = require("../models/Profile");
const cloudinary = require("cloudinary").v2;

const getProfile = async (req, res) => {
  try {
    const profile = await Profile.findOne({ userId: req.params.userId }).select(
      "userId username bio profilePicture publicKey email"
    );
    if (!profile) {
      return res
        .status(404)
        .json({ success: false, message: "Profile not found" });
    }
    res.status(200).json({ success: true, data: profile });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const getAllProfiles = async (req, res) => {
  try {
    const profiles = await Profile.find().select(
      "userId username bio profilePicture publicKey email"
    );
    res.status(200).json({ success: true, data: profiles });
  } catch (error) {
    console.error("Get all profiles error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const createProfile = async (req, res) => {
  try {
    const { username, bio } = req.body;
    const userId = req.userInfo._id;
    const existingProfile = await Profile.findOne({ userId });
    if (existingProfile) {
      return res
        .status(400)
        .json({ success: false, message: "Profile already exists" });
    }

    let profilePicture = null;
    if (req.file) {
      try {
        const result = await cloudinary.uploader.upload(req.file.path, {
          folder: "chat-app/profiles",
          allowed_formats: ["jpg", "jpeg", "png", "gif"],
        });
        profilePicture = result.secure_url;
      } catch (uploadError) {
        console.error("Cloudinary upload error:", uploadError);
        return res.status(500).json({
          success: false,
          message: "Failed to upload profile picture to Cloudinary",
        });
      }
    }

    const profile = new Profile({
      userId,
      username,
      bio,
      profilePicture,
      email: req.userInfo.email, // Include email from token
    });

    await profile.save();
    console.log("Profile created:", profile);
    res.status(201).json({ success: true, data: profile });
  } catch (error) {
    console.error("Create profile error:", error);
    res
      .status(500)
      .json({ success: false, message: error.message || "Server error" });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { username, bio, publicKey } = req.body;
    const userId = req.userInfo._id;

    const existingProfile = await Profile.findOne({ userId });
    if (!existingProfile) {
      return res
        .status(404)
        .json({ success: false, message: "Profile not found" });
    }

    const updateData = {
      username: username || existingProfile.username,
      bio: bio !== undefined ? bio : existingProfile.bio,
      publicKey: publicKey || existingProfile.publicKey,
      profilePicture: existingProfile.profilePicture,
      email: existingProfile.email,
    };

    if (!updateData.username) {
      return res
        .status(400)
        .json({ success: false, message: "Username is required" });
    }

    if (req.file) {
      try {
        const result = await cloudinary.uploader.upload(req.file.path, {
          folder: "chat-app/profiles",
          allowed_formats: ["jpg", "jpeg", "png", "gif"],
        });
        updateData.profilePicture = result.secure_url;
      } catch (uploadError) {
        console.error("Cloudinary upload error:", uploadError);
        return res.status(500).json({
          success: false,
          message: "Failed to upload profile picture to Cloudinary",
        });
      }
    }

    const profile = await Profile.findOneAndUpdate({ userId }, updateData, {
      new: true,
      runValidators: true,
    });
    console.log("Profile updated:", profile);
    res.status(200).json({ success: true, data: profile });
  } catch (error) {
    console.error("Update profile error:", error);
    res
      .status(500)
      .json({ success: false, message: error.message || "Server error" });
  }
};

module.exports = {
  getProfile,
  getAllProfiles,
  createProfile,
  updateProfile,
};
