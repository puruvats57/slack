const jwt = require('jsonwebtoken');
const User = require("../models/user.model.js");

// Middleware to verify JWT token
const verifyJWT = async (req, res, next) => {
    try {
        const token = req.header("Authorization")?.replace("Bearer ", "");
        
        //const token = req.cookies.accessToken;


        if (!token) {
            res.status(401).json({ success: false, msg: "Token not found" });
            return;
        }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        const user = await User.findById(decodedToken?._id).select("-password");

        if (!user) {
            res.status(401).json({ success: false, msg: "User not found" });
            return;
        }

        // If the execution reaches here, the token is valid
        req.user = user;
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            res.status(401).json({ success: false, msg: "Token has expired" });
        } else {
            res.status(401).json({ success: false, msg: error?.message || "Invalid access token" });
        }
    }
};


module.exports = verifyJWT;
