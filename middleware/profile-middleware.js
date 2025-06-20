const profileMiddleware = (req, res, next) => {
  try {
    if (!req.userInfo?._id) {
      return res.status(401).json({
        success: false,
        message: "Invalid user information in token",
      });
    }
    const userIdFromToken = req.userInfo._id.toString();
    const userIdFromParams = req.params?.userId?.toString();
    const userIdFromBody = req.body?.userId?.toString();

    if (!userIdFromParams && !userIdFromBody) {
      return next();
    }

    if (
      (userIdFromParams && userIdFromToken !== userIdFromParams) ||
      (userIdFromBody && userIdFromToken !== userIdFromBody)
    ) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to access or modify this profile",
      });
    }

    next();
  } catch (error) {
    console.error("Profile middleware error:", {
      message: error.message,
      stack: error.stack,
    });
    res.status(500).json({
      success: false,
      message: "Internal server error in profile middleware",
    });
  }
};

module.exports = profileMiddleware;
