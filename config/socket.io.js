const http = require("http");
const { Server } = require("socket.io");
const {
  sendMessage,
  addReaction,
} = require("../controllers/message-controller");
const message = require("../models/message");
const { json } = require("stream/consumers");

function setupSocket(socket) {
  const io = new Server(socket, {
    cors: {
      origin: "*",
      methods: ["GET", "POST", "PUT"],
      credentials: true,
    },
  });

  io.connectedUsers = new Set();

  io.on("connection", (socket) => {
    const userId = socket.handshake.query.id;
    if (userId && userId !== "null" && userId !== "undefined") {
      socket.join(userId);
      io.connectedUsers.add(userId);
      io.emit("userOnline", { userId });
      console.log(`User ${userId} connected`, socket.id);
    } else {
      console.log(`Connection failed: Invalid userId (${userId})`, socket.id);
      socket.emit("connectionError", { message: "Invalid userId" });
      return;
    }

    socket.on("sendMessage", async (data, callback) => {
      const req = { body: data, userinfo: { _id: data.senderId } };
      const res = {
        status: (code) => ({
          json: (response) => {
            callback?.(response);
            socket.emit("messageStatus", response);
            if (response.success) {
              io.to(data.receiverId).emit("receiverMessage", response.data);
              socket.emit("receiverMessage", response.data);
            }
          },
        }),
      };

      console.log("Message received:", data);

      try {
        await sendMessage(req, res);
      } catch (error) {
        console.error("Error in sendMessage handler:", error);
        callback?.({ success: false, message: "server error" });
      }
    });

    socket.on("typing", ({ userId, receiverId }) => {
      socket.to(receiverId).emit("typing", { userId });
    });

    socket.on("messageRead", async ({ messageId, senderId, receiverId }) => {
      try {
        await message.updateOne(
          { _id: messageId, senderId, receiverId },
          { status: true }
        );

        io.to(senderId).emit("messageRead", { messageId });
      } catch (error) {
        console.error("Message read error:", error);
      }
    });

    socket.on("addReaction", async (data, callback) => {
      const req = { body: data };
      const res = {
        status: (code) => ({
          json: (response) => {
            callback?.(response);
            if (response.success) {
              io.to(data.userId).emit("reactionAdded", response.data);
              io.to(data.receiverId || data.senderId).emit(
                "reactionAdded",
                response.data
              );
            }
          },
        }),
      };

      try {
        await addReaction(req, res);
      } catch (error) {
        console.error("Error in addReaction handler: ", error);
        callback?.({ success: false, message: "server error" });
      }
    });

    socket.on("messageDeleted", ({ messageId, receiverId }) => {
      socket.to(receiverId).emit("messageDeleted", { messageId });
    });

    socket.on("chatDeleted", ({ receiverId, senderId }) => {
      socket.to(receiverId).emit("chatDeleted", { senderId });
    });

    socket.on("disconnect", () => {
      if (userId) {
        io.connectedUsers.delete(userId);
        io.emit("userOffline", { userId });
        console.log(`User ${userId} disconnected`);
      }
    });
  });

  return io;
}

module.exports = setupSocket;
