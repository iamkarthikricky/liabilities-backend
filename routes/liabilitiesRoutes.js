const express = require("express");
const { postLiability, getLiabilities} = require("../controllers/LiabilitiesController");

const router = express.Router();

router.post("/addloan", postLiability);
router.get("/getAllLoans", getLiabilities);


module.exports = router;