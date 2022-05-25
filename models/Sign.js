const mongoose = require("mongoose");
const SignSchema = new mongoose.Schema({
    network: {
        type: String,
        required: false,
    },
    transactionHash: {
        type: String,
        required: false
    },
    blockNumber: {
        type: String,
        required: false
    },
    cumulativeGasUsed: {
        type: String,
        required: false
    },
    from: {
        type: String,
        required: false
    },
    file: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'File',
        required: false
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users',
        required: false
    },
}, { timestamps: true, strict: false });
module.exports = mongoose.model("Sign", SignSchema);
