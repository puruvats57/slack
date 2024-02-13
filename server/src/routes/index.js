const express = require("express");
const { userRoutes } = require("../modules/users");
const { orgRoutes } = require("../modules/organization");


const router = express.Router();

router.use("/user", userRoutes);
router.use("/organization", orgRoutes);


module.exports = router;
