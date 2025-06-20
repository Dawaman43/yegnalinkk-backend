const mongoose = require("mongoose");

const profileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    username: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 20,
    },
    bio: { type: String, trim: true, maxlength: 200 },
    profilePicture: { type: String, trim: true },
    profilePictureId: { type: String, default: null },
    publicKey: { type: String, trim: true },
    email: { type: String, trim: true }, // Added email field
  },
  { timestamps: true }
);

module.exports = mongoose.model("Profile", profileSchema);
