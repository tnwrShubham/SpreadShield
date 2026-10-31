const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/regionController");

router.get("/", ctrl.getRegions);
router.post("/", ctrl.createRegion);
router.post("/seed", ctrl.seedRegions);
router.patch("/:id/toggle-block", ctrl.toggleBlock);
router.delete("/:id", ctrl.deleteRegion);

module.exports = router;
