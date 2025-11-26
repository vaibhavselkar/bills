import React, { useState, useEffect } from 'react';
import '../styles/ProductManagement.css';
import Sidebar from "./Sidebar";

const ProductManagement = () => {
  // ========================
  // STATE
  // ========================
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

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

  const [selectedCategoryIndex, setSelectedCategoryIndex] = useState(null);
  const [isEditingCategory, setIsEditingCategory] = useState(false);

  // ========================
  // PREDEFINED PRODUCT TEMPLATES
  // ========================
  const productTemplates = {
    'T-shirt': {
      categories: [
        {
          name: 'Kids',
          price: 0,
          stock: 0,
          subcategories: [],
          designs: ['Lion', 'Lion Cub', 'Tiger', 'Wolf', 'Baby Wolf', 'Peacock'],
          sizes: ['60', '65', '70', '75', '80', '85'],
          colors: [
            'Black', 'White', 'Grey', 'Pink', 'Orange',
            'Blue', 'Sky Blue', 'Purple', 'Brown'
          ]
        },
        {
          name: 'Adult',
          price: 0,
          stock: 0,
          subcategories: [],
          designs: ['Skull', 'Kaal', 'Rectangle', 'Circle', 'Square'],
          sizes: ['S', 'M', 'L', 'XL'],
          colors: ['Black', 'White']
        }
      ]
    }
  };

  // ========================
  // UTILS
  // ========================
  const getAuthToken = () => localStorage.getItem('token') || sessionStorage.getItem('token');

  const capitalizeText = (text) => {
    if (!text) return '';
    return text.replace(/\w\S*/g, (txt) =>
      txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    );
  };

  const generateSKU = (design, color, size) => {
    const d = design ? design.replace(/\s+/g, '-').toUpperCase() : '';
    const c = color ? color.replace(/\s+/g, '-').toUpperCase() : '';
    const s = size ? size.toUpperCase() : '';
    if (!d && !c && !s) return '';
    return `${d}-${c}-${s}`;
  };

  // ========================
  // EFFECTS
  // ========================
  useEffect(() => {
    fetchUserData();
    fetchProducts();
  }, []);

  useEffect(() => {
    const sku = generateSKU(currentSubcategory.design, currentSubcategory.color, currentSubcategory.size);
    setCurrentSubcategory(prev => ({ ...prev, sku }));
  }, [currentSubcategory.design, currentSubcategory.color, currentSubcategory.size]);

  // ========================
  // FETCH FUNCTIONS
  // ========================
  const fetchUserData = async () => {
    try {
      const token = getAuthToken();
      if (!token) return;
      const res = await fetch('https://billing-app-server.vercel.app/api/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setCurrentUser(data);
      }
    } catch (err) {
      console.error('User fetch error:', err);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const token = getAuthToken();
      if (!token) {
        alert('Please login to access products');
        return;
      }
      const res = await fetch('https://billing-app-server.vercel.app/api/products', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setProducts(data.data || data);
      } else {
        alert('Error fetching products');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ========================
  // FORM HANDLERS
  // ========================
  const handleProductChange = (e) => {
    const { name, value } = e.target;
    const val = capitalizeText(value);

    setProductForm(prev => ({ ...prev, [name]: val }));

    // ✅ Auto-fill template for T-shirt
    const template = productTemplates[val];
    if (template && !editingProduct) {
      const cloned = JSON.parse(JSON.stringify(template.categories));
      cloned.forEach(category => {
        const subcategories = [];
        category.designs.forEach(design => {
          category.colors.forEach(color => {
            category.sizes.forEach(size => {
              const sku = generateSKU(design, color, size);
              subcategories.push({ design, color, size, sku, stock: 0 });
            });
          });
        });
        category.subcategories = subcategories;
      });
      setProductForm({ product: val, categories: cloned });
      alert(`Auto-filled Kids & Adult categories for ${val}`);
    }
  };

  const handleCategoryChange = (e) => {
    const { name, value } = e.target;
    setCurrentCategory(prev => ({
      ...prev,
      [name]: name === 'price' || name === 'stock' ? Number(value) : capitalizeText(value)
    }));
  };

  const handleSubcategoryChange = (e) => {
    const { name, value } = e.target;
    const val = (name === 'stock') ? Number(value) : capitalizeText(value);
    setCurrentSubcategory(prev => ({ ...prev, [name]: val }));
  };

  // ========================
  // CRUD FUNCTIONS
  // ========================
  const addProduct = async () => {
    if (!productForm.product || productForm.categories.length === 0) {
      alert('Product name and at least one category are required');
      return;
    }
    const token = getAuthToken();
    if (!token) return alert('Please login first');
    setLoading(true);
    try {
      const res = await fetch('https://billing-app-server.vercel.app/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(productForm)
      });
      const data = await res.json();
      if (res.ok) {
        alert('Product added successfully!');
        fetchProducts();
        resetForm();
      } else {
        alert(data.message || 'Error adding product');
      }
    } catch (err) {
      console.error('Add product error:', err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setProductForm({ product: '', categories: [] });
    setCurrentCategory({ name: '', price: 0, stock: 0, subcategories: [] });
    setCurrentSubcategory({ design: '', color: '', size: '', sku: '', stock: 0 });
    setEditingProduct(null);
  };

  // ========================
  // RENDER PRODUCTS
  // ========================
  const renderProducts = () => {
    if (loading) return <p>Loading...</p>;
    if (!products.length) return <p>No products yet.</p>;

    return (
      <div className="products-grid">
        {products.map(prod => (
          <div key={prod._id} className="product-card">
            <div className="product-header">
              <h3>{prod.product}</h3>
              <span className="stock-badge">
                {prod.categories?.reduce((sum, cat) => sum + (cat.stock || 0), 0)} in stock
              </span>
            </div>
            <div className="product-categories">
              {prod.categories?.map((cat, i) => (
                <div key={i} className="category-block">
                  <strong>{cat.name}</strong> - ₹{cat.price} ({cat.stock} stock)
                  <div className="subcategory-list">
                    {cat.subcategories?.slice(0, 5).map((s, j) => (
                      <div key={j} className="subcategory-item">
                        {s.design} / {s.color} / {s.size} ({s.stock})
                      </div>
                    ))}
                    {cat.subcategories?.length > 5 && <small>+ more...</small>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  // ========================
  // RENDER JSX
  // ========================
  return (
    <div className="product-management">
      <Sidebar isOpen={isSidebarOpen} onToggle={() => setIsSidebarOpen(!isSidebarOpen)} />

      <div className="main-content">
        <div className="header-section">
          <h1>Product Management</h1>
          {currentUser && (
            <div className="tenant-info">
              <span>{currentUser.organizationName || currentUser.tenantId}</span>
              <span>({currentUser.role})</span>
            </div>
          )}
        </div>

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
            />
          </div>

          {productForm.product === 'T-shirt' && (
            <div className="notice-box">
              <p>✅ Kids and Adult categories auto-generated.</p>
            </div>
          )}

          {/* Add Button */}
          <div className="form-actions">
            <button
              onClick={addProduct}
              disabled={loading || !productForm.product || productForm.categories.length === 0}
              className="btn-primary"
            >
              {loading ? 'Adding...' : 'Add Product'}
            </button>
            <button onClick={resetForm} className="btn-secondary">Reset</button>
          </div>
        </div>

        {/* Products List */}
        <div className="products-list">
          <h2>Your Products</h2>
          {renderProducts()}
        </div>
      </div>
    </div>
  );
};

export default ProductManagement;
