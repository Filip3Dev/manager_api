const mongoose = require("mongoose");
const LogSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users',
        required: false
    },
}, { timestamps: true, strict: false });
module.exports = mongoose.model("Log", LogSchema);
