const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");

const connectDB = require("../config/db.js");
const User = require("../models/user.model.js");

dotenv.config();

const createAdmin = async () => {
  try {
    await connectDB();

    const email = "Admin@gmail.com";
    const password = "admin5656";

    const existingAdmin = await User.findOne({ email });

    if (existingAdmin) {
      console.log("Admin already exists");
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await User.create({
      firstName: "System",
      lastName: "Admin",
      userName: "systemadmin",
      email,
      password: hashedPassword,
      role: "ADMIN",
    });

    console.log("Admin created successfully");
    console.log(`Email: ${admin.email}`);
    console.log(`Role: ${admin.role}`);

    process.exit(0);
  } catch (error) {
    console.error("Failed to create admin:", error.message);
    process.exit(1);
  }
};

createAdmin();
