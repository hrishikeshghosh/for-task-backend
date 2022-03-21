const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require("crypto");

require("dotenv").config({path: "../config/config.env"});

const ambassdorSchema = new mongoose.Schema({

    name: {
        type: String,
        required: true
    },
    avatar: {
        public_id: String,
        url: String
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
        minlength: 8,
        select: false,
    },


    resetPasswordToken: String,
    resetPasswordExpire: Date,

    verifyEmailToken: String,
    verifyEmialExpire: Date,

});


ambassdorSchema.pre("save", async function (next) {
    if (this.isModified("password")){
        this.password = await bcrypt.hash(this.password, 12);
    }
    next();
})

ambassdorSchema.methods.matchPassword = async function (password) {
    return await bcrypt.compare(password, this.password);
}

ambassdorSchema.methods.generateToken = function () {
    return jwt.sign({_id:this._id}, process.env.JWT_SECRET);
}


ambassdorSchema.methods.getVerifyEmail = function () {
    const verifyToken = crypto.randomBytes(20).toString("hex");
    this.verifyEmailToken = crypto.createHash("sha256").update(verifyToken).digest("hex");
    this.verifyEmailToken = Date.now() + 10 * 60 * 1000;

    return verifyToken;
}
ambassdorSchema.methods.getResetPasswordToken = function () {
    const resetToken = crypto.randomBytes(20).toString("hex");
    this.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

    return resetToken;
}

module.exports = mongoose.model('Ambassdor', ambassdorSchema);

