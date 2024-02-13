const mongoose = require("mongoose");


const { Schema } = mongoose;

const orgSchema = new Schema(
    {
        uid: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        group: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Groups',
        },

        messages: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'chatMessages',

        }]




    },
    {
        timestamps: true
    }
);





module.exports = mongoose.model("groupCount", orgSchema);
