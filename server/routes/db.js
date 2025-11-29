const express = require('express');
const router = express.Router();
const Bill = require('../model/bill_schema');
const User = require('../model/User');
const {auth}  = require("../middleware/auth");
const Occasion = require('../model/Occasion');
const Product = require('../model/Product');
  
// GET: Fetch bills (user sees their bills, admin sees all)
router.get("/", auth, async (req, res) => { 
  try {
    let { startDate, endDate } = req.query;

    let filter = {};
    
    // DATE FILTER
    if (startDate && endDate) {
      filter.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate + "T23:59:59.999Z"),
      };
    }

    // 🔥 MULTI-TENANT FILTER - CRITICAL FIX
    if (req.user.role === "admin") {
      // Admin sees all bills from users in their organization
      // Get all user IDs from this tenant
      const usersInTenant = await User.find({ 
        tenantId: req.user.tenantId 
      }).select('_id');
      
      const userIds = usersInTenant.map(u => u._id);
      
      // Filter bills by these user IDs
      filter.user = { $in: userIds };
      
      console.log(`Admin (tenant: ${req.user.tenantId}) fetching bills for ${userIds.length} users`);
    } else {
      // Regular user sees only their own bills
      filter.user = req.user._id;
      
      console.log(`User ${req.user._id} fetching their own bills`);
    }

    const bills = await Bill.find(filter)
      .populate("user", "name email role tenantId")
      .sort({ date: -1 });
    
    console.log(`Returning ${bills.length} bills`);
    
    res.json(bills);
  } catch (err) {
    console.error("Error fetching bills:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// GET: Fetch bill by ID (with tenant check)
router.get("/bill/:id", auth, async (req, res) => {
  try {
    const bill = await Bill.findById(req.params.id).populate("user", "tenantId");
    
    if (!bill) {
      return res.status(404).json({ message: "Bill not found" });
    }

    // 🔥 Security: Verify tenant access
    if (bill.user.tenantId !== req.user.tenantId) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.status(200).json(bill);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

// DELETE: Delete a bill (with tenant check)
router.delete("/:id", auth, async (req, res) => {
  try {
    const bill = await Bill.findById(req.params.id).populate("user", "tenantId");
    
    if (!bill) {
      return res.status(404).json({ success: false, message: "Bill not found" });
    }

    // 🔥 Security: Verify tenant access
    if (bill.user.tenantId !== req.user.tenantId) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    await Bill.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Bill deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
});

// POST: Create a new bill (tenant is inherited from user)
router.post("/", auth, async (req, res) => {
  try {
    const { customerName, mobileNumber, products, totalAmount, paymentMethod } = req.body;

    if (!customerName || !products || !totalAmount || !paymentMethod) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // 🟣 Fetch current active occasion
    const occasionDoc = await Occasion.findOne({ tenantId: req.user.tenantId });
    let billType = "daily";
    let occasion = "";

    if (occasionDoc && occasionDoc.activeOccasion) {
      billType = "special";
      occasion = occasionDoc.activeOccasion;
    }

    // 🆕 Process products and update stock
    const processedProducts = [];
    
    for (const item of products) {
      // 🔥 Find product within tenant's inventory
      const originalProduct = await Product.findOne({
        _id: item.productId,
        tenantId: req.user.tenantId // Ensure product belongs to same tenant
      });
      
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

    // 🔥 Create new bill (user field automatically associates with tenant)
    const newBill = new Bill({
      customerName,
      mobileNumber,
      products: processedProducts,
      totalAmount,
      paymentMethod,
      billType,
      occasion,
      user: req.user._id // This user has tenantId
    });

    await newBill.save();
    
    // Populate user data for response
    await newBill.populate("user", "name email role tenantId");
    
    res.status(201).json({
      message: "Bill created successfully",
      bill: newBill
    });

  } catch (err) {
    console.error("Error creating bill:", err);
    res.status(500).json({ error: "Server error", details: err.message });
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

// 🟢 Set or update current active occasion (with auth and tenantId)
router.post("/set-occasion", auth, async (req, res) => {
  try {
    const { occasion } = req.body;

    if (!occasion || !occasion.trim()) {
      return res.status(400).json({ message: "Occasion name is required" });
    }

    let occasionDoc = await Occasion.findOne({ 
      tenantId: req.user.tenantId // 🔥 Find by tenant
    });

    if (!occasionDoc) {
      // Create new occasion document for this tenant
      occasionDoc = new Occasion({
        tenantId: req.user.tenantId,
        activeOccasion: occasion.trim(),
        createdBy: {
          userId: req.user._id,
          name: req.user.name,
          email: req.user.email
        }
      });
    } else {
      // Update existing occasion
      occasionDoc.activeOccasion = occasion.trim();
      occasionDoc.updatedAt = new Date();
    }

    await occasionDoc.save();

    res.json({ 
      message: "Occasion updated successfully", 
      activeOccasion: occasion.trim() 
    });
  } catch (error) {
    console.error("Error setting occasion:", error);
    res.status(500).json({ message: "Failed to set occasion" });
  }
});

// 🟣 Get current active occasion (with auth and tenantId)
router.get("/get-occasion", auth, async (req, res) => {
  try {
    const occasion = await Occasion.findOne({ 
      tenantId: req.user.tenantId // 🔥 Get for user's tenant
    });
    
    res.json(occasion || { activeOccasion: "" });
  } catch (error) {
    console.error("Error fetching occasion:", error);
    res.status(500).json({ message: "Failed to get occasion" });
  }
});

// 🔴 Clear occasion (with auth and tenantId)
router.post("/clear-occasion", auth, async (req, res) => {
  try {
    let occasionDoc = await Occasion.findOne({ 
      tenantId: req.user.tenantId // 🔥 Find by tenant
    });

    if (!occasionDoc) {
      // Create empty occasion document if doesn't exist
      occasionDoc = new Occasion({
        tenantId: req.user.tenantId,
        activeOccasion: "",
        createdBy: {
          userId: req.user._id,
          name: req.user.name,
          email: req.user.email
        }
      });
    } else {
      occasionDoc.activeOccasion = "";
      occasionDoc.updatedAt = new Date();
    }

    await occasionDoc.save();
    
    res.json({ message: "Occasion cleared" });
  } catch (error) {
    console.error("Error clearing occasion:", error);
    res.status(500).json({ message: "Failed to clear occasion" });
  }
});

// 🟢 Get all occasions with their bill counts and users (tenant-specific)
router.get("/occasion-summary", auth, async (req, res) => {
  try {
    // Build base filter for bills with occasions
    let matchFilter = { 
      occasion: { $ne: "" } 
    };

    // If user is not admin, only show their own bills
    if (req.user.role !== "admin") {
      matchFilter.user = req.user._id;
    }

    // Get all distinct occasions from bills
    const occasions = await Bill.aggregate([
      {
        $match: matchFilter
      },
      {
        $lookup: {
          from: "users", // Join with users collection
          localField: "user",
          foreignField: "_id",
          as: "userDetails"
        }
      },
      {
        $unwind: "$userDetails"
      },
      {
        $match: {
          "userDetails.tenantId": req.user.tenantId // 🔥 Filter by tenant
        }
      },
      {
        $group: {
          _id: "$occasion",
          totalBills: { $sum: 1 },
          totalRevenue: { $sum: "$totalAmount" },
          users: { $addToSet: "$user" } // collect unique users
        }
      },
      {
        $sort: { totalBills: -1 } // Sort by most bills
      }
    ]);

    // Populate user details (name, email)
    const populated = await Bill.populate(occasions, {
      path: "users",
      select: "name email",
      model: "User",
    });

    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;






