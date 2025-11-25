import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const Invoice = () => {
  const [bill, setBill] = useState(null);
  const { id } = useParams();

  useEffect(() => {
    const fetchBillById = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`https://bills-weld.vercel.app/api/bills/bill/${id}`, {
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
            {/* Header - CENTERED */}
            <div className="header">SANGHAMITRA</div>
            <div className="subheader">Business Incubator</div>
            <div className="invoice-title">TAX INVOICE</div>
            <div className="datetime">
              {new Date(bill.date).toLocaleDateString('en-GB').replace(/\//g, '/')} {new Date(bill.date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}
            </div>

            {/* Customer - LEFT ALIGNED */}
            <div className="customer">
              Customer: <span className="customer-name">{bill.customerName}</span>
            </div>

            <div className="divider">════════════════════════════════════════════</div>

            {/* Table Header */}
            <div className="table-header">
              <div className="col-item">ITEM</div>
              <div className="col-qty">QTY</div>
              <div className="col-price">PRICE</div>
              <div className="col-amt">AMT</div>
            </div>

            <div className="divider-thin">────────────────────────────────────────────</div>

            {/* Products */}
            {bill.products.map((p, index) => (
              <div key={index}>
                <div className="product-row">
                  <div className="item-col">
                    <div className="item-name">{p.product}</div>
                    <div className="item-cat">{p.category}</div>
                  </div>
                  <div className="qty-col">{p.quantity}</div>
                  <div className="price-col">₹{p.price?.toFixed(2)}</div>
                  <div className="amt-col">₹{p.total?.toFixed(2)}</div>
                </div>
                <div className="item-divider">- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -</div>
              </div>
            ))}

            <div className="divider">════════════════════════════════════════════</div>

            {/* Summary - RIGHT ALIGNED */}
            <div className="summary">
              <div className="sum-row">
                <span>Total Items:</span>
                <span>{totalItems}</span>
              </div>
              <div className="sum-row">
                <span>Total Qty:</span>
                <span>{totalQty}</span>
              </div>
            </div>

            <div className="divider-thin">────────────────────────────────────────────</div>

            {/* Total - CENTERED & BOLD */}
            <div className="total-section">
              <div className="total-label">TOTAL AMOUNT:</div>
              <div className="total-value">₹{bill.totalAmount?.toFixed(2)}</div>
            </div>

            <div className="divider">════════════════════════════════════════════</div>

            {/* Payment */}
            <div className="payment">
              <div className="pay-row">
                <span>Sub Total:</span>
                <span>₹{bill.totalAmount?.toFixed(2)}</span>
              </div>
              <div className="pay-row">
                <span>Tax:</span>
                <span>₹0.00</span>
              </div>
            </div>

            <div className="divider-thin">────────────────────────────────────────────</div>

            {/* Grand Total - CENTERED */}
            <div className="grand-total">
              <div className="grand-label">GRAND TOTAL:</div>
              <div className="grand-value">₹{bill.totalAmount?.toFixed(2)}</div>
            </div>

            <div className="divider">════════════════════════════════════════════</div>

            {/* Footer - CENTERED */}
            <div className="footer">
              <div className="thanks">Thank you for your business!</div>
              <div className="company-info">
                <div>Sanghamitra Business Incubator</div>
                <div>Contact: +91 9234567890</div>
                <div>sanghamitra.store</div>
              </div>
              <div className="return-policy">Goods sold are not returnable</div>
              <div className="stars">★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★</div>
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
          min-height: 100vh;
        }

        .invoice-container {
          width: 100%;
          max-width: 400px;
        }

        .thermal-invoice {
          font-family: 'Courier New', monospace;
          font-size: 15px;
          line-height: 1.4;
          color: #000;
          background: #fff;
          padding: 20px;
          border: 2px solid #333;
          box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        }

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
        }

        .header {
          text-align: center;
          font-size: 24px;
          font-weight: 900;
          letter-spacing: 3px;
          margin-bottom: 4px;
        }

        .subheader {
          text-align: center;
          font-size: 12px;
          font-weight: 600;
          margin-bottom: 10px;
        }

        .invoice-title {
          text-align: center;
          font-size: 18px;
          font-weight: 900;
          margin: 10px 0 6px 0;
        }

        .datetime {
          text-align: center;
          font-size: 11px;
          font-weight: 600;
          margin-bottom: 12px;
        }

        .customer {
          margin: 12px 0;
          font-size: 12px;
          font-weight: 600;
        }

        .customer-name {
          font-size: 16px;
          font-weight: 900;
          margin-left: 10px;
        }

        .divider, .divider-thin, .item-divider {
          text-align: center;
          font-size: 10px;
          margin: 8px 0;
          overflow: hidden;
          white-space: nowrap;
        }

        .table-header {
          display: grid;
          grid-template-columns: 2fr 0.7fr 1fr 1fr;
          gap: 4px;
          font-weight: 900;
          font-size: 11px;
          text-align: center;
          margin: 8px 0;
        }

        .col-item { text-align: left; }

        .product-row {
          display: grid;
          grid-template-columns: 2fr 0.7fr 1fr 1fr;
          gap: 4px;
          margin: 8px 0;
          font-weight: 600;
          align-items: start;
        }

        .item-col {
          text-align: left;
        }

        .item-name {
          font-size: 14px;
          font-weight: 900;
          margin-bottom: 2px;
        }

        .item-cat {
          font-size: 10px;
          color: #666;
        }

        .qty-col, .price-col, .amt-col {
          text-align: center;
          font-size: 13px;
          font-weight: 700;
        }

        .summary, .payment {
          margin: 10px 0;
        }

        .sum-row, .pay-row {
          display: flex;
          justify-content: space-between;
          margin: 6px 0;
          font-size: 14px;
          font-weight: 700;
        }

        .total-section {
          text-align: center;
          margin: 14px 0;
          padding: 10px 0;
        }

        .total-label {
          font-size: 16px;
          font-weight: 900;
          margin-bottom: 4px;
        }

        .total-value {
          font-size: 20px;
          font-weight: 900;
        }

        .grand-total {
          text-align: center;
          margin: 14px 0;
          padding: 12px 0;
        }

        .grand-label {
          font-size: 17px;
          font-weight: 900;
          margin-bottom: 5px;
        }

        .grand-value {
          font-size: 22px;
          font-weight: 900;
        }

        .footer {
          text-align: center;
          margin-top: 16px;
        }

        .thanks {
          font-size: 14px;
          font-weight: 900;
          font-style: italic;
          margin-bottom: 12px;
        }

        .company-info {
          font-size: 11px;
          line-height: 1.6;
          font-weight: 600;
          margin-bottom: 12px;
        }

        .return-policy {
          font-size: 10px;
          font-weight: 600;
          margin: 10px 0;
          border: 1px solid #000;
          padding: 6px;
          display: inline-block;
        }

        .stars {
          font-size: 11px;
          margin-top: 10px;
          letter-spacing: 1px;
        }

        /* PRINT STYLES FOR 78mm THERMAL PRINTER */
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
            size: 78mm auto;
            margin: 0;
          }

          html, body {
            width: 78mm;
            margin: 0;
            padding: 0;
            background: white;
          }

          .invoice-page {
            position: fixed;
            left: 0;
            top: 0;
            width: 78mm;
            margin: 0;
            padding: 0;
            background: white;
          }

          .invoice-container {
            width: 78mm;
            max-width: 78mm;
            margin: 0;
            padding: 0;
          }

          .thermal-invoice {
            width: 78mm;
            max-width: 78mm;
            margin: 0;
            padding: 3mm;
            border: none;
            box-shadow: none;
            font-size: 11px;
            line-height: 1.3;
          }

          .thermal-invoice * {
            color: #000 !important;
            background: transparent !important;
          }

          .header {
            font-size: 18px !important;
            letter-spacing: 2px !important;
          }

          .subheader {
            font-size: 9px !important;
          }

          .invoice-title {
            font-size: 14px !important;
          }

          .datetime {
            font-size: 9px !important;
          }

          .customer {
            font-size: 9px !important;
          }

          .customer-name {
            font-size: 13px !important;
          }

          .divider, .divider-thin {
            font-size: 8px !important;
            margin: 1mm 0 !important;
          }

          .item-divider {
            font-size: 8px !important;
            margin: 0.5mm 0 !important;
          }

          .table-header {
            font-size: 9px !important;
          }

          .item-name {
            font-size: 11px !important;
          }

          .item-cat {
            font-size: 8px !important;
          }

          .qty-col, .price-col, .amt-col {
            font-size: 10px !important;
          }

          .sum-row, .pay-row {
            font-size: 10px !important;
          }

          .total-label {
            font-size: 12px !important;
          }

          .total-value {
            font-size: 16px !important;
          }

          .grand-label {
            font-size: 13px !important;
          }

          .grand-value {
            font-size: 17px !important;
          }

          .thanks {
            font-size: 11px !important;
          }

          .company-info {
            font-size: 8px !important;
          }

          .return-policy {
            font-size: 7px !important;
            padding: 1mm !important;
          }

          .stars {
            font-size: 9px !important;
          }

          .product-row {
            page-break-inside: avoid;
          }
        }
      `}</style>
    </>
  );
};

export default Invoice;
