const Edge = require("../models/Edge");
const Region = require("../models/Region");

// GET all edges (populated)
exports.getEdges = async (req, res) => {
  try {
    const edges = await Edge.find().populate("from to", "name x y");
    res.json(edges);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST create edge between two regions
exports.createEdge = async (req, res) => {
  try {
    const { from, to, weight } = req.body;
    // Prevent duplicate edges
    const exists = await Edge.findOne({
      $or: [{ from, to }, { from: to, to: from }],
    });
    if (exists) return res.status(400).json({ error: "Edge already exists" });

    const edge = new Edge({ from, to, weight });
    await edge.save();
    const populated = await edge.populate("from to", "name x y");
    req.io.emit("graph-updated", { type: "edge-added", edge: populated });
    res.status(201).json(populated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// PATCH toggle block on an edge (admin closes route)
exports.toggleBlock = async (req, res) => {
  try {
    const edge = await Edge.findById(req.params.id).populate("from to", "name");
    if (!edge) return res.status(404).json({ error: "Edge not found" });

    edge.isBlocked = !edge.isBlocked;
    await edge.save();

    req.io.emit("graph-updated", { type: "edge-toggled", edge });
    res.json(edge);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE an edge
exports.deleteEdge = async (req, res) => {
  try {
    await Edge.findByIdAndDelete(req.params.id);
    req.io.emit("graph-updated", { type: "edge-deleted", id: req.params.id });
    res.json({ message: "Edge deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST seed default edges for demo regions
exports.seedEdges = async (req, res) => {
  try {
    await Edge.deleteMany();
    const regions = await Region.find();
    const rMap = Object.fromEntries(regions.map((r) => [r.name, r._id]));

    const connections = [
      ["Delhi",     "Jaipur",    6],
      ["Delhi",     "Kolkata",   17],
      ["Delhi",     "Mumbai",    22],
      ["Mumbai",    "Pune",      3],
      ["Mumbai",    "Bangalore", 20],
      ["Pune",      "Hyderabad", 10],
      ["Hyderabad", "Bangalore", 10],
      ["Hyderabad", "Chennai",   7],
      ["Bangalore", "Chennai",   6],
      ["Kolkata",   "Hyderabad", 18],
      ["Jaipur",    "Mumbai",    18],
    ];

    const edges = connections
      .filter(([a, b]) => rMap[a] && rMap[b])
      .map(([from, to, weight]) => ({ from: rMap[from], to: rMap[to], weight }));

    const created = await Edge.insertMany(edges);
    res.status(201).json(created);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
