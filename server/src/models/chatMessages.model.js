const mongoose = require("mongoose");


const { Schema } = mongoose;

const orgSchema = new Schema(
    {
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        text: {
            type: String
        },
        fileLink: {
            type: String
        },
        dontDisplay: [{
            type: Schema.Types.ObjectId,
            ref: "User",
        }]



    },
    {
        timestamps: true
    }
);





module.exports = mongoose.model("chatMessages", orgSchema);
