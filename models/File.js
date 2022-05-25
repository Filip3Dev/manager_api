const mongoose = require("mongoose");
const FileSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    size: {
        type: Number,
        required: true
    },
    checksum: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        required: true,
    },
    hash: {
        type: String,
        required: false
    },
    hash_nft: {
        type: String,
        required: false
    },
    signed: {
        type: Boolean,
        default: false,
        required: false
    },
    signature: {
        type: String,
        required: false
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users',
        required: false
    },
}, { timestamps: true });
module.exports = mongoose.model("File", FileSchema);
