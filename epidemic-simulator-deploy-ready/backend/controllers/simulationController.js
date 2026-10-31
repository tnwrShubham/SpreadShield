const Region = require("../models/Region");
const Edge = require("../models/Edge");
const Simulation = require("../models/Simulation");
const { buildDSU, areConnected } = require("../algorithms/dsu");
const { dijkstraSpread } = require("../algorithms/dijkstra");

/**
 * POST /api/simulation/run
 * Core endpoint — runs DSU + Dijkstra and returns full simulation result
 *
 * Body: { originRegionId: string }
 */
exports.runSimulation = async (req, res) => {
  try {
    const { originRegionId } = req.body;

    const regions = await Region.find();
    const edges = await Edge.find();

    // --- STEP 1: DSU — find all connected components ---
    const { components } = buildDSU(regions, edges);

    // Map component group indices to region names for response
    const regionMap = new Map(regions.map((r) => [r._id.toString(), r]));
    const namedComponents = components.map((group) =>
      group.map((id) => regionMap.get(id)?.name || id)
    );

    // Check if origin region is valid and not blocked
    const origin = regions.find((r) => r._id.toString() === originRegionId);
    if (!origin) return res.status(404).json({ error: "Origin region not found" });
    if (origin.isBlocked) {
      return res.status(400).json({ error: "Origin region is blocked/quarantined" });
    }

    // --- STEP 2: Dijkstra — compute spread order from origin ---
    const spreadOrder = dijkstraSpread(originRegionId, regions, edges);

    // Save to DB
    const simulation = new Simulation({
      originRegion: originRegionId,
      spreadLog: spreadOrder.map((s) => ({
        regionId: s.regionId,
        arrivalTime: s.arrivalTime,
        step: s.step,
      })),
      connectedComponents: namedComponents,
    });
    await simulation.save();

    // Emit real-time event so all clients update instantly
    req.io.emit("simulation-result", {
      originRegionId,
      originName: origin.name,
      spreadOrder,
      connectedComponents: namedComponents,
      simulationId: simulation._id,
    });

    res.json({
      originName: origin.name,
      spreadOrder,
      connectedComponents: namedComponents,
      totalReachable: spreadOrder.length,
      isolated: regions.filter((r) => !r.isBlocked).length - spreadOrder.length - 1,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * POST /api/simulation/check-connection
 * Uses DSU to check if two regions are still connected
 * (useful after admin blocks routes)
 *
 * Body: { regionA: id, regionB: id }
 */
exports.checkConnection = async (req, res) => {
  try {
    const { regionA, regionB } = req.body;
    const regions = await Region.find();
    const edges = await Edge.find();

    const connected = areConnected(regionA, regionB, regions, edges);
    const rA = regions.find((r) => r._id.toString() === regionA);
    const rB = regions.find((r) => r._id.toString() === regionB);

    res.json({
      regionA: rA?.name,
      regionB: rB?.name,
      connected,
      message: connected
        ? `${rA?.name} and ${rB?.name} are connected — disease can spread.`
        : `${rA?.name} and ${rB?.name} are ISOLATED — spread blocked!`,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * GET /api/simulation/components
 * Returns current DSU components (which regions are in same network)
 */
exports.getComponents = async (req, res) => {
  try {
    const regions = await Region.find();
    const edges = await Edge.find();
    const { components } = buildDSU(regions, edges);

    const regionMap = new Map(regions.map((r) => [r._id.toString(), r]));
    const result = components.map((group, idx) => ({
      componentIndex: idx,
      size: group.length,
      regions: group.map((id) => ({
        id,
        name: regionMap.get(id)?.name,
        status: regionMap.get(id)?.status,
      })),
    }));

    res.json({ totalComponents: result.length, components: result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET all past simulations
exports.getHistory = async (req, res) => {
  try {
    const history = await Simulation.find()
      .populate("originRegion", "name")
      .sort({ createdAt: -1 })
      .limit(10);
    res.json(history);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
