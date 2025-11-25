import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const Invoice = () => {
  const [bill, setBill] = useState(null);
  const { id } = useParams();

  useEffect(() => {
    const fetchBillById = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`https://bills-weld.vercel.app/api/bill/${id}`, {
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

  if (!bill) return <div style={{ padding: '20px', textAlign: 'center' }}>Loading invoice...</div>;

  // Calculate totals
  const totalQty = bill.products.reduce((sum, p) => sum + (p.quantity || 0), 0);
  const totalItems = bill.products.length;

  return (
    <>
      <div className="invoice-page">
        <div className="invoice-container">
          
          {/* Print Button */}
          <div className="no-print" style={{ textAlign: 'center', marginBottom: '20px' }}>
            <button onClick={handlePrint} className="print-button">
              🖨️ Print Invoice
            </button>
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
              <div className="col-amount">AMT</div>
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
          align-items: flex-start;
          background: #f5f5f5;
          min-height: 100vh;
        }

        .invoice-container {
          max-width: 320px;
          width: 100%;
        }

        .thermal-invoice {
          font-family: 'Courier New', monospace;
          font-size: 12px;
          line-height: 1.2;
          color: #000;
          background: #fff;
          padding: 12px;
          border: 1px solid #333;
          margin: 0 auto;
          box-shadow: 0 2px 8px rgba(0,0,0,0.15);
        }

        /* Print Button */
        .print-button {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 600;
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
          transition: all 0.3s;
        }

        .print-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(102, 126, 234, 0.5);
        }

        /* Header Styles */
        .invoice-header {
          text-align: center;
          margin-bottom: 10px;
          padding-bottom: 8px;
        }

        .company-logo {
          margin-bottom: 6px;
        }

        .logo-text {
          font-size: 18px;
          font-weight: 900;
          letter-spacing: 1px;
          text-transform: uppercase;
          margin-bottom: 2px;
          color: #000;
        }

        .tagline {
          font-size: 10px;
          font-weight: bold;
          color: #333;
          margin-bottom: 4px;
        }

        .header-info {
          margin-top: 6px;
        }

        .invoice-type {
          font-size: 14px;
          font-weight: 900;
          text-transform: uppercase;
          margin-bottom: 3px;
          color: #000;
        }

        .date-time {
          font-size: 10px;
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
          border-top: 2px solid #000;
        }

        .divider.thin {
          border-top: 1px solid #333;
        }

        /* Table Styles */
        .table-header {
          display: grid;
          grid-template-columns: 2fr 0.7fr 1fr 1fr;
          gap: 4px;
          font-weight: 900;
          text-transform: uppercase;
          font-size: 10px;
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
          grid-template-columns: 2fr 0.7fr 1fr 1fr;
          gap: 4px;
          margin: 4px 0;
          padding: 3px 0;
          border-bottom: 1px dotted #666;
          font-weight: bold;
        }

        .product-name {
          font-weight: 900;
          color: #000;
          font-size: 11px;
        }

        .product-category {
          font-size: 9px;
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
          font-size: 13px;
          border-top: 1px solid #000;
          border-bottom: 1px solid #000;
          padding: 5px 0;
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
          font-size: 14px;
          border-top: 2px solid #000;
          border-bottom: 2px solid #000;
          padding: 6px 0;
          margin: 10px 0;
        }

        /* Footer */
        .invoice-footer {
          text-align: center;
          margin-top: 12px;
          padding-top: 10px;
        }

        .thank-you {
          font-weight: 900;
          margin-bottom: 8px;
          font-style: italic;
          font-size: 12px;
        }

        .company-info {
          font-size: 9px;
          line-height: 1.4;
          font-weight: bold;
          margin-bottom: 8px;
          color: #333;
        }

        .return-policy {
          font-size: 8px;
          font-weight: bold;
          color: #666;
          margin-top: 8px;
          border: 1px solid #999;
          padding: 4px;
        }

        /* Thermal Printer Print Styles */
        @media print {
          /* Hide everything except invoice */
          body * {
            visibility: hidden;
          }

          .invoice-page,
          .invoice-page * {
            visibility: visible;
          }

          .no-print {
            display: none !important;
          }

          /* Reset page margins and layout */
          @page {
            size: 58mm auto;
            margin: 0;
          }

          html, body {
            width: 58mm;
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
          }

          .invoice-page {
            position: fixed;
            left: 0;
            top: 0;
            width: 58mm !important;
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
            display: block !important;
          }

          .invoice-container {
            width: 58mm !important;
            max-width: 58mm !important;
            margin: 0 !important;
            padding: 0 !important;
          }

          .thermal-invoice {
            width: 58mm !important;
            max-width: 58mm !important;
            margin: 0 !important;
            padding: 3mm !important;
            border: none !important;
            box-shadow: none !important;
            background: white !important;
            font-size: 9px !important;
            line-height: 1.1 !important;
          }

          /* Force black text */
          .thermal-invoice,
          .thermal-invoice * {
            color: #000 !important;
            background: transparent !important;
          }

          /* Adjust font sizes for print */
          .logo-text {
            font-size: 14px !important;
            font-weight: 900 !important;
          }

          .tagline {
            font-size: 8px !important;
          }

          .invoice-type {
            font-size: 11px !important;
          }

          .date-time {
            font-size: 8px !important;
          }

          .table-header {
            font-size: 8px !important;
          }

          .product-name {
            font-size: 9px !important;
          }

          .product-category {
            font-size: 7px !important;
          }

          .col-qty,
          .col-price,
          .col-amount {
            font-size: 8px !important;
          }

          .main-total {
            font-size: 10px !important;
          }

          .grand-total {
            font-size: 11px !important;
          }

          .thank-you {
            font-size: 9px !important;
          }

          .company-info {
            font-size: 7px !important;
          }

          .return-policy {
            font-size: 6px !important;
          }

          /* Adjust spacing for print */
          .divider {
            margin: 2mm 0 !important;
          }

          .section {
            margin: 1.5mm 0 !important;
          }

          .products-list {
            margin: 2mm 0 !important;
          }

          .product-row {
            margin: 1mm 0 !important;
            padding: 1mm 0 !important;
            page-break-inside: avoid;
          }

          .totals-section {
            margin: 2mm 0 !important;
          }

          .payment-summary {
            margin: 2mm 0 !important;
          }

          .invoice-footer {
            margin-top: 3mm !important;
            padding-top: 2mm !important;
          }
        }
      `}</style>
    </>
  );
};

export default Invoice;
