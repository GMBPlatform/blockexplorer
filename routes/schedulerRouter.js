const express = require("express");
const controller = require("../controllers/schedulerControllers.js");
const router = express.Router();

const cors = require("cors");
const corsOptions = {
  origin: "https://www.gmbplatform.io",
  credentials: true
};

router.post("/block", controller.block);

router.post("/transaction", controller.transaction);

router.post("/node", controller.node);

module.exports = router;
