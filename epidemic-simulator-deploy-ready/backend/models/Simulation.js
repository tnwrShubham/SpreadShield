const mongoose = require("mongoose");

const SimulationSchema = new mongoose.Schema({
  name: { type: String, default: "Simulation" },
  originRegion: { type: mongoose.Schema.Types.ObjectId, ref: "Region" },
  spreadLog: [
    {
      regionId: { type: mongoose.Schema.Types.ObjectId, ref: "Region" },
      arrivalTime: Number, // Dijkstra distance from origin
      step: Number,
    },
  ],
  connectedComponents: [[String]], // DSU result — list of component groups
  isRunning: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Simulation", SimulationSchema);
