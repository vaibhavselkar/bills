const express = require('express');
const router = express.Router();
const Bill = require('../model/bill_schema');
const {auth}  = require("../middleware/auth");
const Occasion = require('../model/Occasion');
const Product = require('../model/Product');


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

// POST: Create a new bill (linked to logged-in user) with stock management
router.post("/", auth, async (req, res) => {
  try {
    const { customerName, mobileNumber, products, totalAmount, paymentMethod } = req.body;

    if (!customerName || !products || !totalAmount || !paymentMethod) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // 🟣 Fetch current active occasion
    const occasionDoc = await Occasion.findOne();
    let billType = "daily";
    let occasion = "";

    if (occasionDoc && occasionDoc.activeOccasion) {
      billType = "special";
      occasion = occasionDoc.activeOccasion;
    }

    // 🆕 Process products and update stock
    const processedProducts = [];
    
    for (const item of products) {
      // Find the original product
      const originalProduct = await Product.findById(item.productId);
      if (!originalProduct) {
        return res.status(404).json({ 
          message: `Product not found with ID: ${item.productId}` 
        });
      }

      // Find the specific category
      const category = originalProduct.categories.find(
        cat => cat.name === item.category
      );
      
      if (!category) {
        return res.status(404).json({ 
          message: `Category not found: ${item.category}` 
        });
      }

      let subcategoryData = null;
      
      // If subcategory SKU is provided, find and validate the subcategory
      if (item.subcategory && item.subcategory.sku) {
        subcategoryData = category.subcategories.find(
          sub => sub.sku === item.subcategory.sku
        );
        
        if (!subcategoryData) {
          return res.status(404).json({ 
            message: `Subcategory not found with SKU: ${item.subcategory.sku}` 
          });
        }

        // Check stock availability for subcategory
        if (subcategoryData.stock < item.quantity) {
          return res.status(400).json({
            message: `Insufficient stock for ${originalProduct.product} - SKU: ${item.subcategory.sku}. Available: ${subcategoryData.stock}`
          });
        }

        // Update subcategory stock
        subcategoryData.stock -= item.quantity;
      } else {
        // Check stock availability for category (no subcategories)
        if (category.stock < item.quantity) {
          return res.status(400).json({
            message: `Insufficient stock for ${originalProduct.product} - ${category.name}. Available: ${category.stock}`
          });
        }

        // Update category stock
        category.stock -= item.quantity;
      }

      // Save the updated product with new stock values
      await originalProduct.save();

      // Prepare product data for bill
      const billProduct = {
        productId: item.productId,
        product: originalProduct.product,
        category: item.category,
        subcategory: {
          design: item.subcategory?.design || '',
          color: item.subcategory?.color || '',
          size: item.subcategory?.size || '',
          sku: item.subcategory?.sku || ''
        },
        price: item.price,
        discount: item.discount || 0,
        quantity: item.quantity,
        total: item.total
      };

      processedProducts.push(billProduct);
    }

    // 🆕 Create the new bill with processed products
    const newBill = new Bill({
      customerName,
      mobileNumber,
      products: processedProducts,
      totalAmount,
      paymentMethod,
      user: req.user._id, // link bill to user
      billType,
      occasion,
    });

    await newBill.save();
    
    res.status(201).json({ 
      message: "Bill added successfully", 
      bill: newBill 
    });
    
  } catch (error) {
    console.error("Error creating bill:", error);
    res.status(500).json({ 
      message: "Server Error", 
      error: error.message 
    });
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


// 🟢 Set or update current active occasion
router.post("/set-occasion", async (req, res) => {
  try {
    const { occasion } = req.body; // <-- changed from activeOccasion

    let occasionDoc = await Occasion.findOne();
    if (!occasionDoc) occasionDoc = new Occasion();

    occasionDoc.activeOccasion = occasion;
    await occasionDoc.save();

    res.json({ message: "Occasion updated successfully", activeOccasion: occasion });
  } catch (error) {
    console.error("Error setting occasion:", error);
    res.status(500).json({ message: "Failed to set occasion" });
  }
});

// 🟣 Get current active occasion
router.get("/get-occasion", async (req, res) => {
  try {
    const occasion = await Occasion.findOne();
    res.json(occasion || { activeOccasion: "" });
  } catch (error) {
    console.error("Error fetching occasion:", error);
    res.status(500).json({ message: "Failed to get occasion" });
  }
});

// 🔴 Clear occasion (you’re calling this from React)
router.post("/clear-occasion", async (req, res) => {
  try {
    let occasionDoc = await Occasion.findOne();
    if (!occasionDoc) occasionDoc = new Occasion();
    occasionDoc.activeOccasion = "";
    await occasionDoc.save();
    res.json({ message: "Occasion cleared" });
  } catch (error) {
    console.error("Error clearing occasion:", error);
    res.status(500).json({ message: "Failed to clear occasion" });
  }
});


// 🟢 Get all occasions with their bill counts and users
router.get("/occasion-summary", async (req, res) => {
  try {
    // Get all distinct occasions from bills
    const occasions = await Bill.aggregate([
      {
        $match: { occasion: { $ne: "" } }, // only bills with an occasion
      },
      {
        $group: {
          _id: "$occasion",
          totalBills: { $sum: 1 },
          users: { $addToSet: "$user" }, // collect unique users
        },
      },
    ]);

    // Populate user details (name, email)
    const populated = await Bill.populate(occasions, {
      path: "users",
      select: "name email",
      model: "User",
    });

    res.json(populated);
  } catch (error) {
    console.error("Error fetching occasion summary:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
