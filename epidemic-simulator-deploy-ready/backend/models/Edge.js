const mongoose = require("mongoose");

// Edge = road/route between two regions
// weight = travel time or infection spread speed (lower = faster spread)
const EdgeSchema = new mongoose.Schema({
  from: { type: mongoose.Schema.Types.ObjectId, ref: "Region", required: true },
  to: { type: mongoose.Schema.Types.ObjectId, ref: "Region", required: true },
  weight: { type: Number, required: true, min: 1 }, // travel time in hours
  isBlocked: { type: Boolean, default: false },      // admin can block routes
});

module.exports = mongoose.model("Edge", EdgeSchema);
