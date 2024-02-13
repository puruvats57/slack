const mongoose = require("mongoose");


const { Schema } = mongoose;

const orgSchema = new Schema(
    {
        uid: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        msg: [{
            sender: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            },

            messages: [{
                type: mongoose.Schema.Types.ObjectId,
                ref: 'chatMessages',

            }]
        }]



    },
    {
        timestamps: true
    }
);





module.exports = mongoose.model("storeDisconnect", orgSchema);
