// routes/productRoutes.js
const express = require('express');
const router = express.Router();
const Product = require('../model/Product');
const { auth } = require('../middleware/auth');

// GET /api/products - Fetch all products with tenantId filtering
router.get('/', auth, async (req, res) => {
  try {
    const { search, sortBy, sortOrder = 'asc' } = req.query;
    
    let query = { tenantId: req.user.tenantId }; // 🔥 Filter by tenant
    
    // Search functionality
    if (search) {
      query.product = { $regex: search, $options: 'i' };
    }
    
    // Sort functionality
    let sortOptions = {};
    if (sortBy) {
      sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;
    } else {
      sortOptions.createdAt = -1;
    }
    
    const products = await Product.find(query)
      .sort(sortOptions)
      .lean();
    
    res.json({
      success: true,
      data: products,
      count: products.length
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching products',
      error: error.message
    });
  }
});

// GET /api/products/:id - Get single product by ID
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).lean();
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error fetching product',
      error: error.message
    });
  }
});

// POST /api/products - Create new product
router.post('/', auth, async (req, res) => {
  try {
    const { product, categories } = req.body;
    
    // Validation
    if (!product || !product.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Product name is required'
      });
    }
    
    if (!categories || !Array.isArray(categories) || categories.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one category is required'
      });
    }
    
    // Check if product already exists within tenant
    const existingProduct = await Product.findOne({ 
      product: { $regex: new RegExp(`^${product.trim()}$`, 'i') },
      tenantId: req.user.tenantId // 🔥 Check within tenant
    });
    
    if (existingProduct) {
      return res.status(409).json({
        success: false,
        message: 'Product with this name already exists'
      });
    }
    
    const newProduct = new Product({
      product: product.trim(),
      categories: categories.map(cat => ({
        name: cat.name.trim(),
        price: parseFloat(cat.price),
        stock: parseInt(cat.stock) || 0,
        subcategories: (cat.subcategories || []).map(subcat => ({
          design: subcat.design?.trim() || '',
          color: subcat.color?.trim() || '',
          size: subcat.size?.trim() || '',
          sku: subcat.sku.trim().toUpperCase(),
          stock: parseInt(subcat.stock) || 0
        }))
      })),
      tenantId: req.user.tenantId, // 🔥 Add tenantId from auth
      createdBy: {
        userId: req.user._id,
        name: req.user.name,
        email: req.user.email
      }
    });
    
    const savedProduct = await newProduct.save();
    
    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: savedProduct
    });
    
  } catch (error) {
    console.error('Error creating product:', error);
    
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'Product with this name already exists'
      });
    }
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error creating product',
      error: error.message
    });
  }
});

// PUT /api/products/:id - Update product
router.put('/:id', auth, async (req, res) => {
  try {
    const { product, categories } = req.body;
    
    // Validation
    if (!product || !product.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Product name is required'
      });
    }
    
    if (!categories || !Array.isArray(categories) || categories.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one category is required'
      });
    }
    
    // Check if product exists within tenant
    const existingProduct = await Product.findOne({
      product: { $regex: new RegExp(`^${product.trim()}$`, 'i') },
      tenantId: req.user.tenantId, // 🔥 Check within tenant
      _id: { $ne: req.params.id }
    });
    
    if (existingProduct) {
      return res.status(409).json({
        success: false,
        message: 'Another product with this name already exists'
      });
    }
    
    const updatedProduct = await Product.findOneAndUpdate(
      { 
        _id: req.params.id, 
        tenantId: req.user.tenantId // 🔥 Ensure tenant match
      },
      {
        product: product.trim(),
        categories: categories.map(cat => ({
          name: cat.name.trim(),
          price: parseFloat(cat.price),
          stock: parseInt(cat.stock) || 0,
          subcategories: (cat.subcategories || []).map(subcat => ({
            design: subcat.design?.trim() || '',
            color: subcat.color?.trim() || '',
            size: subcat.size?.trim() || '',
            sku: subcat.sku.trim().toUpperCase(),
            stock: parseInt(subcat.stock) || 0
          }))
        })),
        updatedBy: {
          userId: req.user._id,
          name: req.user.name,
          email: req.user.email
        }
      },
      { new: true, runValidators: true }
    );
    
    if (!updatedProduct) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Product updated successfully',
      data: updatedProduct
    });
    
  } catch (error) {
    console.error('Error updating product:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID'
      });
    }
    
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'Another product with this name already exists'
      });
    }
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error updating product',
      error: error.message
    });
  }
});

// DELETE /api/products/:id - Delete product
router.delete('/:id', auth, async (req, res) => {
  try {
    const deletedProduct = await Product.findOneAndDelete({
      _id: req.params.id,
      tenantId: req.user.tenantId // 🔥 Ensure tenant match
    });
    
    if (!deletedProduct) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Product deleted successfully',
      data: deletedProduct
    });
    
  } catch (error) {
    console.error('Error deleting product:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error deleting product',
      error: error.message
    });
  }
});

// PATCH /api/products/:id/categories - Add category to existing product
router.patch('/:id/categories', async (req, res) => {
  try {
    const { category } = req.body;
    
    if (!category || !category.name || !category.price) {
      return res.status(400).json({
        success: false,
        message: 'Category name and price are required'
      });
    }
    
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      { $push: { categories: category } },
      { new: true, runValidators: true }
    );
    
    if (!updatedProduct) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Category added successfully',
      data: updatedProduct
    });
    
  } catch (error) {
    console.error('Error adding category:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding category',
      error: error.message
    });
  }
});

module.exports = router;
