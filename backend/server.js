const express = require("express");
const cors = require("cors");
const http = require("http");
const bodyParser = require("body-parser");
const connectDB = require("./config/db");
require("dotenv").config();


const app = express();
connectDB();


app.use(cors());
app.use(bodyParser.json());


// Import Routes
const pythonRoutes = require("./routes/pythonRoutes");
const scheduler = require("./routes/scheduler");



app.use("/api/python", pythonRoutes);
app.use("/api/schedule", scheduler); // Schedule route




const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
console.log(`🚀 Server running on port ${PORT}`);
});