const express = require("express");
const {
  sendMessage,
  getMessages,
  addReaction,
  deleteMessage,
  deleteChat,
} = require("../controllers/message-controller");
const authMiddleware = require("../middleware/auth-middleware");

const router = express.Router();

router.post("/send", authMiddleware, sendMessage);
router.get("/:senderId/:receiverId", authMiddleware, getMessages);
router.post("/reaction", authMiddleware, addReaction);
router.delete("/:messageId", authMiddleware, deleteMessage);
router.delete("/chat/:senderId/:receiverId", authMiddleware, deleteChat);

module.exports = router;
