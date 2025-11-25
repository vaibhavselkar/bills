const mongoose = require("mongoose");

const occasionSchema = new mongoose.Schema({
  activeOccasion: { type: String, default: "" },
  tenantId: { 
    type: String, 
    required: true,
    index: true 
  },
  createdBy: {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    name: { type: String },
    email: { type: String }
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Ensure one occasion document per tenant
occasionSchema.index({ tenantId: 1 }, { unique: true });

module.exports = mongoose.model("Occasion", occasionSchema);