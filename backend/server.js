const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");
const helmet = require("helmet");
const mongoose = require("mongoose");

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(helmet());

// Simple Test Route to Check if API is Running
app.get('/api', (req, res) => {
  res.send('API is running');
});

// Authentication Middleware (for Protected Routes)
function authenticateToken(req, res, next) {
  const token = req.header('Authorization')?.split(' ')[1];
  if (!token) return res.status(403).json({ message: 'Access Denied' });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid Token' });
    req.user = user;
    next();
  });
}

// Example Protected Route
app.get('/api/protected', authenticateToken, (req, res) => {
  res.json({ message: "This is a protected route", user: req.user });
});

// Import and Use Routes
const authRoutes = require("./routes/authRoute");
app.use("/api/auth", authRoutes);

const fileRoutes = require("./routes/fileRoutes");
app.use("/api/files", fileRoutes);

// Error Handling Middleware (for any unhandled errors)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong!" });
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, { 
  useNewUrlParser: true, 
  useUnifiedTopology: true, 
  serverSelectionTimeoutMS: 5000 // Set timeout to 5 seconds
})
  .then(() => {
    console.log("Connected to MongoDB");
    // Start the server after successfully connecting to MongoDB
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`Server started at http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.log("MongoDB connection error:", err);
    process.exit(1); // Exit the process if MongoDB connection fails
  });
