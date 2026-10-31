const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/simulationController");

router.post("/run", ctrl.runSimulation);
router.post("/check-connection", ctrl.checkConnection);
router.get("/components", ctrl.getComponents);
router.get("/history", ctrl.getHistory);

module.exports = router;
