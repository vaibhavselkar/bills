// routes/productRoutes.js
const express = require('express');
const router = express.Router();
const Product = require('../model/Product');
const {auth}  = require("../middleware/auth");

// Get all products
// GET all products with categories
router.get('/',  async (req, res) => {
  try {
    const products = await Product.find(); // Your schema
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});



router.post('/', auth, async (req, res) => {
  const { product, categories } = req.body; // categories = [{ name, price }]
  if (!product || !Array.isArray(categories)) {
    return res.status(400).json({ error: 'Product and categories are required' });
  }

  let existingProduct = await Product.findOne({ product });

  if (existingProduct) {
    // Append new categories to the existing one
    existingProduct.categories.push(...categories);
    await existingProduct.save();
    res.status(200).json({ message: 'Category added to existing product', product: existingProduct });
  } else {
    // Create a new product with categories
    const newProduct = new Product({ product, categories });
    await newProduct.save();
    res.status(201).json({ message: 'New product created', product: newProduct });
  }
});

// PUT /api/products/:productId
router.put('/:productId', auth, async (req, res) => {
  try {
    const { product } = req.body;
    const updated = await Product.findByIdAndUpdate(
      req.params.productId,
      { product },
      { new: true }
    );

    if (!updated) return res.status(404).json({ message: 'Product not found' });

    res.json({ message: 'Product name updated', product: updated });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update product name' });
  }
});




// ✅ Update a category by index
router.put('/:productId/category/:index', auth, async (req, res) => {
  const { productId, index } = req.params;
  const { name, price } = req.body;

  try {
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    if (!product.categories[index]) {
      return res.status(404).json({ message: 'Category index not found' });
    }

    product.categories[index].name = name;
    product.categories[index].price = price;
    await product.save();

    res.json(product);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update category', error: err.message });
  }
});

// ✅ Delete a category by index
router.delete('/:productId/category/:index', auth, async (req, res) => {
  const { productId, index } = req.params;

  try {
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    if (!product.categories[index]) {
      return res.status(404).json({ message: 'Category index not found' });
    }

    product.categories.splice(index, 1);

    // If no categories left, delete product
    if (product.categories.length === 0) {
      await Product.findByIdAndDelete(productId);
      return res.json({ message: 'Product deleted because it had no more categories' });
    }

    await product.save();
    res.json({ message: 'Category deleted', product });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete category', error: err.message });
  }
});


module.exports = router;
