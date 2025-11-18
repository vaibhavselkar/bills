import React, { useState, useEffect } from 'react';
import '../styles/ProductManagement.css';

const ProductManagement = () => {
  // State management
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  
  // Form states
  const [productForm, setProductForm] = useState({
    product: '',
    categories: []
  });
  
  const [currentCategory, setCurrentCategory] = useState({
    name: '',
    price: 0,
    stock: 0,
    subcategories: []
  });
  
  const [currentSubcategory, setCurrentSubcategory] = useState({
    design: '',
    color: '',
    size: '',
    sku: '',
    stock: 0
  });

  // Category editing states
  const [selectedCategoryIndex, setSelectedCategoryIndex] = useState(null);
  const [isEditingCategory, setIsEditingCategory] = useState(false);

  // Capitalize text function
  const capitalizeText = (text) => {
    if (!text) return '';
    return text.replace(/\w\S*/g, (txt) => 
      txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    );
  };

  // Auto-generate SKU function
  const generateSKU = (design, color, size) => {
    const designPart = design ? design.replace(/\s+/g, '-').toUpperCase() : '';
    const colorPart = color ? color.replace(/\s+/g, '-').toUpperCase() : '';
    const sizePart = size ? size.toUpperCase() : '';
    
    if (!designPart && !colorPart && !sizePart) return '';
    
    return `${designPart}-${colorPart}-${sizePart}`;
  };

  // Auto-update SKU when design, color, or size changes
  useEffect(() => {
    const sku = generateSKU(currentSubcategory.design, currentSubcategory.color, currentSubcategory.size);
    setCurrentSubcategory(prev => ({
      ...prev,
      sku: sku
    }));
  }, [currentSubcategory.design, currentSubcategory.color, currentSubcategory.size]);

  // Load products on component mount
  useEffect(() => {
    fetchProducts();
  }, []);

  // Fetch all products
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://billing-app-server.vercel.app/api/products');
      if (response.ok) {
        const result = await response.json();
        
        if (result.data && Array.isArray(result.data)) {
          setProducts(result.data);
        } else if (Array.isArray(result)) {
          setProducts(result);
        } else {
          console.error('Unexpected API response format:', result);
          setProducts([]);
        }
      } else {
        console.error('Failed to fetch products:', response.status);
        setProducts([]);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      alert('Error fetching products');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle product form input changes
  const handleProductChange = (e) => {
    const { name, value } = e.target;
    setProductForm(prev => ({
      ...prev,
      [name]: capitalizeText(value)
    }));
  };

  // Handle category form input changes
  const handleCategoryChange = (e) => {
    const { name, value } = e.target;
    setCurrentCategory(prev => ({
      ...prev,
      [name]: name === 'price' || name === 'stock' ? Number(value) : capitalizeText(value)
    }));
  };

  // Handle subcategory form input changes
  const handleSubcategoryChange = (e) => {
    const { name, value } = e.target;
    const processedValue = name === 'stock' ? Number(value) : 
                          name === 'design' || name === 'color' || name === 'size' ? 
                          capitalizeText(value) : value;
    
    setCurrentSubcategory(prev => ({
      ...prev,
      [name]: processedValue
    }));
  };

  // Check if subcategory already exists in current category
  const isSubcategoryExists = (design, color, size) => {
    return currentCategory.subcategories.some(subcat => 
      subcat.design === design && 
      subcat.color === color && 
      subcat.size === size
    );
  };

  // Add subcategory to current category
  const addSubcategory = () => {
    if (!currentSubcategory.design || !currentSubcategory.color || !currentSubcategory.size) {
      alert('Design, Color, and Size are required for subcategory');
      return;
    }

    // Check if similar subcategory already exists
    if (isSubcategoryExists(currentSubcategory.design, currentSubcategory.color, currentSubcategory.size)) {
      alert('A subcategory with same Design, Color, and Size already exists in this category!');
      return;
    }

    // Auto-generate SKU if empty
    const finalSku = currentSubcategory.sku || generateSKU(
      currentSubcategory.design, 
      currentSubcategory.color, 
      currentSubcategory.size
    );

    const newSubcategory = {
      ...currentSubcategory,
      sku: finalSku
    };

    setCurrentCategory(prev => ({
      ...prev,
      subcategories: [...prev.subcategories, newSubcategory]
    }));

    // Reset subcategory form
    setCurrentSubcategory({
      design: '',
      color: '',
      size: '',
      sku: '',
      stock: 0
    });
  };

  // Remove subcategory from current category
  const removeSubcategory = (index) => {
    setCurrentCategory(prev => ({
      ...prev,
      subcategories: prev.subcategories.filter((_, i) => i !== index)
    }));
  };

  // Check if category already exists in product
  const isCategoryExists = (categoryName) => {
    return productForm.categories.some(cat => 
      cat.name.toLowerCase() === categoryName.toLowerCase()
    );
  };

  // Add category to product
  const addCategory = () => {
    if (!currentCategory.name || currentCategory.price <= 0) {
      alert('Category name and price are required');
      return;
    }

    // Check if category already exists
    if (isCategoryExists(currentCategory.name)) {
      alert('A category with this name already exists in the product!');
      return;
    }

    // For new categories, calculate total stock from subcategories + category stock
    const subcategoriesStock = currentCategory.subcategories.reduce((total, subcat) => 
      total + (subcat.stock || 0), 0
    );

    const totalCategoryStock = subcategoriesStock + (currentCategory.stock || 0);

    const newCategory = {
      ...currentCategory,
      stock: totalCategoryStock
    };

    setProductForm(prev => ({
      ...prev,
      categories: [...prev.categories, newCategory]
    }));

    // Reset category form
    setCurrentCategory({
      name: '',
      price: 0,
      stock: 0,
      subcategories: []
    });
  };

  // Update existing category
  const updateCategory = () => {
    if (selectedCategoryIndex === null) return;

    if (!currentCategory.name || currentCategory.price <= 0) {
      alert('Category name and price are required');
      return;
    }

    // Calculate total stock: category stock + all subcategories stock
    const subcategoriesStock = currentCategory.subcategories.reduce((total, subcat) => 
      total + (subcat.stock || 0), 0
    );

    const totalCategoryStock = (currentCategory.stock || 0) + subcategoriesStock;

    const updatedCategories = [...productForm.categories];
    updatedCategories[selectedCategoryIndex] = {
      ...currentCategory,
      stock: totalCategoryStock
    };

    setProductForm(prev => ({
      ...prev,
      categories: updatedCategories
    }));

    // Reset category editing
    setSelectedCategoryIndex(null);
    setIsEditingCategory(false);
    setCurrentCategory({
      name: '',
      price: 0,
      stock: 0,
      subcategories: []
    });
  };

  // Remove category from product
  const removeCategory = (index) => {
    setProductForm(prev => ({
      ...prev,
      categories: prev.categories.filter((_, i) => i !== index)
    }));
  };

  // Edit existing category
  const editCategory = (index) => {
    const categoryToEdit = productForm.categories[index];
    setCurrentCategory({
      ...categoryToEdit,
      subcategories: [...categoryToEdit.subcategories]
    });
    setSelectedCategoryIndex(index);
    setIsEditingCategory(true);
  };

  // Cancel category editing
  const cancelCategoryEdit = () => {
    setSelectedCategoryIndex(null);
    setIsEditingCategory(false);
    setCurrentCategory({
      name: '',
      price: 0,
      stock: 0,
      subcategories: []
    });
  };

  // Add subcategory to existing category in edit mode
  const addSubcategoryToExistingCategory = (categoryIndex) => {
    if (!currentSubcategory.design || !currentSubcategory.color || !currentSubcategory.size) {
      alert('Design, Color, and Size are required for subcategory');
      return;
    }

    const category = productForm.categories[categoryIndex];
    
    // Check if similar subcategory already exists
    const exists = category.subcategories.some(subcat => 
      subcat.design === currentSubcategory.design && 
      subcat.color === currentSubcategory.color && 
      subcat.size === currentSubcategory.size
    );

    if (exists) {
      alert('A subcategory with same Design, Color, and Size already exists in this category!');
      return;
    }

    // Auto-generate SKU if empty
    const finalSku = currentSubcategory.sku || generateSKU(
      currentSubcategory.design, 
      currentSubcategory.color, 
      currentSubcategory.size
    );

    const newSubcategory = {
      ...currentSubcategory,
      sku: finalSku
    };

    const updatedCategories = [...productForm.categories];
    const currentCategoryData = updatedCategories[categoryIndex];
    
    updatedCategories[categoryIndex] = {
      ...currentCategoryData,
      subcategories: [...currentCategoryData.subcategories, newSubcategory],
      stock: (currentCategoryData.stock || 0) + (currentSubcategory.stock || 0)
    };

    setProductForm(prev => ({
      ...prev,
      categories: updatedCategories
    }));

    // Reset subcategory form
    setCurrentSubcategory({
      design: '',
      color: '',
      size: '',
      sku: '',
      stock: 0
    });
  };

  // Remove subcategory from existing category in edit mode
  const removeSubcategoryFromCategory = (categoryIndex, subcategoryIndex) => {
    const updatedCategories = [...productForm.categories];
    const currentCategoryData = updatedCategories[categoryIndex];
    const removedStock = currentCategoryData.subcategories[subcategoryIndex].stock || 0;
    
    updatedCategories[categoryIndex] = {
      ...currentCategoryData,
      subcategories: currentCategoryData.subcategories.filter((_, i) => i !== subcategoryIndex),
      stock: Math.max(0, (currentCategoryData.stock || 0) - removedStock)
    };

    setProductForm(prev => ({
      ...prev,
      categories: updatedCategories
    }));
  };

  // Calculate total stock for a product
  const calculateProductTotalStock = (product) => {
    if (!product.categories || !Array.isArray(product.categories)) return 0;
    
    return product.categories.reduce((total, category) => {
      return total + (category.stock || 0);
    }, 0);
  };

  // Add new product
  const addProduct = async () => {
    if (!productForm.product || productForm.categories.length === 0) {
      alert('Product name and at least one category are required');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('https://billing-app-server.vercel.app/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productForm)
      });

      const result = await response.json();
      
      if (response.ok) {
        const newProduct = result.data || result;
        setProducts(prev => [...prev, newProduct]);
        resetForm();
        alert('Product added successfully!');
        fetchProducts();
      } else {
        alert(`Error: ${result.message || 'Failed to add product'}`);
      }
    } catch (error) {
      console.error('Error adding product:', error);
      alert('Error adding product');
    } finally {
      setLoading(false);
    }
  };

  // Update existing product
  const updateProduct = async () => {
    if (!editingProduct) return;

    setLoading(true);
    try {
      const response = await fetch(`https://billing-app-server.vercel.app/api/products/${editingProduct._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productForm)
      });

      const result = await response.json();

      if (response.ok) {
        const updatedProduct = result.data || result;
        setProducts(prev => 
          prev.map(p => p._id === updatedProduct._id ? updatedProduct : p)
        );
        resetForm();
        alert('Product updated successfully!');
        fetchProducts();
      } else {
        alert(`Error: ${result.message || 'Failed to update product'}`);
      }
    } catch (error) {
      console.error('Error updating product:', error);
      alert('Error updating product');
    } finally {
      setLoading(false);
    }
  };

  // Delete product
  const deleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return;
    }

    try {
      const response = await fetch(`https://billing-app-server.vercel.app/api/products/${productId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setProducts(prev => prev.filter(p => p._id !== productId));
        alert('Product deleted successfully!');
      } else {
        const result = await response.json();
        alert(`Error: ${result.message || 'Failed to delete product'}`);
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Error deleting product');
    }
  };

  // Edit product - load data into form
  const editProduct = (product) => {
    setEditingProduct(product);
    setProductForm({
      product: product.product,
      categories: product.categories.map(cat => ({
        ...cat,
        subcategories: cat.subcategories ? [...cat.subcategories] : []
      }))
    });
  };

  // Reset form to initial state
  const resetForm = () => {
    setProductForm({
      product: '',
      categories: []
    });
    setCurrentCategory({
      name: '',
      price: 0,
      stock: 0,
      subcategories: []
    });
    setCurrentSubcategory({
      design: '',
      color: '',
      size: '',
      sku: '',
      stock: 0
    });
    setEditingProduct(null);
    setSelectedCategoryIndex(null);
    setIsEditingCategory(false);
  };

  // Safe rendering of products
  const renderProducts = () => {
    if (!Array.isArray(products)) {
      return <p>No products found or invalid data format</p>;
    }

    if (products.length === 0) {
      return <p>No products found</p>;
    }

    return (
      <div className="products-grid">
        {products.map(product => {
          const totalStock = product.totalStock || calculateProductTotalStock(product);
          
          return (
            <div key={product._id} className="product-card">
              <div className="product-header">
                <h3>{product.product} (Stock: {totalStock})</h3>
                <div className="product-actions">
                  <button 
                    onClick={() => editProduct(product)}
                    className="btn-secondary"
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => deleteProduct(product._id)}
                    className="btn-danger"
                  >
                    Delete
                  </button>
                </div>
              </div>
              
              <div className="product-details">
                <p><strong>Categories:</strong> {product.categories ? product.categories.length : 0}</p>
                <p><strong>Created:</strong> {product.createdAt ? new Date(product.createdAt).toLocaleDateString() : 'N/A'}</p>
              </div>

              {product.categories && product.categories.length > 0 && (
                <div className="categories-list">
                  {product.categories.map((category, index) => (
                    <div key={index} className="category-item">
                      <strong>{category.name}</strong> - ₹{category.price} 
                      (Stock: {category.stock || 0})
                      {category.subcategories && category.subcategories.length > 0 && (
                        <div className="subcategories">
                          {category.subcategories.map((subcat, subIndex) => (
                            <div key={subIndex} className="subcategory-item">
                              {subcat.design} {subcat.color} {subcat.size} 
                              (SKU: {subcat.sku}, Stock: {subcat.stock || 0})
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="product-management">
      <h1>Product Management</h1>
      
      {/* Product Form */}
      <div className="product-form">
        <h2>{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
        
        <div className="form-group">
          <label>Product Name:</label>
          <input
            type="text"
            name="product"
            value={productForm.product}
            onChange={handleProductChange}
            placeholder="e.g., T-shirt"
            required
          />
        </div>

        {/* Category Section */}
        <div className="category-section">
          <h3>{isEditingCategory ? 'Edit Category' : 'Add/Edit Categories'}</h3>
          
          {/* Category Selection Dropdown for Editing */}
          {editingProduct && productForm.categories.length > 0 && !isEditingCategory && (
            <div className="form-group">
              <label>Select Category to Edit:</label>
              <select 
                onChange={(e) => {
                  const index = parseInt(e.target.value);
                  if (index >= 0) {
                    editCategory(index);
                  }
                }}
                className="category-select"
              >
                <option value="">Select a category to edit</option>
                {productForm.categories.map((category, index) => (
                  <option key={index} value={index}>
                    {category.name} (Stock: {category.stock || 0})
                  </option>
                ))}
              </select>
              <small>Or add a new category below</small>
            </div>
          )}

          {/* Category Form */}
          <div className="form-row">
            <div className="form-group">
              <label>Category Name:</label>
              <input
                type="text"
                name="name"
                value={currentCategory.name}
                onChange={handleCategoryChange}
                placeholder="e.g., T-shirt for Adult"
              />
            </div>
            
            <div className="form-group">
              <label>Price (₹):</label>
              <input
                type="number"
                name="price"
                value={currentCategory.price}
                onChange={handleCategoryChange}
                min="0"
                step="0.01"
              />
            </div>

            {/* Category Stock Field - Always Visible */}
            <div className="form-group">
              <label>Category Stock:</label>
              <input
                type="number"
                name="stock"
                value={currentCategory.stock}
                onChange={handleCategoryChange}
                min="0"
                placeholder="Category stock"
              />
              <small>Stock for the category itself (separate from subcategories)</small>
            </div>
          </div>

          {/* Subcategory Section */}
          <div className="subcategory-section">
            <h4>Add Subcategories for this Category</h4>
            
            <div className="form-row">
              <div className="form-group">
                <label>Design:</label>
                <input
                  type="text"
                  name="design"
                  value={currentSubcategory.design}
                  onChange={handleSubcategoryChange}
                  placeholder="e.g., Round Neck"
                />
              </div>
              
              <div className="form-group">
                <label>Color:</label>
                <input
                  type="text"
                  name="color"
                  value={currentSubcategory.color}
                  onChange={handleSubcategoryChange}
                  placeholder="e.g., Red"
                />
              </div>
              
              <div className="form-group">
                <label>Size:</label>
                <input
                  type="text"
                  name="size"
                  value={currentSubcategory.size}
                  onChange={handleSubcategoryChange}
                  placeholder="e.g., M"
                />
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label>SKU (Auto-generated):</label>
                <input
                  type="text"
                  name="sku"
                  value={currentSubcategory.sku}
                  onChange={handleSubcategoryChange}
                  placeholder="Auto-generated SKU"
                  readOnly
                  className="readonly-field"
                />
              </div>
              
              <div className="form-group">
                <label>Subcategory Stock:</label>
                <input
                  type="number"
                  name="stock"
                  value={currentSubcategory.stock}
                  onChange={handleSubcategoryChange}
                  min="0"
                  placeholder="Subcategory stock"
                />
                <small>Stock for this specific subcategory</small>
              </div>
              
              <div className="form-group">
                <label>&nbsp;</label>
                <button 
                  type="button" 
                  onClick={addSubcategory}
                  className="btn-secondary"
                >
                  Add Subcategory
                </button>
              </div>
            </div>

            {/* Current Subcategories List */}
            {currentCategory.subcategories.length > 0 && (
              <div className="current-items">
                <h5>Current Subcategories for this Category:</h5>
                {currentCategory.subcategories.map((subcat, index) => (
                  <div key={index} className="item-card">
                    <span>
                      {subcat.design} - {subcat.color} - {subcat.size} 
                      (SKU: {subcat.sku}, Stock: {subcat.stock})
                    </span>
                    <button 
                      onClick={() => removeSubcategory(index)}
                      className="btn-danger"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Stock Summary */}
            {(currentCategory.stock > 0 || currentCategory.subcategories.length > 0) && (
              <div className="stock-summary">
                <h5>Stock Summary:</h5>
                <p><strong>Category Stock:</strong> {currentCategory.stock || 0}</p>
                <p><strong>Subcategories Total Stock:</strong> {currentCategory.subcategories.reduce((total, subcat) => total + (subcat.stock || 0), 0)}</p>
                <p><strong>Total Category Stock (Category + Subcategories):</strong> 
                  <strong className="total-stock">
                    {(currentCategory.stock || 0) + currentCategory.subcategories.reduce((total, subcat) => total + (subcat.stock || 0), 0)}
                  </strong>
                </p>
              </div>
            )}
          </div>

          {/* Category Actions */}
          <div className="category-actions">
            {isEditingCategory ? (
              <>
                <button 
                  type="button" 
                  onClick={updateCategory}
                  className="btn-primary"
                >
                  Update Category
                </button>
                <button 
                  type="button" 
                  onClick={cancelCategoryEdit}
                  className="btn-secondary"
                >
                  Cancel Edit
                </button>
              </>
            ) : (
              <button 
                type="button" 
                onClick={addCategory}
                className="btn-primary"
              >
                Add Category to Product
              </button>
            )}
          </div>
        </div>

        {/* Subcategory Section for Existing Categories in Edit Mode */}
        {editingProduct && !isEditingCategory && (
          <div className="subcategory-section">
            <h3>Quick Add Subcategories</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label>Design:</label>
                <input
                  type="text"
                  name="design"
                  value={currentSubcategory.design}
                  onChange={handleSubcategoryChange}
                  placeholder="e.g., Round Neck"
                />
              </div>
              
              <div className="form-group">
                <label>Color:</label>
                <input
                  type="text"
                  name="color"
                  value={currentSubcategory.color}
                  onChange={handleSubcategoryChange}
                  placeholder="e.g., Red"
                />
              </div>
              
              <div className="form-group">
                <label>Size:</label>
                <input
                  type="text"
                  name="size"
                  value={currentSubcategory.size}
                  onChange={handleSubcategoryChange}
                  placeholder="e.g., M"
                />
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label>SKU (Auto-generated):</label>
                <input
                  type="text"
                  name="sku"
                  value={currentSubcategory.sku}
                  onChange={handleSubcategoryChange}
                  placeholder="Auto-generated SKU"
                  readOnly
                  className="readonly-field"
                />
              </div>
              
              <div className="form-group">
                <label>Stock:</label>
                <input
                  type="number"
                  name="stock"
                  value={currentSubcategory.stock}
                  onChange={handleSubcategoryChange}
                  min="0"
                />
              </div>
              
              <div className="form-group">
                <label>Add to Category:</label>
                <select 
                  onChange={(e) => {
                    const categoryIndex = parseInt(e.target.value);
                    if (categoryIndex >= 0) {
                      addSubcategoryToExistingCategory(categoryIndex);
                    }
                  }}
                  className="category-select"
                >
                  <option value="">Select Category</option>
                  {productForm.categories.map((category, index) => (
                    <option key={index} value={index}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Current Categories List */}
        {productForm.categories.length > 0 && (
          <div className="current-items">
            <h3>Current Categories:</h3>
            {productForm.categories.map((category, index) => (
              <div key={index} className="item-card">
                <div>
                  <strong>{category.name}</strong> - ₹{category.price} 
                  (Stock: {category.stock})
                  {category.subcategories && category.subcategories.length > 0 && (
                    <div className="subcategories-preview">
                      <small>
                        Subcategories: {category.subcategories.length}
                      </small>
                      {category.subcategories.map((subcat, subIndex) => (
                        <div key={subIndex} className="subcategory-preview">
                          {subcat.design} {subcat.color} {subcat.size} (Stock: {subcat.stock})
                          {editingProduct && (
                            <button 
                              onClick={() => removeSubcategoryFromCategory(index, subIndex)}
                              className="btn-danger btn-small"
                            >
                              ×
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {editingProduct && !isEditingCategory && (
                  <div className="item-actions">
                    <button 
                      onClick={() => editCategory(index)}
                      className="btn-secondary"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => removeCategory(index)}
                      className="btn-danger"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Form Actions */}
        <div className="form-actions">
          {editingProduct ? (
            <>
              <button 
                onClick={updateProduct} 
                disabled={loading}
                className="btn-primary"
              >
                {loading ? 'Updating...' : 'Update Product'}
              </button>
              <button 
                onClick={resetForm}
                className="btn-secondary"
              >
                Cancel
              </button>
            </>
          ) : (
            <button 
              onClick={addProduct} 
              disabled={loading || productForm.categories.length === 0}
              className="btn-primary"
            >
              {loading ? 'Adding...' : 'Add Product'}
            </button>
          )}
        </div>
      </div>

      {/* Products List */}
      <div className="products-list">
        <h2>Existing Products</h2>
        {loading ? (
          <p>Loading...</p>
        ) : (
          renderProducts()
        )}
      </div>
    </div>
  );
};

export default ProductManagement;F
