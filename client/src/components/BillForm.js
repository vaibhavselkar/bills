import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/BillForm.css';

const BillForm = () => {
  const [customerName, setCustomerName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [billItems, setBillItems] = useState([]);
  const [productData, setProductData] = useState([]);
  const [toast, setToast] = useState({ message: '', type: '' });
  const [activeOccasion, setActiveOccasion] = useState('');
  const [loading, setLoading] = useState(false);

  const [selectedProduct, setSelectedProduct] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedDesign, setSelectedDesign] = useState('');
  const [selectedSubcategory, setSelectedSubcategory] = useState('');
  const [price, setPrice] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [discount, setDiscount] = useState(0);
  
  const navigate = useNavigate();

  // Get auth token
  const getAuthToken = () => {
    return localStorage.getItem('token') || sessionStorage.getItem('token');
  };

  // Fetch product data with authentication
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const token = getAuthToken();
        if (!token) {
          showToast('Please login to access products', 'error');
          return;
        }

        const response = await fetch("https://bills-welding.vercel.app/api/products", {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data && Array.isArray(data.data)) {
            setProductData(data.data);
          } else if (Array.isArray(data)) {
            setProductData(data);
          } else {
            console.error('Unexpected API response format:', data);
            setProductData([]);
            showToast('Error loading products', 'error');
          }
        } else {
          const errorData = await response.json();
          console.error('Failed to fetch products:', errorData);
          showToast(`Error: ${errorData.message || 'Failed to fetch products'}`, 'error');
          setProductData([]);
        }
      } catch (err) {
        console.error('Error fetching product data:', err);
        showToast('Error loading products. Please check your connection.', 'error');
        setProductData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Fetch active occasion with authentication
  useEffect(() => {
    const fetchOccasion = async () => {
      try {
        const token = getAuthToken();
        const response = await fetch("https://bills-welding.vercel.app/api/get-occasion", {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setActiveOccasion(data?.activeOccasion || '');
        }
      } catch (err) {
        console.error('Error fetching active occasion:', err);
      }
    };

    fetchOccasion();
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: '', type: '' }), 3000);
  };

  // Get current product, category, and subcategory data
  const getCurrentProduct = () => {
    if (!Array.isArray(productData)) return null;
    return productData.find(p => p._id === selectedProduct);
  };

  const getCurrentCategory = () => {
    const product = getCurrentProduct();
    return product?.categories?.find(c => c._id === selectedCategory);
  };

  const getCurrentSubcategory = () => {
    const category = getCurrentCategory();
    return category?.subcategories?.find(s => s.sku === selectedSubcategory);
  };

  // Group subcategories by color, then design
  const groupSubcategories = (subcategories) => {
    if (!subcategories || subcategories.length === 0) return null;

    const grouped = {};
    
    subcategories.forEach(sub => {
      const color = sub.color || 'default';
      const design = sub.design || 'default';
      
      if (!grouped[color]) grouped[color] = {};
      if (!grouped[color][design]) grouped[color][design] = [];
      
      grouped[color][design].push(sub);
    });
    
    return grouped;
  };

  // Reset selection when product changes
  const handleProductSelect = (productId) => {
    setSelectedProduct(productId);
    setSelectedCategory('');
    setSelectedColor('');
    setSelectedDesign('');
    setSelectedSubcategory('');
    setPrice(0);
  };

  const handleCategorySelect = (categoryId) => {
    setSelectedCategory(categoryId);
    setSelectedColor('');
    setSelectedDesign('');
    setSelectedSubcategory('');
    
    const category = getCurrentProduct()?.categories?.find(c => c._id === categoryId);
    if (category?.price) {
      setPrice(category.price);
    }
  };

  // Add item to bill
  const addItemToBill = () => {
    if (!selectedProduct) {
      showToast('Please select a product', 'error');
      return;
    }

    const currentProduct = getCurrentProduct();
    const currentCategory = getCurrentCategory();
    const currentSubcategory = getCurrentSubcategory();

    if (!currentProduct || !currentCategory) {
      showToast('Please select a valid product and category', 'error');
      return;
    }

    // Check if subcategories exist and if selection is complete
    if (currentCategory.subcategories?.length > 0 && !selectedSubcategory) {
      showToast('Please complete your selection (color, design, and size)', 'error');
      return;
    }

    const totalAmount = (price * quantity) * (1 - discount / 100);

    const newItem = {
      productId: selectedProduct,
      product: currentProduct.product,
      category: currentCategory.name,
      subcategory: currentCategory.subcategories?.length > 0 
        ? {
            design: currentSubcategory?.design || '',
            color: currentSubcategory?.color || '',
            size: currentSubcategory?.size || '',
            sku: selectedSubcategory || ''
          }
        : {
            design: '',
            color: '',
            size: '',
            sku: `${currentProduct.product}-${currentCategory.name}`.toUpperCase()
          },
      price: price,
      quantity: quantity,
      discount: discount,
      total: totalAmount
    };

    setBillItems([...billItems, newItem]);
    
    // Reset selection form
    setSelectedProduct('');
    setSelectedCategory('');
    setSelectedColor('');
    setSelectedDesign('');
    setSelectedSubcategory('');
    setPrice(0);
    setQuantity(1);
    setDiscount(0);
    
    showToast('Item added to bill successfully!');
  };

  const deleteBillItem = (index) => {
    const updated = billItems.filter((_, i) => i !== index);
    setBillItems(updated);
  };

  const getGrandTotal = () =>
    billItems.reduce((sum, item) => sum + (parseFloat(item.total) || 0), 0).toFixed(2);

  // Submit handler
  const handleSubmit = async () => {
    if (!customerName) return showToast('Enter customer name', 'error');
    if (mobileNumber && !/^\d{10}$/.test(mobileNumber))
      return showToast('Enter a valid 10-digit mobile number', 'error');
    if (billItems.length === 0) return showToast('Add at least one item to bill', 'error');
    if (!['Cash', 'UPI'].includes(paymentMethod)) {
      return showToast('Select payment method (Cash or UPI required)', 'error');
    }

    const token = getAuthToken();
    if (!token) {
      showToast('Please login to create bills', 'error');
      return;
    }

    const billData = {
      customerName,
      mobileNumber,
      paymentMethod,
      totalAmount: parseFloat(getGrandTotal()),
      products: billItems.map(item => ({
        productId: item.productId,
        product: item.product,
        category: item.category,
        subcategory: item.subcategory,
        price: item.price,
        quantity: item.quantity,
        discount: item.discount,
        total: item.total
      })),
      billType: activeOccasion ? "special" : "daily",
      occasion: activeOccasion || "",
    };

    setLoading(true);
    try {
      const res = await fetch("https://bills-welding.vercel.app/api/", { 
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(billData),
      });

      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('lastBill', JSON.stringify(data));
        navigate(`/invoice/${data.bill._id}`);
        showToast('Bill saved successfully!');
        setCustomerName('');
        setMobileNumber('');
        setBillItems([]);
        setPaymentMethod('Cash');
      } else {
        throw new Error(data.message || 'Error saving bill');
      }
    } catch (err) {
      showToast('Error: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Render products
  const renderProducts = () => {
    if (loading) {
      return <div className="loading">Loading products...</div>;
    }

    if (!Array.isArray(productData) || productData.length === 0) {
      return <div className="no-products">No products available. Please add products first.</div>;
    }

    return productData.map((product) => (
      <button
        key={product._id}
        className={`selection-btn ${selectedProduct === product._id ? 'active' : ''}`}
        onClick={() => handleProductSelect(product._id)}
      >
        {product.product}
      </button>
    ));
  };

  // Render categories
  const renderCategories = () => {
    const product = getCurrentProduct();
    if (!product || !product.categories || product.categories.length === 0) {
      return null;
    }

    return (
      <div className="selection-group">
        <label>Categories:</label>
        <div className="button-group">
          {product.categories.map((category) => (
            <button
              key={category._id || category.name}
              className={`selection-btn ${selectedCategory === (category._id || category.name) ? 'active' : ''}`}
              onClick={() => handleCategorySelect(category._id || category.name)}
              disabled={category.stock <= 0}
            >
              {category.name} (₹{category.price})
              {category.stock > 0 && (
                <span className="stock-info">Stock: {category.stock}</span>
              )}
            </button>
          ))}
        </div>
      </div>
    );
  };

  // Render Colors
  const renderColors = () => {
    const category = getCurrentCategory();
    if (!category?.subcategories || category.subcategories.length === 0) return null;
    
    const grouped = groupSubcategories(category.subcategories);
    if (!grouped) return null;
    
    const colors = Object.keys(grouped);
    
    return (
      <div className="selection-group">
        <label>Colors:</label>
        <div className="button-group">
          {colors.map((color) => (
            <button
              key={color}
              className={`selection-btn ${selectedColor === color ? 'active' : ''}`}
              onClick={() => {
                setSelectedColor(color);
                setSelectedDesign('');
                setSelectedSubcategory('');
              }}
            >
              {color}
            </button>
          ))}
        </div>
      </div>
    );
  };

  // Render Designs
  const renderDesigns = () => {
    const category = getCurrentCategory();
    if (!selectedColor || !category?.subcategories) return null;
    
    const grouped = groupSubcategories(category.subcategories);
    if (!grouped || !grouped[selectedColor]) return null;
    
    const designs = Object.keys(grouped[selectedColor]);
    
    return (
      <div className="selection-group">
        <label>Designs:</label>
        <div className="button-group">
          {designs.map((design) => (
            <button
              key={design}
              className={`selection-btn ${selectedDesign === design ? 'active' : ''}`}
              onClick={() => {
                setSelectedDesign(design);
                setSelectedSubcategory('');
              }}
            >
              {design}
            </button>
          ))}
        </div>
      </div>
    );
  };

  // Render Sizes
  const renderSizes = () => {
    const category = getCurrentCategory();
    if (!selectedColor || !selectedDesign || !category?.subcategories) return null;
    
    const grouped = groupSubcategories(category.subcategories);
    if (!grouped || !grouped[selectedColor] || !grouped[selectedColor][selectedDesign]) return null;
    
    const sizes = grouped[selectedColor][selectedDesign];
    
    return (
      <div className="selection-group">
        <label>Sizes:</label>
        <div className="button-group">
          {sizes.map((subcat) => (
            <button
              key={subcat.sku}
              className={`selection-btn ${selectedSubcategory === subcat.sku ? 'active' : ''}`}
              onClick={() => {
                setSelectedSubcategory(subcat.sku);
                if (category.price) setPrice(category.price);
              }}
              disabled={subcat.stock <= 0}
            >
              {subcat.size}
              <span className="sku">SKU: {subcat.sku}</span>
              {subcat.stock > 0 && (
                <span className="stock-info">Stock: {subcat.stock}</span>
              )}
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="bill-container">
      {toast.message && (
        <div className={`toast ${toast.type === 'error' ? 'error' : ''}`}>{toast.message}</div>
      )}

      {activeOccasion && (
        <div className="occasion-banner">
          🎉 <strong>Active Occasion:</strong> {activeOccasion} (All bills will be marked as "Special")
        </div>
      )}

      <div className="header">
        <h1>SANGHAMITRA BUSINESS INCUBATORS</h1>
      </div>

      {/* Customer Information */}
      <div className="customer-info">
        <div className="input-group">
          <label>Customer Name:</label>
          <input 
            type="text" 
            value={customerName} 
            onChange={e => setCustomerName(e.target.value)}
            placeholder="Enter customer name"
          />
        </div>
        <div className="input-group">
          <label>Contact No:</label>
          <input 
            type="tel" 
            value={mobileNumber} 
            onChange={e => setMobileNumber(e.target.value)}
            placeholder="Optional"
          />
        </div>
      </div>

      {/* Product Selection Section */}
      <div className="product-selection-section">
        <h3>Product Selection</h3>
        
        {/* Products */}
        <div className="selection-group">
          <label>Products:</label>
          <div className="button-group">
            {renderProducts()}
          </div>
        </div>

        {/* Categories */}
        {selectedProduct && renderCategories()}

        {/* Colors - Only show if subcategories exist */}
        {selectedCategory && getCurrentCategory()?.subcategories?.length > 0 && renderColors()}

        {/* Designs - Only show after color selected */}
        {selectedColor && renderDesigns()}

        {/* Sizes - Only show after design selected */}
        {selectedDesign && renderSizes()}

        {/* Price, Quantity, Discount - Show after category selection */}
        {selectedCategory && (
          <div className="price-quantity-section">
            <div className="input-row">
              <div className="input-group">
                <label>Price (₹):</label>
                <input
                  type="number"
                  value={price}
                  onChange={e => setPrice(parseFloat(e.target.value) || 0)}
                  min="0"
                  step="0.01"
                />
              </div>
              
              <div className="input-group">
                <label>Quantity:</label>
                <input
                  type="number"
                  value={quantity}
                  onChange={e => setQuantity(parseInt(e.target.value) || 1)}
                  min="1"
                />
              </div>
              
              <div className="input-group">
                <label>Discount (%):</label>
                <select value={discount} onChange={e => setDiscount(parseInt(e.target.value))}>
                  {[0, 10, 20, 30, 40, 50].map(d => (
                    <option key={d} value={d}>{d}%</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Add Item Button */}
        {selectedCategory && (
          <button className="add-to-bill-btn" onClick={addItemToBill}>
            Add Item to Bill
          </button>
        )}
      </div>

      {/* Bill Items Table */}
      {billItems.length > 0 && (
        <div className="bill-items-section">
          <h3>Bill Items</h3>
          <table className="bill-items-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Design</th>
                <th>Color</th>
                <th>Size</th>
                <th>SKU</th>
                <th>Price</th>
                <th>Qty</th>
                <th>Discount</th>
                <th>Total</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {billItems.map((item, index) => (
                <tr key={index}>
                  <td>{item.product}</td>
                  <td>{item.category}</td>
                  <td>{item.subcategory.design || '-'}</td>
                  <td>{item.subcategory.color || '-'}</td>
                  <td>{item.subcategory.size || '-'}</td>
                  <td>{item.subcategory.sku || '-'}</td>
                  <td>₹{item.price}</td>
                  <td>{item.quantity}</td>
                  <td>{item.discount}%</td>
                  <td>₹{item.total.toFixed(2)}</td>
                  <td>
                    <button className="delete-btn" onClick={() => deleteBillItem(index)}>
                      ×
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Payment Section */}
      <div className="payment-section">
        <h3>Payment Method</h3>
      
        <div className="payment-buttons">
          <button
            type="button"
            className={`payment-btn ${paymentMethod === 'Cash' ? 'active' : ''}`}
            onClick={() => setPaymentMethod('Cash')}
          >
            💵 Cash
          </button>
          <button
            type="button"
            className={`payment-btn ${paymentMethod === 'UPI' ? 'active' : ''}`}
            onClick={() => setPaymentMethod('UPI')}
          >
            📱 UPI
          </button>
        </div>
      
        <div className="grand-total">
          Total Amount: <strong>₹{getGrandTotal()}</strong>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="action-buttons">
        <button 
          className="save-btn" 
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? 'Saving Bill...' : 'Save Bill'}
        </button>
      </div>

      <div className="footer">
        Sanghamitra Business Incubator<br />
        Website: <a href="https://sanghamitra.store" target="_blank" rel="noreferrer">sanghamitra.store</a><br />
        Contact: +918625969689
      </div>
    </div>
  );
};

export default BillForm;
