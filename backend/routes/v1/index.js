const express = require("express");
const memeRoute = require("./asset.route");

const router = express.Router();

router.use('/',memeRoute);


module.exports = router;

