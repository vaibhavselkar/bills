import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from "./Navbar";

const Invoice = () => {
  const [bill, setBill] = useState(null);
  const { id } = useParams();

  useEffect(() => {
    const fetchBillById = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`https://billing-app-server.vercel.app/api/bill/${id}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          throw new Error("Unauthorized or failed to fetch bill");
        }

        const data = await res.json();
        setBill(data);
      } catch (err) {
        console.error("Error fetching bill:", err);
      }
    };

    fetchBillById();
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  if (!bill) return <div>Loading invoice...</div>;

  // Calculate totals
  const totalQty = bill.products.reduce((sum, p) => sum + (p.quantity || 0), 0);
  const totalItems = bill.products.length;

  return (
    <div className="dashboard">
      <Navbar />

      <div className="invoice-page">
        <div className="invoice-container">
          
          {/* Print Button */}
          <div className="no-print" style={{ textAlign: 'center', marginBottom: '20px' }}>
            <button onClick={handlePrint} className="print-button">Print Invoice</button>
          </div>

          {/* Thermal Invoice Content */}
          <div className="thermal-invoice">
            {/* Header Section */}
            <div className="invoice-header">
              <div className="company-logo">
                <div className="logo-text">SANGHAMITRA</div>
                <div className="tagline">Business Incubator</div>
              </div>
              
              <div className="header-info">
                <div className="invoice-type">TAX INVOICE</div>
                <div className="date-time">
                  {new Date(bill.date).toLocaleDateString('en-IN')} {new Date(bill.date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>

            {/* Customer & Bill Info */}
            <div className="section customer-section">
              <div className="section-row">
                <span className="label">Customer:</span>
                <span className="value">{bill.customerName}</span>
              </div>
            </div>

            {/* Divider */}
            <div className="divider thick"></div>

            {/* Products Table Header */}
            <div className="table-header">
              <div className="col-item">ITEM</div>
              <div className="col-qty">QTY</div>
              <div className="col-price">PRICE</div>
              <div className="col-amount">AMOUNT</div>
            </div>

            <div className="divider thin"></div>

            {/* Products List */}
            <div className="products-list">
              {bill.products.map((p, index) => (
                <div className="product-row" key={index}>
                  <div className="col-item">
                    <div className="product-name">{p.product}</div>
                    <div className="product-category">{p.category}</div>
                  </div>
                  <div className="col-qty">{p.quantity}</div>
                  <div className="col-price">₹{p.price?.toFixed(2)}</div>
                  <div className="col-amount">₹{p.total?.toFixed(2)}</div>
                </div>
              ))}
            </div>

            <div className="divider thin"></div>

            {/* Totals Section */}
            <div className="totals-section">
              <div className="total-row">
                <span>Total Items:</span>
                <span>{totalItems}</span>
              </div>
              <div className="total-row">
                <span>Total Qty:</span>
                <span>{totalQty}</span>
              </div>
              <div className="total-row main-total">
                <span>TOTAL AMOUNT:</span>
                <span>₹{bill.totalAmount?.toFixed(2)}</span>
              </div>
            </div>

            <div className="divider thick"></div>

            {/* Payment Summary */}
            <div className="payment-summary">
              <div className="summary-row">
                <span>Sub Total:</span>
                <span>₹{bill.totalAmount?.toFixed(2)}</span>
              </div>
              <div className="summary-row">
                <span>Tax:</span>
                <span>₹0.00</span>
              </div>
              <div className="summary-row grand-total">
                <span>GRAND TOTAL:</span>
                <span>₹{bill.totalAmount?.toFixed(2)}</span>
              </div>
            </div>

            <div className="divider thick"></div>

            {/* Footer */}
            <div className="invoice-footer">
              <div className="thank-you">Thank you for your business!</div>
              <div className="company-info">
                <div>Sanghamitra Business Incubator</div>
                <div>Contact: +91 9234567890</div>
                <div>sanghamitra.store</div>
              </div>
              <div className="return-policy">
                Goods sold are not returnable
              </div>
              
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        /* Screen Styles */
        .invoice-page {
          padding: 20px;
          display: flex;
          justify-content: center;
          background: #f5f5f5;
        }

        .invoice-container {
          max-width: 320px;
          width: 100%;
        }

        .thermal-invoice {
          font-family: 'Courier New', monospace, 'Arial Narrow';
          font-size: 13px;
          line-height: 1.2;
          color: #000;
          background: #fff;
          padding: 15px;
          border: 2px solid #333;
          margin: 0 auto;
          box-shadow: 0 4px 8px rgba(0,0,0,0.3);
        }

        /* Print Button */
        .print-button {
          background: #333;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          font-weight: bold;
          border: 2px solid #000;
        }

        .print-button:hover {
          background: #555;
        }

        /* Header Styles */
        .invoice-header {
          text-align: center;
          margin-bottom: 12px;
          padding-bottom: 8px;
        }

        .company-logo {
          margin-bottom: 8px;
        }

        .logo-text {
          font-size: 20px;
          font-weight: 900;
          letter-spacing: 1px;
          text-transform: uppercase;
          margin-bottom: 2px;
          color: #000;
        }

        .tagline {
          font-size: 11px;
          font-weight: bold;
          color: #333;
          margin-bottom: 4px;
        }

        .header-info {
          margin-top: 6px;
        }

        .invoice-type {
          font-size: 16px;
          font-weight: 900;
          text-transform: uppercase;
          margin-bottom: 3px;
          color: #000;
        }

        .date-time {
          font-size: 11px;
          font-weight: bold;
          color: #333;
        }

        /* Section Styles */
        .section {
          margin: 8px 0;
        }

        .section-row {
          display: flex;
          justify-content: space-between;
          margin: 3px 0;
          font-weight: bold;
        }

        .label {
          color: #333;
        }

        .value {
          color: #000;
          font-weight: 900;
        }

        /* Divider Styles */
        .divider {
          margin: 8px 0;
          border: none;
        }

        .divider.thick {
          border-top: 3px solid #000;
        }

        .divider.thin {
          border-top: 1px solid #333;
        }

        /* Table Styles */
        .table-header {
          display: grid;
          grid-template-columns: 2fr 0.6fr 1fr 1fr;
          gap: 4px;
          font-weight: 900;
          text-transform: uppercase;
          font-size: 11px;
          margin-bottom: 4px;
        }

        .col-item { text-align: left; }
        .col-qty { text-align: center; }
        .col-price { text-align: center; }
        .col-amount { text-align: right; }

        /* Products List */
        .products-list {
          margin: 6px 0;
        }

        .product-row {
          display: grid;
          grid-template-columns: 2fr 0.6fr 1fr 1fr;
          gap: 4px;
          margin: 4px 0;
          padding: 3px 0;
          border-bottom: 1px dotted #666;
          font-weight: bold;
        }

        .product-name {
          font-weight: 900;
          color: #000;
        }

        .product-category {
          font-size: 10px;
          color: #666;
          font-weight: normal;
        }

        /* Totals Section */
        .totals-section {
          margin: 10px 0;
        }

        .total-row {
          display: flex;
          justify-content: space-between;
          margin: 4px 0;
          font-weight: bold;
        }

        .main-total {
          font-weight: 900;
          font-size: 14px;
          border-top: 2px solid #000;
          border-bottom: 2px solid #000;
          padding: 6px 0;
          margin: 8px 0;
        }

        /* Payment Summary */
        .payment-summary {
          margin: 10px 0;
        }

        .summary-row {
          display: flex;
          justify-content: space-between;
          margin: 4px 0;
          font-weight: bold;
        }

        .grand-total {
          font-weight: 900;
          font-size: 15px;
          border-top: 2px solid #000;
          border-bottom: 2px solid #000;
          padding: 8px 0;
          margin: 10px 0;
        }

        /* Footer */
        .invoice-footer {
          text-align: center;
          margin-top: 15px;
          padding-top: 10px;
        }

        .thank-you {
          font-weight: 900;
          margin-bottom: 8px;
          font-style: italic;
          font-size: 12px;
        }

        .company-info {
          font-size: 10px;
          line-height: 1.3;
          font-weight: bold;
          margin-bottom: 8px;
          color: #333;
        }

        .return-policy {
          font-size: 9px;
          font-weight: bold;
          color: #666;
          margin-bottom: 10px;
          border: 1px solid #999;
          padding: 3px;
        }

        .barcode-section {
          margin-top: 12px;
          padding: 8px;
          border: 2px solid #000;
        }

        .barcode-placeholder {
          font-family: 'Courier New', monospace;
          font-size: 16px;
          font-weight: 900;
          letter-spacing: 2px;
          margin-bottom: 4px;
        }

        .barcode-text {
          font-size: 10px;
          font-weight: bold;
          color: #333;
        }

        /* Thermal Printer Friendly Styles */
        @media print {
          .no-print {
            display: none !important;
          }
          
          /* Hide everything except the invoice */
          body * {
            visibility: hidden;
          }
          
          .invoice-page,
          .invoice-page * {
            visibility: visible;
          }
          
          .invoice-page {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
          }
          
          .dashboard {
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
          }
          
          /* Hide navbar and other elements */
          .dashboard > :not(.invoice-page) {
            display: none !important;
          }
          
          .thermal-invoice {
            width: 58mm !important;
            max-width: 58mm !important;
            margin: 0 auto !important;
            padding: 8px !important;
            font-size: 11px !important;
            line-height: 1.1 !important;
            border: none !important;
            box-shadow: none !important;
            background: white !important;
            color: black !important;
            font-family: 'Courier New', monospace !important;
            font-weight: bold !important;
          }

          /* Enhance darkness for print */
          .thermal-invoice * {
            color: black !important;
            background: transparent !important;
            font-weight: bold !important;
          }

          .logo-text,
          .invoice-type,
          .main-total,
          .grand-total {
            font-weight: 900 !important;
          }

          @page {
            margin: 0;
            size: 58mm auto;
          }
          
          body {
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
            color: black !important;
            font-family: 'Courier New', monospace !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Invoice;
