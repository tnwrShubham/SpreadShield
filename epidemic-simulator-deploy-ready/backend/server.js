const express = require("express");
const http = require("http");
const path = require("path");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const regionRoutes = require("./routes/regionRoutes");
const edgeRoutes = require("./routes/edgeRoutes");
const simulationRoutes = require("./routes/simulationRoutes");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

app.use(cors());
app.use(express.json());

// Attach io to req so controllers can emit events
app.use((req, _res, next) => {
  req.io = io;
  next();
});

app.use("/api/regions", regionRoutes);
app.use("/api/edges", edgeRoutes);
app.use("/api/simulation", simulationRoutes);

// In production, serve the built React app from this same server
if (process.env.NODE_ENV === "production") {
  const dist = path.join(__dirname, "../frontend/dist");
  app.use(express.static(dist));
  app.get("*", (_req, res) => res.sendFile(path.join(dist, "index.html")));
}

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);
  socket.on("disconnect", () => console.log("Client disconnected:", socket.id));
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => console.error(err));
