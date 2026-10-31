const Region = require("../models/Region");

// GET all regions
exports.getRegions = async (req, res) => {
  try {
    const regions = await Region.find();
    res.json(regions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST create a region
exports.createRegion = async (req, res) => {
  try {
    const region = new Region(req.body);
    await region.save();
    req.io.emit("graph-updated", { type: "region-added", region });
    res.status(201).json(region);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// PATCH toggle block/quarantine on a region
exports.toggleBlock = async (req, res) => {
  try {
    const region = await Region.findById(req.params.id);
    if (!region) return res.status(404).json({ error: "Region not found" });

    region.isBlocked = !region.isBlocked;
    region.status = region.isBlocked ? "blocked" : "healthy";
    await region.save();

    req.io.emit("graph-updated", { type: "region-toggled", region });
    res.json(region);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE a region
exports.deleteRegion = async (req, res) => {
  try {
    await Region.findByIdAndDelete(req.params.id);
    req.io.emit("graph-updated", { type: "region-deleted", id: req.params.id });
    res.json({ message: "Region deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST seed default regions (for demo)
exports.seedRegions = async (req, res) => {
  try {
    await Region.deleteMany();
    const defaultRegions = [
      { name: "Delhi",     population: 3200000, x: 0.45, y: 0.30 },
      { name: "Mumbai",    population: 2100000, x: 0.25, y: 0.55 },
      { name: "Kolkata",   population: 1500000, x: 0.72, y: 0.42 },
      { name: "Chennai",   population: 1100000, x: 0.48, y: 0.78 },
      { name: "Bangalore", population: 1300000, x: 0.40, y: 0.72 },
      { name: "Hyderabad", population: 1000000, x: 0.45, y: 0.62 },
      { name: "Pune",      population:  700000, x: 0.28, y: 0.60 },
      { name: "Jaipur",    population:  600000, x: 0.35, y: 0.28 },
    ];
    const regions = await Region.insertMany(defaultRegions);
    res.status(201).json(regions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
