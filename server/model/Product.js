// models/Product.js
const mongoose = require('mongoose');

const subcategorySchema = new mongoose.Schema({
  design: { type: String }, 
  color: { type: String },  
  size: { type: String },
  sku: { type: String, required: true, unique: true, uppercase: true, trim: true }, 
  stock: { type: Number, required: true } 
});

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true }, //T-shirt for Adult, Kids, Woman
  price: { type: Number, required: true },
  stock: { type: Number, default: 0 },
  subcategories: [subcategorySchema]       // Optional array
  
});

const productSchema = new mongoose.Schema({
  product: { type: String, required: true, unique: true }, //T-shirt
  categories: [categorySchema],
  totalStock: { type: Number }, // Auto-calculated total of category stocks
  createdAt: { type: Date, default: Date.now }
});

// 🔥 AUTO-CALCULATE TOTAL STOCK
productSchema.pre("save", function (next) {
  let totalStock = 0;

  this.categories.forEach(category => {
    // 1. Calculate category stock
    if (category.subcategories?.length > 0) {
      category.stock = category.subcategories.reduce(
        (sum, s) => sum + (s.stock || 0),
        0
      );
    }
    totalStock += category.stock || 0; // 2. Add category stock to total stock
  });
  this.totalStock = totalStock;
  next();
});

// 🔥 AUTO-CALCULATE CATEGORY STOCK FROM SUBCATEGORIES
categorySchema.pre('save', function(next) {
  if (this.subcategories && this.subcategories.length > 0) {
    this.stock = this.subcategories.reduce((sum, subcat) => {
      return sum + (subcat.stock || 0);
    }, 0);
  }
  next();
});


module.exports = mongoose.model("Product", productSchema);
