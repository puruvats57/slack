const mongoose = require("mongoose");


const { Schema } = mongoose;

const groupSchema = new Schema(
    {
        type: {
            type: String,
            default: 'group'
        },
        organizationId: {
            type: Schema.Types.ObjectId,
            ref: "Org",
        },
        name: {
            type: String,
            required: true
        },
        admin: {
            type: Schema.Types.ObjectId,
            ref: "User",
        },

        members: [{
            type: Schema.Types.ObjectId,
            ref: "User",
        }],
        messages: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'chatMessages',
        }]



    },
    {
        timestamps: true
    }
);





module.exports = mongoose.model("Groups", groupSchema);
