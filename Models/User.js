const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require("crypto");

require("dotenv").config({path: "../config/config.env"});

const userSchema = new mongoose.Schema({

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
    courses:[
        {
            course:{
                type: String,
            },
            price:{
                type: Number,
            }
        }
    ],

    resetPasswordToken: String,
    resetPasswordExpire: Date,

    verifyEmailToken: String,
    verifyEmialExpire: Date,

});


userSchema.pre("save", async function (next) {
    if (this.isModified("password")){
        this.password = await bcrypt.hash(this.password, 12);
    }
    next();
})

userSchema.methods.matchPassword = async function (password) {
    return await bcrypt.compare(password, this.password);
}

userSchema.methods.generateToken = function () {
    return jwt.sign({_id:this._id}, process.env.JWT_SECRET);
}


userSchema.methods.getVerifyEmail = function () {
    const verifyToken = crypto.randomBytes(20).toString("hex");
    this.verifyEmailToken = crypto.createHash("sha256").update(verifyToken).digest("hex");
    this.verifyEmailToken = Date.now() + 10 * 60 * 1000;

    return verifyToken;
}
userSchema.methods.getResetPasswordToken = function () {
    const resetToken = crypto.randomBytes(20).toString("hex");
    this.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

    return resetToken;
}

module.exports = mongoose.model('User', userSchema);

