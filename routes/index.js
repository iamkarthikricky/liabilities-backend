const express = require("express");
const liabilityRoutes = require("./liabilitiesRoutes");


const router = express.Router();

router.use("/", liabilityRoutes);


module.exports = router;
