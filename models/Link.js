const mongoose = require('mongoose');
const LinkSchema = new mongoose.Schema(
  {
    link: {
      type: String,
      required: false,
    },
    pixel: {
      type: String,
      required: false,
    },
    description: {
      type: String,
      required: false,
    },
    short_link: {
      type: String,
      required: false,
    },
    views: {
      type: Number,
      required: false,
      default: 0,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Users',
      required: false
    },
  },
  {
    timestamps: true,
  },
);
module.exports = mongoose.model('Link', LinkSchema);
