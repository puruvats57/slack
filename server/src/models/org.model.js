const mongoose = require("mongoose");


const { Schema } = mongoose;

const orgSchema = new Schema(
    {

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
        }]



    },
    {
        timestamps: true
    }
);





module.exports = mongoose.model("Org", orgSchema);
