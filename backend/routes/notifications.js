
const express = require('express');
const router = express.Router();
const fs = require('fs-extra');
const path = require('path');

const notificationsPath = path.join(__dirname, '../storage/notifications.json');

router.get('/get', async (req, res) => {
  try {
    const data = await fs.readJson(notificationsPath);

    const today = new Date().toISOString().split('T')[0];

    const todaysNotifications = data.filter(n =>
      new Date(n.time).toISOString().startsWith(today)
    );

    res.json(todaysNotifications);
  } catch (err) {
    console.error('Error reading notifications:', err);
    res.status(500).json({ error: 'Failed to load notifications' });
  }
});

module.exports = router;
