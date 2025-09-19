// server.js or a dedicated seed script
const bcrypt = require("bcryptjs");
const User = require("./model/User");  // adjust path

async function seedAdmin() {
  const adminExists = await User.findOne({ email: "pattem@gmail.com" });
  if (!adminExists) {
    const hashedPassword = await bcrypt.hash("admin123", 10);
    await User.create({
      name: "Sanghamitra Admin",
      email: "pattem@gmail.com",
      password: hashedPassword,
      role: "admin"
    });
    console.log("✅ Admin created successfully");
  } else {
    console.log("⚡ Admin already exists");
  }
}

seedAdmin();
