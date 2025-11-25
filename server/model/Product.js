// models/Product.js - Updated with multi-tenancy
const mongoose = require('mongoose');

const subcategorySchema = new mongoose.Schema({
  design: { type: String, trim: true }, 
  color: { type: String, trim: true },  
  size: { type: String, trim: true },
  sku: { 
    type: String, 
    required: true, 
    uppercase: true, 
    trim: true 
  }, 
});

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true }, 
  price: { type: Number, required: true, min: 0 },
  stock: { type: Number, default: 0, min: 0 },
  subcategories: [subcategorySchema]       
});

const productSchema = new mongoose.Schema({
  product: { 
    type: String, 
    required: true, 
    trim: true 
  }, 
  categories: {
    type: [categorySchema],
    validate: {
      validator: function(v) {
        return v && v.length > 0;
      },
      message: 'At least one category is required'
    }
  },
  totalStock: { type: Number, default: 0 }, 
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
  updatedBy: {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    name: { type: String },
    email: { type: String }
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Compound index for product name uniqueness within tenant
productSchema.index({ product: 1, tenantId: 1 }, { unique: true });

// AUTO-CALCULATE TOTAL STOCK
productSchema.pre("save", function (next) {
  let totalStock = 0;

  this.categories.forEach(category => {
    // Calculate category stock from subcategories
    if (category.subcategories && category.subcategories.length > 0) {
      const subcategoriesTotal = category.subcategories.reduce(
        (sum, s) => sum + (s.stock || 0),
        0
      );
      // Category stock is sum of its base stock + all subcategories
      category.stock = (category.stock || 0) + subcategoriesTotal;
    }
    totalStock += category.stock || 0;
  });
  
  this.totalStock = totalStock;
  this.updatedAt = new Date();
  next();
});

// Virtual for formatted creation date
productSchema.virtual('formattedCreatedAt').get(function() {
  return this.createdAt.toLocaleDateString();
});

productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model("Product", productSchema);