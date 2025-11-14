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

  // 👉 Calculate totals
  const totalQty = bill.products.reduce((sum, p) => sum + (p.quantity || 0), 0);
  const totalItems = bill.products.length;

  return (
    <div className="dashboard">
      <Navbar />

      <div className="invoice-page">
        <div className="invoice-container">
          
          {/* Print Button - Hidden when printing */}
          <div className="no-print" style={{ textAlign: 'center', marginBottom: '20px' }}>
            <button onClick={handlePrint} className="print-button">Print Invoice</button>
          </div>

          {/* Invoice Content */}
          <div className="invoice thermal-invoice">
            <div className="invoice-header">
              <h2 className="company-name">SANGHAMITRA</h2>
              <p className="invoice-info">Date: {new Date(bill.date).toLocaleDateString()}</p>
              <p className="invoice-info">Customer: {bill.customerName}</p>
              <h3 className="invoice-title">INVOICE</h3>
            </div>

            {/* Products Table */}
            <div className="products-table">
              {/* Header row */}
              <div className="table-row header-row">
                <div className="col-product">Product</div>
                <div className="col-qty">Qty</div>
                <div className="col-price">Price</div>
                <div className="col-total">Total</div>
              </div>

              {/* Data rows */}
              {bill.products.map((p, index) => (
                <div className="table-row" key={index}>
                  <div className="col-product">{p.product}</div>
                  <div className="col-qty">{p.quantity}</div>
                  <div className="col-price">₹{p.price?.toFixed(2)}</div>
                  <div className="col-total">₹{p.total?.toFixed(2)}</div>
                </div>
              ))}
            </div>

            <hr className="divider" />
            
            {/* Totals */}
            <div className="totals-section">
              <div className="total-row">
                <span>Total Amount</span>
                <span>₹{bill.totalAmount?.toFixed(2)}</span>
              </div>
              <div className="total-row">
                <span>Total Quantity:</span>
                <span>{totalQty}</span>
              </div>
              <div className="total-row">
                <span>Total Items:</span>
                <span>{totalItems}</span>
              </div>
            </div>

            {/* Footer */}
            <div className="invoice-footer">
              <div className="thank-you">Thank you for your business!</div>
              <div className="company-info">
                Sanghamitra Business Incubator<br />
                Website: sanghamitra.store<br />
                Contact: +919234567890
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
        }

        .invoice-container {
          max-width: 600px;
          width: 100%;
        }

        .thermal-invoice {
          font-family: 'Courier New', monospace;
          font-size: 14px;
          line-height: 1.3;
          color: black;
          background: white;
          padding: 15px;
          border: 1px solid #ddd;
          margin: 0 auto;
        }

        /* Print Button */
        .print-button {
          background: #007bff;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 5px;
          cursor: pointer;
          font-size: 16px;
        }

        .print-button:hover {
          background: #0056b3;
        }

        /* Invoice Header */
        .invoice-header {
          text-align: center;
          margin-bottom: 15px;
          border-bottom: 2px dashed #000;
          padding-bottom: 10px;
        }

        .logo {
          width: 60px;
          height: auto;
          margin-bottom: 5px;
        }

        .company-name {
          margin: 5px 0;
          font-size: 18px;
          font-weight: bold;
          text-transform: uppercase;
        }

        .invoice-info {
          margin: 3px 0;
          font-size: 12px;
          font-weight: bold;
        }

        .invoice-title {
          margin: 8px 0 5px 0;
          font-weight: bold;
          text-decoration: underline;
        }

        /* Products Table */
        .products-table {
          margin: 10px 0;
        }

        .table-row {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 1fr;
          gap: 5px;
          padding: 3px 0;
          border-bottom: 1px dotted black;
          font-weight: bold;
        }

        .header-row {
          font-weight: bold;
          border-bottom: 2px solid #000;
          padding-bottom: 5px;
          margin-bottom: 5px;
        }

        .col-product {
          text-align: left;
          word-break: break-word;
        }

        .col-qty {
          text-align: center;
        }

        .col-price {
          text-align: center;
        }

        .col-total {
          text-align: right;
        }

        /* Divider */
        .divider {
          border: none;
          border-top: 2px dashed #000;
          margin: 10px 0;
        }

        /* Totals Section */
        .totals-section {
          margin: 10px 0;
        }

        .total-row {
          display: flex;
          justify-content: space-between;
          font-weight: bold;
          margin: 3px 0;
          padding: 2px 0;
        }

        .total-row:first-child {
          border-top: 1px solid #000;
          border-bottom: 1px solid #000;
          padding: 5px 0;
          font-size: 15px;
        }

        /* Footer */
        .invoice-footer {
          text-align: center;
          margin-top: 15px;
          padding-top: 10px;
          border-top: 2px dashed #000;
        }

        .thank-you {
          font-weight: bold;
          margin-bottom: 8px;
          font-style: italic;
        }

        .company-info {
          font-size: 11px;
          line-height: 1.4;
          font-weight: bold;
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
          }
          
          .dashboard {
            margin: 0 !important;
            padding: 0 !important;
          }
          
          /* Hide navbar and other elements */
          .dashboard > :not(.invoice-page) {
            display: none !important;
          }
          
          .thermal-invoice {
            width: 80mm !important;
            max-width: 80mm !important;
            margin: 0 auto !important;
            padding: 5px !important;
            font-size: 12px !important;
            line-height: 1.2 !important;
            border: none !important;
            box-shadow: none !important;
          }
          
          body {
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
            color: black !important;
            font-family: 'Courier New', monospace !important;
          }
          
          /* Hide links in print */
          a {
            text-decoration: none !important;
            color: black !important;
          }

          @page {
            margin: 0;
            size: 80mm auto;
          }
          
          /* Ensure text is black and background white */
          * {
            color: black !important;
            background: transparent !important;
            background-color: white !important;
          }
          
          /* Optimize for thermal paper */
          .table-row {
            break-inside: avoid;
          }
        }
      `}</style>
    </div>
  );
};

export default Invoice;
