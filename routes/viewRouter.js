const express = require("express");
const controller = require("../controllers/viewControllers.js");
const router = express.Router();

router.get("/", controller.index);

router.get("/wallet", controller.wallet);

router.get("/transaction", controller.transaction);

router.get("/block", controller.block);

router.get("/search/block", controller.search);

router.get("/search/transaction", controller.search);

router.get("/search/wallet", controller.search);

module.exports = router;
