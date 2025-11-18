const mongoose = require('mongoose');

// Define product schema (for each product row in the bill)
const productSchema = new mongoose.Schema({


    productId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Product',
        required: true 
    },

    product: String,
    category: String,
    subcategory: { // 🔥 ADD THIS to match product structure
        design: String,
        color: String,
        size: String,
        sku: { type: String } // 🔥 IMPORTANT for inventory
    },
    price: Number,
    discount: Number,
    quantity: Number,
    total: Number
});

// Define bill schema
const billSchema = new mongoose.Schema({
    customerName: { type: String, required: true },
    mobileNumber: { type: String },  // 👈 added field
    products: [productSchema],
    totalAmount: { type: Number, required: true },
    paymentMethod: { type: String, enum: ['Cash', 'Online', 'Card', 'UPI'], required: true },
    date: { type: Date, default: Date.now },
    // 🆕 Add these fields for hybrid control
    
    billType: {
        type: String,
        enum: ["daily", "special"],
        default: "daily",
    },
    occasion: {
        type: String, // e.g. "Diwali Sale", "Independence Day Offer"
        default: "",
    },

    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true  }
}, { timestamps: true }); //to track created/updated dates automatically.

// Create and export the model
module.exports = mongoose.model('Bill', billSchema);

