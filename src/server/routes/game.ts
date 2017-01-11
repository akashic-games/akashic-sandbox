import express = require("express");
import controller = require("../controller/game");
var router = express.Router();

router.get("/", <express.RequestHandler>controller);

module.exports = router;
