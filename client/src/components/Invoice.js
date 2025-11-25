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

        if (!res.ok) throw new Error("Unauthorized or failed to fetch bill");

        const data = await res.json();
        setBill(data);
      } catch (err) {
        console.error("Error fetching bill:", err);
      }
    };

    fetchBillById();
  }, [id]);

  const handlePrint = () => window.print();

  if (!bill)
    return <div style={{ padding: '20px', textAlign: 'center' }}>Loading invoice...</div>;

  const totalQty = bill.products.reduce((sum, p) => sum + (p.quantity || 0), 0);
  const totalItems = bill.products.length;

  return (
    <>
      <div className="invoice-page">
        <div className="invoice-container">

          {/* Print Button */}
          <div className="no-print" style={{ textAlign: 'center', marginBottom: '20px' }}>
            <button onClick={handlePrint} className="print-button">🖨️ Print Invoice</button>
          </div>

          {/* Thermal Invoice */}
          <div className="thermal-invoice">
            <div className="invoice-header">
              <div className="logo-text">SANGHAMITRA</div>
              <div className="tagline">Business Incubator</div>
              <div className="invoice-type">TAX INVOICE</div>
              <div className="date-time">
                {new Date(bill.date).toLocaleDateString('en-GB')}{" "}
                {new Date(bill.date).toLocaleTimeString('en-IN', {
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: true,
                })}
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
              {bill.products.map((p, i) => (
                <div key={i} className="product-row">
                  <div className="product-info">
                    <div className="product-name">{p.product}</div>
                    <div className="product-category"><b>{p.category}</b></div>
                  </div>
                  <div className="product-qty">{p.quantity}</div>
                  <div className="product-price">₹{p.price?.toFixed(2)}</div>
                  <div className="product-total">₹{p.total?.toFixed(2)}</div>
                </div>
              ))}
            </div>

            <div className="divider-line">═══════════════════════════════════</div>

            {/* Total Row (Items + Qty same line) */}
            <div className="summary-row single-line">
              <span>Total Items: {totalItems}</span>
              <span>Total Qty: {totalQty}</span>
            </div>

            <div className="divider-line">───────────────────────────────────</div>

            {/* Total Amount */}
            <div className="total-amount-section">
              <div className="total-label">TOTAL AMOUNT:</div>
              <div className="total-value">₹{bill.totalAmount?.toFixed(2)}</div>
            </div>

            <div className="divider-line">═══════════════════════════════════</div>

            {/* Footer with QR beside business details */}
            <div className="invoice-footer">
              <div className="thank-you">Thank you for your business!</div>

              <div className="footer-row">
                <div className="company-details">
                  <div><b>Sanghamitra Business Incubator</b></div>
                  <div><b>Contact:</b> +91 9234567890</div>
                  <div><b>sanghamitra.store</b></div>
                </div>

                {/* QR Code Image (saved in frontend assets or state) */}
                <img
                  src="/sanghamitra_qr.png" // replace with your actual local QR path (e.g., public/qr.png)
                  alt="QR Code"
                  className="qr-code"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        /* Screen Styles */
        .invoice-page {
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
          font-size: 15px;
          font-weight: 700;
          color: #000;
          background: #fff;
          padding: 15px;
          border: 2px solid #000;
          box-shadow: 0 4px 10px rgba(0,0,0,0.2);
        }

        .invoice-header {
          text-align: center;
          margin-bottom: 12px;
        }

        .logo-text {
          font-size: 22px;
          font-weight: 900;
        }

        .tagline {
          font-size: 12px;
          font-weight: 700;
        }

        .invoice-type {
          font-size: 16px;
          font-weight: 900;
          margin: 5px 0;
        }

        .date-time {
          font-size: 12px;
          font-weight: 700;
        }

        .customer-section {
          text-align: left;
          margin: 10px 0;
        }

        .customer-label {
          font-size: 13px;
          font-weight: 700;
        }

        .customer-name {
          font-size: 15px;
          font-weight: 900;
        }

        .divider-line {
          text-align: center;
          font-size: 12px;
          margin: 8px 0;
        }

        .table-header {
          display: grid;
          grid-template-columns: 2.5fr 0.8fr 1.2fr 1.2fr;
          font-weight: 900;
          font-size: 13px;
          text-align: center;
        }

        .th-item { text-align: left; }

        .product-row {
          display: grid;
          grid-template-columns: 2.5fr 0.8fr 1.2fr 1.2fr;
          font-size: 13px;
          font-weight: 700;
          margin: 5px 0;
        }

        .product-name {
          font-weight: 900;
          font-size: 14px;
        }

        .product-category {
          font-size: 11px;
          font-weight: 800;
          color: #333;
        }

        .summary-row.single-line {
          display: flex;
          justify-content: space-between;
          font-size: 14px;
          font-weight: 800;
        }

        .total-amount-section {
          text-align: right;
          margin-top: 10px;
        }

        .total-label {
          font-size: 16px;
          font-weight: 900;
        }

        .total-value {
          font-size: 18px;
          font-weight: 900;
        }

        .invoice-footer {
          text-align: center;
          margin-top: 15px;
        }

        .footer-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 10px;
        }

        .company-details {
          text-align: left;
          font-size: 12px;
          font-weight: 700;
          flex: 1;
        }

        .qr-code {
          width: 2cm;
          height: 2cm;
          object-fit: contain;
          margin-left: 10px;
        }

        .thank-you {
          font-weight: 900;
          font-size: 13px;
        }

        /* Print Styles for Thermal Printer */
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
          }

          .thermal-invoice {
            width: 80mm;
            padding: 3mm;
            border: none;
            box-shadow: none;
            font-size: 12px;
            font-weight: 800;
            line-height: 1.3;
          }

          .qr-code {
            width: 2cm;
            height: 2cm;
          }

          .logo-text { font-size: 18px !important; }
          .invoice-type { font-size: 13px !important; }
          .product-name { font-size: 12px !important; }
          .product-category { font-weight: 900 !important; }
          .total-value { font-size: 15px !important; }
        }
      `}</style>
    </>
  );
};

export default Invoice;
