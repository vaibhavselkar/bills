//model/Occasion.js
const mongoose = require("mongoose");

const occasionSchema = new mongoose.Schema({
  activeOccasion: { type: String, default: "" },
});

module.exports = mongoose.model("Occasion", occasionSchema);
