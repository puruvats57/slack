const mongoose = require("mongoose");


const { Schema } = mongoose;

const emailSchema = new Schema(
    {

        uuid: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true
        },
        orgId: {
            type: String,
            required: true
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Email", emailSchema);
