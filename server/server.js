const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    credentials: true,
  },
});

// Store user names with socket IDs (for later use if needed)
let userNames = {};

io.on("connection", (socket) => {
  console.log("A new user has connected", socket.id);

  // Listen for the user to send their name on connection (could be done at any point, like on message send)
  socket.on("setUsername", (username) => {
    userNames[socket.id] = username; // Save username by socket ID
    console.log(`${username} has connected.`);
  });

  // Listen for incoming messages from clients
  socket.on("message", (message) => {
    // Attach the user's name to the message if available
    const username = userNames[socket.id] || "Anonymous"; // Default to "Anonymous" if no name set
    io.emit("message", { text: message.text, timestamp: message.timestamp, userId: message.userId, username });
  });

  // Handle disconnections
  socket.on("disconnect", () => {
    console.log(socket.id, " disconnected");
    delete userNames[socket.id]; // Clean up user on disconnect
  });
});

server.listen(5000, () => {
  console.log("Server is running on port 5000");
});
