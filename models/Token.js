const mongoose = require("mongoose");
const TokenSchema = new mongoose.Schema({
  tokenType: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  blockNumber: {
    type: Number,
    required: true,
  },
  chain: {
    type: Number,
    required: true,
  },
  txhash: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Users',
    required: false
  },
}, { timestamps: true });
module.exports = mongoose.model("Token", TokenSchema);
