// models/Product.js
const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true }
});

const productSchema = new mongoose.Schema({
    product: { type: String, required: true }, // e.g. "Bag"
    categories: [categorySchema]
    
    //categories: [ { name: String, price: Number}]
});

module.exports = mongoose.model('Product', productSchema);
