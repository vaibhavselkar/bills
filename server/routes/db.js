const express = require('express');
const router = express.Router();
const Bill = require('../model/bill_schema');
const {auth}  = require("../middleware/auth");

// POST: Create a new bill (linked to logged-in user)
router.post("/", auth, async (req, res) => {
  try {
    const { customerName, products, totalAmount, paymentMethod } = req.body;

    if (!customerName || !products || !totalAmount || !paymentMethod) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Attach logged-in user ID
    const newBill = new Bill({
      customerName,
      products,
      totalAmount,
      paymentMethod,
      user: req.user._id, // 👈 link bill to user
    });

    await newBill.save();
    res.status(201).json({ message: "Bill added successfully", bill: newBill });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

// GET: Fetch bills (user sees their bills, admin sees all)
router.get("/", auth, async (req, res) => {
  try {
    let { startDate, endDate } = req.query;

    let filter = {};
    if (startDate && endDate) {
      filter.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate + "T23:59:59.999Z"),
      };
    }

    // If user is not admin → show only their own bills
    if (req.user.role !== "admin") {
      filter.user = req.user._id;
    }

    const bills = await Bill.find(filter).populate("user", "name email role");
    res.json(bills);
  } catch (err) {
    console.error("Error fetching bills:", err);
    res.status(500).json({ error: "Server error" });
  }
});



// GET: Fetch bill by ID
router.get("/bill/:id", auth, async (req, res) => {
  try {
    const bill = await Bill.findById(req.params.id);
    if (!bill) {
      return res.status(404).json({ message: "Bill not found" });
    }
    res.status(200).json(bill);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

// DELETE: Delete a bill
router.delete("/:id", async (req, res) => {
    try {
        const deletedBill = await Bill.findByIdAndDelete(req.params.id);
        if (!deletedBill) {
            return res.status(404).json({ success: false, message: "Bill not found" });
        }
        res.json({ success: true, message: "Bill deleted successfully", bill: deletedBill });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
});

// Get top selling products by revenue and quantity
router.get("/top-products", async (req, res) => {
  try {
    const bills = await Bill.find();

    const productStats = {}; // key: product+category, value: { revenue, totalSold }

    bills.forEach((bill) => {
      bill.products.forEach((p) => {
        const key = `${p.product} (${p.category})`;

        if (!productStats[key]) {
          productStats[key] = { name: key, revenue: 0, totalSold: 0 };
        }

        productStats[key].revenue += p.total;      // revenue
        productStats[key].totalSold += p.quantity; // total quantity sold
      });
    });

    // Convert object to array
    const result = Object.values(productStats);

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
