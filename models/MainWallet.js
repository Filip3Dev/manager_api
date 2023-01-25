const mongoose = require("mongoose");
const MainWalletSchema = new mongoose.Schema({
  network: {
    type: Number,
    required: true,
  },
  address: {
    type: String,
    required: true
  },
  privateKey: {
    type: String,
    required: true
  },
  index: {
    type: Number,
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
module.exports = mongoose.model("MainWallet", MainWalletSchema);
