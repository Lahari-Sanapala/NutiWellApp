const express = require('express');
const cors = require('cors');
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