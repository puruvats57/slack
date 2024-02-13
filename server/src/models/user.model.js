const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require('bcryptjs');

const { Schema } = mongoose;

const userSchema = new Schema(
    {

        email: {
            type: String,
            required: true
        },
        fullName: {
            type: String,
            required: true
        },

        password: {
            type: String,
            required: [true, 'Password is required']
        },
        organizations: [{
            type: Schema.Types.ObjectId,
            ref: "Org",
        }],


        groups: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Groups',
        }],

        friends: [{
            friendId: {
                type: Schema.Types.ObjectId,
                ref: "User",
            },
            messages: [{
                type: mongoose.Schema.Types.ObjectId,
                ref: 'chatMessages',
            }]
        }],
        disconnectedTime: {
            type: Date
        }
    },
    {
        timestamps: true
    }
);

userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();

    this.password = await bcrypt.hash(this.password, 10);
    next();
});

userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            fullName: this.fullName
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    );
};



module.exports = mongoose.model("User", userSchema);
