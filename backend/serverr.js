const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log("NotifServer Connected to MongoDB"))
  .catch(err => console.error("MongoDB connection error:", err));

const notificationsRoute = require('./routes/notifications');
const startScheduler = require('./generator/scheduler');

const app = express();

startScheduler();

app.use(cors()); // This enables CORS for all origins
app.use(express.json());

app.use('/api/notifications', notificationsRoute);
app.listen(6001, '0.0.0.0', () => {
  console.log("Server running on port 6001");
});