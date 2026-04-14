
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const authRouter = require("./routes/authRoutes");
const detailsRouter = require("./routes/userDetails");
const waterRouter = require("./routes/waterRoutes");

const app = express();

// ✅ CORS must be first — before any body parsing or routes
app.use(cors());

// ✅ Single body parser — no duplication
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ limit: '20mb', extended: true }));

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log("Connected to MongoDB"))
  .catch(err => console.error("MongoDB connection error:", err));

app.use("/api/auth", authRouter);
app.use("/api/details", detailsRouter);
app.use("/api/water", waterRouter);

app.listen(3000, '0.0.0.0', () => {
  console.log("Server running on port 3000");
});