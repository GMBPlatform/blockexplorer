const express = require("express");
const controller = require("../controllers/providerControllers.js");
const router = express.Router();

const cors = require("cors");
const corsOptions = {
  origin: "https://gmbplatform.io",
  credentials: true
};

router.post("/init/dashboard", cors(corsOptions), controller.initDashboard);

router.post("/init/block", cors(corsOptions), controller.initBlock);

router.post("/init/transaction", cors(corsOptions), controller.initTransaction);

router.post("/init/ledger", cors(corsOptions), controller.initLedger);

module.exports = router;
