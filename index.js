require("dotenv").config(); // Load environment variables
const express = require("express");
const cors = require("cors");

const connectDB = require("./config/dbconnect");

const Router = require("./routes/liabilitiesRoutes");

const app = express();
const PORT = process.env.PORT || 5000; // Use environment variable for the port

// Middleware
app.use(cors());
app.use(express.json());


// Connect to MongoDB
connectDB();


app.use("/", Router);


// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
  