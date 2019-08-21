const express = require("express");
const controller = require("../controllers/walletControllers.js");
const router = express.Router();

const cors = require("cors");
const corsOptions = {
  origin: "https://gmbplatform.io",
  credentials: true
};

module.exports = router;

router.post("/page/generate", cors(corsOptions), controller.generatePage);

router.post("/api/generate", cors(corsOptions), controller.generateApi);

router.post("/page/information", cors(corsOptions), controller.informationPage);

router.post("/api/information", cors(corsOptions), controller.informationApi);

router.post("/page/load/keyfile", cors(corsOptions), controller.loadKeyfilePage);

router.post("/api/load/keyfile", cors(corsOptions), controller.loadKeyfileApi);

router.post("/page/load/direct", cors(corsOptions), controller.loadDirectPage);

router.post("/api/load/direct", cors(corsOptions), controller.loadDirectApi);

router.post("/page/transaction/transfer", cors(corsOptions), controller.transactionTransferPage);

router.post("/api/transaction/transfer", cors(corsOptions), controller.transactionTransferApi);

router.post("/api/balance", cors(corsOptions), controller.balanceApi);

router.post("/api/ledger", cors(corsOptions), controller.ledgerApi);
