const mongoose = require("mongoose");

const waterSchema = new mongoose.Schema({
  userId: String,
  date: String,
  water: {
    type: Number,
    default: 0,
  },
});

module.exports = mongoose.model("Water", waterSchema);