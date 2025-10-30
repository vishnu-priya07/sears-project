// server.js
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
require("dotenv").config(); // 🔒 for environment variables

const app = express();
app.use(cors());
app.use(bodyParser.json());

// ✅ MongoDB connection (use .env for URI)
mongoose
  .connect(process.env.MONGO_URI || "mongodb://localhost:27017/searsDB", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB connected successfully"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// 🧩 Define Schemas
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  phone: { type: String, required: true },
  password: { type: String, required: true },
  lastLogin: { type: Date, default: Date.now },
});

const reportSchema = new mongoose.Schema({
  id: { type: String, unique: true },
  type: { type: String, required: true },
  description: String,
  reporter: {
    name: String,
    phone: String,
    info: String,
  },
  location: {
    lat: Number,
    lon: Number,
  },
  priority: { type: String, default: "medium" },
  assignedTo: String,
  assignedContact: String,
  distance: String,
  status: { type: String, default: "active" },
  date: { type: Date, default: Date.now },
  time: { type: Date, default: Date.now },
});

// 🧩 Create Models
const User = mongoose.model("User", userSchema);
const Report = mongoose.model("Report", reportSchema);

// 📍 Haversine Formula
function haversine(lat1, lon1, lat2, lon2) {
  const toRad = (x) => (x * Math.PI) / 180;
  const R = 6371; // km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// 📦 Load responders
let responders = [];
try {
  responders = require("./responders.json");
  console.log(`✅ Loaded ${responders.length} responders`);
} catch (err) {
  console.error("⚠️ Error loading responders.json:", err);
}

// 🔍 Find nearest responder
function findNearestResponder(type, lat, lon) {
  const available = responders.filter((r) =>
    r.types.some((t) => t.toLowerCase() === type.toLowerCase())
  );

  if (available.length === 0) return null;

  available.forEach((r) => {
    r.distance = haversine(lat, lon, r.location.lat, r.location.lon);
  });

  available.sort((a, b) => a.distance - b.distance);
  return available[0];
}

// 📢 Log dispatched alerts
function notifyResponder(responder, report) {
  const msg = {
    time: new Date().toISOString(),
    responder: responder.name,
    contact: responder.contact,
    reportId: report.id,
    emergencyType: report.type,
  };
  console.log("🚨 Dispatching alert:", msg);
  fs.appendFileSync(
    path.join(__dirname, "alerts.log"),
    JSON.stringify(msg) + "\n"
  );
}

// 🧾 USER ROUTES

// 🟢 Signup
app.post("/signup", async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    if (!name || !email || !phone || !password)
      return res.status(400).json({ error: "All fields are required." });

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ error: "Email already registered." });

    const newUser = new User({ name, email, phone, password });
    await newUser.save();

    res.status(201).json({ message: "Signup successful!", user: newUser });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ error: "Signup failed due to server error." });
  }
});

// 🟡 Login (track last login)
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email, password });
    if (!user) return res.status(401).json({ error: "Invalid credentials." });

    user.lastLogin = new Date();
    await user.save();

    res.json({ message: "Login successful!", user });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Login failed due to server error." });
  }
});

// 🆘 Report Emergency
app.post("/report", async (req, res) => {
  try {
    const { type, description, reporter, location, priority } = req.body;

    if (
      !type ||
      !description ||
      !reporter?.name ||
      !reporter?.phone ||
      !location?.lat ||
      !location?.lon
    ) {
      return res.status(400).json({
        error: "Missing required fields for report submission.",
      });
    }

    const responder = findNearestResponder(type, location.lat, location.lon);

    const newReport = new Report({
      id: "R" + Date.now(),
      type,
      description,
      reporter,
      location,
      priority: priority || "medium",
      assignedTo: responder ? responder.name : "Unassigned",
      assignedContact: responder ? responder.contact : "N/A",
      distance: responder
        ? responder.distance.toFixed(2) + " km"
        : "Not available",
      status: "active",
    });

    await newReport.save();

    if (responder) {
      notifyResponder(responder, newReport);
      res.json({
        status: "assigned",
        responder: { name: responder.name, contact: responder.contact },
        report: newReport,
      });
    } else {
      res.json({
        status: "no_responder",
        message: "⚠️ No available responder found for this emergency type.",
        report: newReport,
      });
    }
  } catch (err) {
    console.error("Report error:", err);
    res.status(500).json({ error: "Failed to submit report." });
  }
});

// 📜 Get all reports
app.get("/reports", async (req, res) => {
  try {
    const reports = await Report.find().sort({ time: -1 });
    res.json(reports);
  } catch (err) {
    console.error("Error fetching reports:", err);
    res.status(500).json({ error: "Failed to load reports." });
  }
});

// 🗑️ Delete a report
app.delete("/reports/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deletedReport = await Report.findOneAndDelete({
      $or: [{ _id: id }, { id }],
    });

    if (!deletedReport)
      return res.status(404).json({ error: "Report not found." });

    res.json({
      message: "Report deleted successfully.",
      deletedReport,
    });
  } catch (err) {
    console.error("Error deleting report:", err);
    res.status(500).json({ error: "Failed to delete report." });
  }
});

// 🧑‍🤝‍🧑 Get all users
app.get("/users", async (req, res) => {
  try {
    const users = await User.find({}, { password: 0 }); // hide passwords
    res.json(users);
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ error: "Failed to fetch users." });
  }
});

// 📊 Dashboard stats
app.get("/api/dashboard/stats", async (req, res) => {
  try {
    const registeredUsers = await User.countDocuments();
    const totalReports = await Report.countDocuments();
    const activeAlerts = await Report.countDocuments({ status: "active" });
    const resolvedCases = await Report.countDocuments({ status: "resolved" });
    const ongoingEmergencies = await Report.countDocuments({
      type: /fire|accident|medical|flood|earthquake/i,
    });

    res.json({
      registeredUsers,
      totalReports,
      activeAlerts,
      resolvedCases,
      ongoingEmergencies,
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    res.status(500).json({ error: "Failed to load dashboard stats" });
  }
});

// ✅ Default route
app.get("/", (req, res) => {
  res.send("🚀 SEARS Backend is running successfully!");
});

// ✅ Start server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () =>
  console.log(`✅ SEARS backend running successfully on port ${PORT}`)
);
