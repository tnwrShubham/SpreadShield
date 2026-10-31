const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/edgeController");

router.get("/", ctrl.getEdges);
router.post("/", ctrl.createEdge);
router.post("/seed", ctrl.seedEdges);
router.patch("/:id/toggle-block", ctrl.toggleBlock);
router.delete("/:id", ctrl.deleteEdge);

module.exports = router;
