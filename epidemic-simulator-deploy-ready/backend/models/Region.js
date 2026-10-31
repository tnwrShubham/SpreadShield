const mongoose = require("mongoose");

const RegionSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  population: { type: Number, required: true },
  infected: { type: Number, default: 0 },
  recovered: { type: Number, default: 0 },
  // Status: healthy | infected | quarantined | blocked
  status: {
    type: String,
    enum: ["healthy", "infected", "quarantined", "blocked"],
    default: "healthy",
  },
  // x, y coordinates for canvas rendering (0-1 normalized)
  x: { type: Number, required: true },
  y: { type: Number, required: true },
  isBlocked: { type: Boolean, default: false },
});

module.exports = mongoose.model("Region", RegionSchema);
