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
          <div className="no-print" style={{ textAlign: 'center', marginBottom: '20px' }}>
            <button onClick={handlePrint} className="print-button">🖨️ Print Invoice</button>
          </div>

          {/* Main Invoice */}
          <div className="thermal-invoice">
            <InvoiceBody bill={bill} totalItems={totalItems} totalQty={totalQty} />
            <div className="divider-line">═══════════════════════════════════</div>
            <div className="copy-text">*** CUSTOMER COPY ***</div>
          </div>

          {/* Duplicate Copy */}
          <div className="thermal-invoice duplicate">
            <InvoiceBody bill={bill} totalItems={totalItems} totalQty={totalQty} />
            <div className="divider-line">═══════════════════════════════════</div>
            <div className="copy-text">*** STORE COPY ***</div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .invoice-page {
          padding: 20px;
          display: flex;
          justify-content: center;
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
          font-weight: 700;
          line-height: 1.4;
          color: #000;
          background: #fff;
          padding: 15px;
          border: 2px solid #000;
          margin-bottom: 20px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        }

        .duplicate {
          border-style: dashed;
        }

        .print-button {
          background: linear-gradient(135deg, #4c68d7 0%, #283e9a 100%);
          color: white;
          border: none;
          padding: 14px 28px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 16px;
          font-weight: 700;
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        }

        .print-button:hover {
          transform: translateY(-2px);
        }

        .divider-line {
          text-align: center;
          font-size: 10px;
          margin: 8px 0;
        }

        .copy-text {
          text-align: center;
          font-size: 11px;
          font-weight: 900;
          margin-top: 5px;
        }

        @media print {
          body * { visibility: hidden; }
          .invoice-page, .invoice-page * { visibility: visible; }
          .no-print { display: none !important; }

          @page {
            size: 80mm auto;
            margin: 0;
          }

          html, body {
            width: 80mm;
            margin: 0;
            padding: 0;
            background: white;
          }

          .invoice-page {
            width: 80mm;
            padding: 0;
            background: white;
          }

          .invoice-container {
            width: 80mm;
            margin: 0;
          }

          .thermal-invoice {
            width: 80mm;
            padding: 2mm;
            border: none;
            box-shadow: none;
            font-size: 11px;
            font-weight: 800;
            line-height: 1.3;
          }

          .copy-text {
            font-size: 9px;
            font-weight: 900;
            margin-top: 2mm;
          }
        }
      `}</style>
    </>
  );
};

/* 🔁 Extracted Invoice Body Component */
const InvoiceBody = ({ bill, totalItems, totalQty }) => (
  <>
    <div className="invoice-header">
      <div className="logo-text">SANGHAMITRA</div>
      <div className="tagline">Business Incubator</div>
      <div className="invoice-type">TAX INVOICE</div>
      <div className="date-time">
        {new Date(bill.date).toLocaleDateString('en-GB')} {new Date(bill.date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}
      </div>
    </div>

    <div className="customer-section">
      <div className="customer-label">Customer:</div>
      <div className="customer-name">{bill.customerName}</div>
    </div>

    <div className="divider-line">═══════════════════════════════════</div>

    <div className="table-header">
      <div className="th-item">ITEM</div>
      <div className="th-qty">QTY</div>
      <div className="th-price">PRICE</div>
      <div className="th-amt">AMT</div>
    </div>

    <div className="divider-line">───────────────────────────────────</div>

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
        </div>
      ))}
    </div>

    <div className="divider-line">═══════════════════════════════════</div>

    <div className="summary-section">
      <div className="summary-row"><span>Total Items:</span> <span>{totalItems}</span></div>
      <div className="summary-row"><span>Total Qty:</span> <span>{totalQty}</span></div>
    </div>

    <div className="divider-line">───────────────────────────────────</div>

    <div className="total-amount-section">
      <div className="total-label">TOTAL AMOUNT:</div>
      <div className="total-value">₹{bill.totalAmount?.toFixed(2)}</div>
    </div>

    <div className="divider-line">═══════════════════════════════════</div>

    <div className="grand-total-section">
      <div className="grand-label">GRAND TOTAL</div>
      <div className="grand-value">₹{bill.totalAmount?.toFixed(2)}</div>
    </div>

    <div className="divider-line">═══════════════════════════════════</div>

    <div className="invoice-footer">
      <div className="thank-you">Thank you for your business!</div>
      <div className="company-details">
        <div>Sanghamitra Business Incubator</div>
        <div>Contact: +91 9234567890</div>
        <div>sanghamitra.store</div>
      </div>
      <div className="footer-note">Goods sold are not returnable</div>
    </div>
  </>
);

export default Invoice;
