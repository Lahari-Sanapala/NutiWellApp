const express = require('express');
const router = express.Router();
const fs = require('fs-extra');
const path = require('path');
const mongoose = require('mongoose');

// Assuming your UserDetails model is located here based on standard structure
const UserDetails = require('../models/UserDetails');

const notificationsPath = path.join(__dirname, '../storage/notifications.json');

router.get('/get', async (req, res) => {
  try {
    const userId = req.query.userId;
    const data = await fs.readJson(notificationsPath);

    // Filter to just today's generated notifications
    const todayStr = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
    let todaysNotifications = data.filter(n => {
      const nDate = new Date(n.time).toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
      return nDate === todayStr;
    });

    // Limit base generated notifications to 15 to prevent overload/spam
    todaysNotifications = todaysNotifications.slice(-15).reverse();

    // Contextual Smart Meal Check
    if (userId && mongoose.Types.ObjectId.isValid(userId)) {
      const user = await UserDetails.findOne({ userId: new mongoose.Types.ObjectId(userId) });

      if (user) {
        const currentDate = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
        const currentHour = new Date().getHours(); // Server time hour (or configure timezone logic)

        // Find which meal types have been logged today
        const loggedMeals = new Set();
        user.food.forEach(meal => {
          const mealDate = new Date(meal.createdAt).toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
          if (mealDate === currentDate) {
            loggedMeals.add(meal.mealType);
          }
        });

        const smartAlerts = [];

        // Breakfast logic: missing after 11:00 AM
        if (currentHour >= 11 && !loggedMeals.has("Breakfast")) {
          smartAlerts.push({
            type: "Urgent Alert",
            message: "You haven't logged any Breakfast yet! Keep your metabolism active.",
            time: new Date()
          });
        }

        // Lunch logic: missing after 3:00 PM (15:00)
        if (currentHour >= 15 && !loggedMeals.has("Lunch")) {
          smartAlerts.push({
            type: "Urgent Alert",
            message: "You missed logging Lunch today. Take a quick break and eat!",
            time: new Date()
          });
        }

        // Dinner logic: missing after 9:00 PM (21:00)
        if (currentHour >= 21 && !loggedMeals.has("Dinner")) {
          smartAlerts.push({
            type: "Urgent Alert",
            message: "You haven't logged your Dinner. Try not to eat too close to bedtime!",
            time: new Date()
          });
        }

        // Inject smart alerts to the very top of the notification stack
        todaysNotifications = [...smartAlerts, ...todaysNotifications];
      }
    }

    res.json(todaysNotifications);
  } catch (err) {
    console.error('Error reading notifications:', err);
    res.status(500).json({ error: 'Failed to load notifications' });
  }
});

module.exports = router;
