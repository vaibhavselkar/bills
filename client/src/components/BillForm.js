import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/BillForm.css';

const BillForm = () => {
  const [customerName, setCustomerName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [billItems, setBillItems] = useState([]);
  const [productData, setProductData] = useState([]);
  const [toast, setToast] = useState({ message: '', type: '' });
  const [activeOccasion, setActiveOccasion] = useState('');
  
  // Product selection states
  const [selectedProduct, setSelectedProduct] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubcategory, setSelectedSubcategory] = useState('');
  const [price, setPrice] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [discount, setDiscount] = useState(0);
  
  const navigate = useNavigate();

  // Fetch product data - FIXED API RESPONSE HANDLING
  useEffect(() => {
    fetch("https://billing-app-server.vercel.app/api/products")
      .then(res => res.json())
      .then(data => {
        // Handle different API response formats
        if (data.data && Array.isArray(data.data)) {
          setProductData(data.data);
        } else if (Array.isArray(data)) {
          setProductData(data);
        } else {
          console.error('Unexpected API response format:', data);
          setProductData([]);
        }
      })
      .catch(err => {
        console.error('Error fetching product data:', err);
        setProductData([]);
      });
  }, []);

  // Fetch active occasion
  useEffect(() => {
    fetch("https://billing-app-server.vercel.app/api/get-occasion")
      .then(res => res.json())
      .then(data => setActiveOccasion(data?.activeOccasion || ''))
      .catch(err => console.error('Error fetching active occasion:', err));
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

  // Reset selection when product changes
  const handleProductSelect = (productId) => {
    setSelectedProduct(productId);
    setSelectedCategory('');
    setSelectedSubcategory('');
    setPrice(0);
  };

  const handleCategorySelect = (categoryId) => {
    setSelectedCategory(categoryId);
    setSelectedSubcategory('');
    
    // Auto-set price if category has a fixed price
    const category = getCurrentProduct()?.categories?.find(c => c._id === categoryId);
    if (category?.price) {
      setPrice(category.price);
    }
  };

  const handleSubcategorySelect = (subcategorySku) => {
    setSelectedSubcategory(subcategorySku);
    
    // Auto-set price if subcategory exists (category price is used)
    const category = getCurrentCategory();
    if (category?.price) {
      setPrice(category.price);
    }
  };

  // Add item to bill - UPDATED FOR NEW SCHEMA
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

    const totalAmount = (price * quantity) * (1 - discount / 100);

    const newItem = {
      productId: selectedProduct,
      product: currentProduct.product,
      category: currentCategory.name,
      subcategory: {
        design: currentSubcategory?.design || '',
        color: currentSubcategory?.color || '',
        size: currentSubcategory?.size || '',
        sku: selectedSubcategory || ''
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

  // Submit handler - UPDATED FOR NEW SCHEMA
  const handleSubmit = async () => {
    if (!customerName) return showToast('Enter customer name', 'error');
    if (mobileNumber && !/^\d{10}$/.test(mobileNumber))
      return showToast('Enter a valid 10-digit mobile number', 'error');
    if (billItems.length === 0) return showToast('Add at least one item to bill', 'error');

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

    try {
      const res = await fetch("https://billing-app-server.vercel.app/api/", { // Updated endpoint
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
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
    }
  };

  // Safe rendering of products
  const renderProducts = () => {
    if (!Array.isArray(productData) || productData.length === 0) {
      return <div>No products available</div>;
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
        {selectedProduct && getCurrentProduct()?.categories && (
          <div className="selection-group">
            <label>Categories:</label>
            <div className="button-group">
              {getCurrentProduct().categories.map((category) => (
                <button
                  key={category._id || category.name}
                  className={`selection-btn ${selectedCategory === (category._id || category.name) ? 'active' : ''}`}
                  onClick={() => handleCategorySelect(category._id || category.name)}
                >
                  {category.name} (₹{category.price})
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Subcategories */}
        {selectedCategory && getCurrentCategory()?.subcategories && (
          <div className="selection-group">
            <label>Subcategories:</label>
            <div className="button-group">
              {getCurrentCategory().subcategories.map((subcat) => (
                <button
                  key={subcat.sku}
                  className={`selection-btn ${selectedSubcategory === subcat.sku ? 'active' : ''}`}
                  onClick={() => handleSubcategorySelect(subcat.sku)}
                >
                  {subcat.design} {subcat.color} {subcat.size} (SKU: {subcat.sku})
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Price, Quantity, Discount */}
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

        {/* Add Item Button */}
        <button className="add-to-bill-btn" onClick={addItemToBill}>
          Add Item to Bill
        </button>
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
                  <td>{item.subcategory.design}</td>
                  <td>{item.subcategory.color}</td>
                  <td>{item.subcategory.size}</td>
                  <td>{item.subcategory.sku}</td>
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
        <div className="payment-method">
          <label>Payment Method:</label>
          <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)}>
            <option value="Cash">Cash</option>
            <option value="Online">Online</option>
            <option value="Card">Card</option>
            <option value="UPI">UPI</option>
          </select>
        </div>

        {paymentMethod === 'Online' && (
          <div className="qr-container">
            <p>Scan QR Code to Pay:</p>
            <img src="/qr-code.png" alt="QR Code" className="qr-code" />
          </div>
        )}

        <div className="grand-total">
           Total Amount: <strong>₹{getGrandTotal()}</strong>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="action-buttons">
        <button className="save-btn" onClick={handleSubmit}>
          Save Bill
        </button>
      </div>

      <div className="footer">
        Sanghamitra Business Incubator<br />
        Website: <a href="https://sanghamitra.store" target="_blank" rel="noreferrer">sanghamitra.store</a><br />
        Contact: +919234567890
      </div>
    </div>
  );
};

export default BillForm;
