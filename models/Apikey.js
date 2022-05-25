const mongoose = require("mongoose");
const ApikeySchema = new mongoose.Schema({
    network: {
        type: String,
        required: true,
    },
    title: {
        type: String,
        required: true
    },
    api_key: {
        type: String,
        required: true
    },
    status: {
        type: Boolean,
        default: true,
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users',
        required: true
    },
}, { timestamps: true });
module.exports = mongoose.model("Apikey", ApikeySchema);
