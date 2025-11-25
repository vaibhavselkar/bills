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
            {/* Header Section - CENTERED */}
            <div className="invoice-header">
              <div className="logo-text">SANGHAMITRA</div>
              <div className="tagline">Business Incubator</div>
              <div className="invoice-type">TAX INVOICE</div>
              <div className="date-time">
                {new Date(bill.date).toLocaleDateString('en-GB')} {new Date(bill.date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}
              </div>
            </div>

            {/* Customer Info - LEFT ALIGNED */}
            <div className="customer-section">
              <div className="customer-label">Customer:</div>
              <div className="customer-name">{bill.customerName}</div>
            </div>

            {/* Divider */}
            <div className="divider-line">═══════════════════════════════════</div>

            {/* Products Table Header - CENTERED */}
            <div className="table-header">
              <div className="th-item">ITEM</div>
              <div className="th-qty">QTY</div>
              <div className="th-price">PRICE</div>
              <div className="th-amt">AMT</div>
            </div>

            <div className="divider-line">───────────────────────────────────</div>

            {/* Products List */}
            <div className="products-list">
              {bill.products.map((p, index) => (
                <div key={index}>
                  <div className="product-row">
                    <div className="product-info">
                      <div className="product-name">{p.product}</div>
                      <div className="product-category">{p.category}</div>
                    </div>
                    <div className="product-qty">{p.quantity}</div>
                    <div className="product-price">₹{p.price?.toFixed(2)}</div>
                    <div className="product-total">₹{p.total?.toFixed(2)}</div>
                  </div>
                  <div className="product-divider">- - - - - - - - - - - - - - - - - - - - - - - - - - - -</div>
                </div>
              ))}
            </div>

            <div className="divider-line">═══════════════════════════════════</div>

            {/* Summary Section - RIGHT ALIGNED */}
            <div className="summary-section">
              <div className="summary-row">
                <span className="summary-label">Total Items:</span>
                <span className="summary-value">{totalItems}</span>
              </div>
              <div className="summary-row">
                <span className="summary-label">Total Qty:</span>
                <span className="summary-value">{totalQty}</span>
              </div>
            </div>

            <div className="divider-line">───────────────────────────────────</div>

            {/* Total Amount - CENTERED & BOLD */}
            <div className="total-amount-section">
              <div className="total-label">TOTAL AMOUNT:</div>
              <div className="total-value">₹{bill.totalAmount?.toFixed(2)}</div>
            </div>

            <div className="divider-line">═══════════════════════════════════</div>

            {/* Payment Breakdown */}
            <div className="payment-section">
              <div className="payment-row">
                <span className="payment-label">Sub Total:</span>
                <span className="payment-value">₹{bill.totalAmount?.toFixed(2)}</span>
              </div>
              <div className="payment-row">
                <span className="payment-label">Tax:</span>
                <span className="payment-value">₹0.00</span>
              </div>
            </div>

            <div className="divider-line">───────────────────────────────────</div>

            {/* Grand Total - CENTERED & EXTRA BOLD */}
            <div className="grand-total-section">
              <div className="grand-label">GRAND TOTAL:</div>
              <div className="grand-value">₹{bill.totalAmount?.toFixed(2)}</div>
            </div>

            <div className="divider-line">═══════════════════════════════════</div>

            {/* Footer - CENTERED */}
            <div className="invoice-footer">
              <div className="thank-you">Thank you for your business!</div>
              <div className="company-details">
                <div>Sanghamitra Business Incubator</div>
                <div>Contact: +91 9234567890</div>
                <div>sanghamitra.store</div>
              </div>
              <div className="footer-note">Goods sold are not returnable</div>
              <div className="footer-stars">★★★★★★★★★★★★★★★★★★★★★★★</div>
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
          width: 100%;
          max-width: 380px;
        }

        .thermal-invoice {
          font-family: 'Courier New', monospace;
          font-size: 14px;
          line-height: 1.3;
          color: #000;
          background: #fff;
          padding: 15px;
          border: 2px solid #333;
          margin: 0 auto;
          box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        }

        /* Print Button */
        .print-button {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          padding: 14px 28px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 16px;
          font-weight: 600;
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
          transition: all 0.3s;
        }

        .print-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(102, 126, 234, 0.5);
        }

        /* Header - CENTERED */
        .invoice-header {
          text-align: center;
          margin-bottom: 12px;
        }

        .logo-text {
          font-size: 22px;
          font-weight: 900;
          letter-spacing: 2px;
          margin-bottom: 3px;
        }

        .tagline {
          font-size: 11px;
          font-weight: 600;
          margin-bottom: 8px;
        }

        .invoice-type {
          font-size: 16px;
          font-weight: 900;
          margin: 8px 0 5px 0;
        }

        .date-time {
          font-size: 11px;
          font-weight: 600;
        }

        /* Customer Section - LEFT ALIGNED */
        .customer-section {
          margin: 12px 0;
          text-align: left;
        }

        .customer-label {
          font-size: 12px;
          font-weight: 600;
          margin-bottom: 2px;
        }

        .customer-name {
          font-size: 16px;
          font-weight: 900;
        }

        /* Divider Lines */
        .divider-line {
          text-align: center;
          font-size: 10px;
          margin: 8px 0;
          overflow: hidden;
          white-space: nowrap;
        }

        /* Table Header - CENTERED */
        .table-header {
          display: grid;
          grid-template-columns: 2.5fr 0.8fr 1.2fr 1.2fr;
          gap: 5px;
          font-weight: 900;
          font-size: 11px;
          text-align: center;
          margin: 8px 0;
        }

        .th-item { text-align: left; }

        /* Products List */
        .products-list {
          margin: 10px 0;
        }

        .product-row {
          display: grid;
          grid-template-columns: 2.5fr 0.8fr 1.2fr 1.2fr;
          gap: 5px;
          margin: 6px 0;
          font-weight: 600;
          align-items: start;
        }

        .product-info {
          text-align: left;
        }

        .product-name {
          font-size: 13px;
          font-weight: 900;
          margin-bottom: 2px;
        }

        .product-category {
          font-size: 10px;
          font-weight: 600;
          color: #666;
        }

        .product-qty,
        .product-price,
        .product-total {
          text-align: center;
          font-size: 12px;
          font-weight: 700;
        }

        .product-divider {
          font-size: 10px;
          text-align: center;
          margin: 4px 0;
          color: #999;
        }

        /* Summary Section - RIGHT ALIGNED */
        .summary-section {
          margin: 10px 0;
        }

        .summary-row {
          display: flex;
          justify-content: space-between;
          margin: 5px 0;
          font-size: 13px;
        }

        .summary-label {
          font-weight: 600;
        }

        .summary-value {
          font-weight: 900;
        }

        /* Total Amount - CENTERED */
        .total-amount-section {
          text-align: center;
          margin: 12px 0;
          padding: 8px 0;
        }

        .total-label {
          font-size: 15px;
          font-weight: 900;
          margin-bottom: 3px;
        }

        .total-value {
          font-size: 18px;
          font-weight: 900;
        }

        /* Payment Section - RIGHT ALIGNED */
        .payment-section {
          margin: 10px 0;
        }

        .payment-row {
          display: flex;
          justify-content: space-between;
          margin: 5px 0;
          font-size: 13px;
        }

        .payment-label {
          font-weight: 600;
        }

        .payment-value {
          font-weight: 700;
        }

        /* Grand Total - CENTERED */
        .grand-total-section {
          text-align: center;
          margin: 12px 0;
          padding: 10px 0;
        }

        .grand-label {
          font-size: 16px;
          font-weight: 900;
          margin-bottom: 4px;
        }

        .grand-value {
          font-size: 20px;
          font-weight: 900;
        }

        /* Footer - CENTERED */
        .invoice-footer {
          text-align: center;
          margin-top: 15px;
        }

        .thank-you {
          font-size: 13px;
          font-weight: 900;
          font-style: italic;
          margin-bottom: 10px;
        }

        .company-details {
          font-size: 10px;
          line-height: 1.5;
          font-weight: 600;
          margin-bottom: 10px;
        }

        .footer-note {
          font-size: 9px;
          font-weight: 600;
          margin: 8px 0;
          border: 1px solid #000;
          padding: 5px;
          display: inline-block;
        }

        .footer-stars {
          font-size: 10px;
          margin-top: 8px;
          letter-spacing: 1px;
        }

        /* PRINT STYLES FOR THERMAL PRINTER */
        @media print {
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

          @page {
            size: 58mm auto;
            margin: 0;
          }

          html, body {
            width: 58mm;
            margin: 0;
            padding: 0;
            background: white;
          }

          .invoice-page {
            position: fixed;
            left: 0;
            top: 0;
            width: 58mm;
            margin: 0;
            padding: 0;
            background: white;
          }

          .invoice-container {
            width: 58mm;
            max-width: 58mm;
            margin: 0;
            padding: 0;
          }

          .thermal-invoice {
            width: 58mm;
            max-width: 58mm;
            margin: 0;
            padding: 2mm;
            border: none;
            box-shadow: none;
            font-size: 10px;
            line-height: 1.2;
          }

          .thermal-invoice * {
            color: #000 !important;
            background: transparent !important;
          }

          .logo-text {
            font-size: 16px !important;
          }

          .tagline {
            font-size: 8px !important;
          }

          .invoice-type {
            font-size: 12px !important;
          }

          .date-time {
            font-size: 8px !important;
          }

          .customer-label {
            font-size: 9px !important;
          }

          .customer-name {
            font-size: 12px !important;
          }

          .divider-line {
            font-size: 8px !important;
            margin: 1mm 0 !important;
          }

          .table-header {
            font-size: 8px !important;
          }

          .product-name {
            font-size: 10px !important;
          }

          .product-category {
            font-size: 7px !important;
          }

          .product-qty,
          .product-price,
          .product-total {
            font-size: 9px !important;
          }

          .product-divider {
            font-size: 8px !important;
            margin: 0.5mm 0 !important;
          }

          .summary-row,
          .payment-row {
            font-size: 9px !important;
          }

          .total-label {
            font-size: 11px !important;
          }

          .total-value {
            font-size: 14px !important;
          }

          .grand-label {
            font-size: 12px !important;
          }

          .grand-value {
            font-size: 15px !important;
          }

          .thank-you {
            font-size: 10px !important;
          }

          .company-details {
            font-size: 7px !important;
          }

          .footer-note {
            font-size: 6px !important;
            padding: 1mm !important;
          }

          .footer-stars {
            font-size: 8px !important;
          }

          .product-row {
            page-break-inside: avoid;
          }

          .summary-section,
          .payment-section,
          .total-amount-section,
          .grand-total-section {
            page-break-inside: avoid;
          }
        }
      `}</style>
    </>
  );
};

export default Invoice;
