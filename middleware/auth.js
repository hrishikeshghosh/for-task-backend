const Ambassdor = require('../models/Ambassdor');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.isAuthenticated = async (req, res, next) => {

    try {
        const { token } = req.cookies;
        if (!token) {
            return res.status(401).json({
                message: "Please login first",
                success: false
            })
        }

        const decoded = await jwt.verify(token, process.env.JWT_SECRET);

        req.user = await Ambassdor.findById(decoded._id) || await User.findById(decoded._id); ;

        next();
    } catch (error) {
        res.status(500).json({
            message: error.message,
            success: false
        })
    }



}