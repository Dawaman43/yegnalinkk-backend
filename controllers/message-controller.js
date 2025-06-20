const Message = require("../models/message");
const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const sendMessage = async (req, res) => {
  try {
    const { content, encryptedAesKey, senderId, receiverId, attachments } =
      req.body;
    if (!senderId || !receiverId || (!content && !attachments)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid message data" });
    }
    const message = await Message.create({
      messageId: uuidv4(),
      senderId,
      receiverId,
      content: content || "",
      encryptedAesKey,
      attachments: attachments || [],
      status: false,
      createdAt: new Date(),
    });
    res.status(201).json({ success: true, data: message });
  } catch (error) {
    console.error("Send message error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const getMessages = async (req, res) => {
  try {
    const { senderId, receiverId } = req.params;
    if (
      !mongoose.Types.ObjectId.isValid(senderId) ||
      !mongoose.Types.ObjectId.isValid(receiverId)
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid user IDs" });
    }
    const messages = await Message.find({
      $or: [
        { senderId, receiverId },
        { senderId: receiverId, receiverId: senderId },
      ],
    }).sort({ createdAt: 1 });
    res.status(200).json({ success: true, data: messages });
  } catch (error) {
    console.error("Get messages error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const addReaction = async (req, res) => {
  try {
    const { messageId, userId, emoji } = req.body;
    if (!messageId || !userId || !emoji) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid reaction data" });
    }
    const message = await Message.findOne({ messageId });
    if (!message) {
      return res
        .status(404)
        .json({ success: false, message: "Message not found" });
    }
    const reactions = message.reactions || [];
    const existingReaction = reactions.find((r) => r.userId === userId);
    if (existingReaction) {
      existingReaction.emoji = emoji;
    } else {
      reactions.push({ userId, emoji });
    }
    message.reactions = reactions;
    await message.save();
    res.status(200).json({ success: true, data: { messageId, reactions } });
  } catch (error) {
    console.error("Add reaction error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.userInfo._id;
    const message = await Message.findOne({ messageId, senderId: userId });
    if (!message) {
      return res
        .status(404)
        .json({ success: false, message: "Message not found or unauthorized" });
    }
    await Message.deleteOne({ messageId });
    res.status(200).json({ success: true, message: "Message deleted" });
  } catch (error) {
    console.error("Delete message error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const deleteChat = async (req, res) => {
  try {
    const { senderId, receiverId } = req.params;
    if (
      !mongoose.Types.ObjectId.isValid(senderId) ||
      !mongoose.Types.ObjectId.isValid(receiverId)
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid user IDs" });
    }
    if (senderId !== req.userInfo._id.toString()) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }
    await Message.deleteMany({
      $or: [
        { senderId, receiverId },
        { senderId: receiverId, receiverId: senderId },
      ],
    });
    res.status(200).json({ success: true, message: "Chat deleted" });
  } catch (error) {
    console.error("Delete chat error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = {
  sendMessage,
  getMessages,
  addReaction,
  deleteMessage,
  deleteChat,
};
