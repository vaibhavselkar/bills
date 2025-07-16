const express = require('express');
const router = express.Router();
const Bill = require('../model/bill_schema');

// Create a new bill
// POST: Create a new bill
router.post("/", async (req, res) => {
    try {
        const { customerName, products, totalAmount, paymentMethod } = req.body;
        console.log("Received data:", req.body); // 🔍 Add this line

        // Validate required fields
        if (!customerName || !products || !totalAmount || !paymentMethod) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        // Create new bill
        const newBill = new Bill({
            customerName,
            products,
            totalAmount,
            paymentMethod,
        });

        await newBill.save();
        res.status(201).json({ message: "Bill added successfully", bill: newBill });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
});

// GET: Fetch all bills
router.get("/", async (req, res) => {
  try {
    const bills = await Bill.find().sort({ createdAt: -1 });
    res.json(bills);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

// GET: Fetch bill by ID
router.get("/:id", async (req, res) => {
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


module.exports = router;
