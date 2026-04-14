// storage/store.js
const fs = require('fs-extra');
const path = require('path');

const filePath = path.join(__dirname, 'notifications.json');

// Initialize the notifications array
let notifications = [];

// Load existing notifications from the file
const loadNotifications = async () => {
  try {
    if (await fs.pathExists(filePath)) {
      const data = await fs.readJson(filePath);
      notifications = Array.isArray(data) ? data : [];
    }
  } catch (err) {
    console.error('Error loading notifications:', err);
  }
};

// Save notifications to the file
const saveNotifications = async () => {
  try {
    await fs.writeJson(filePath, notifications, { spaces: 2 });
  } catch (err) {
    console.error('Error saving notifications:', err);
  }
};

// Store a new notification
const storeNotification = async (type, message, time) => {
  notifications.push({ type, message, time });
  await saveNotifications();
};

// Add a notification (used by scheduler)
const addNotification = async (notification) => {
  notifications.push(notification);
  await saveNotifications();
};

// Load notifications when the module is required
loadNotifications();

// Get all notifications (used in /notifications route)
const getAllNotifications = () => {
  return notifications; // Ensure this returns the latest list of notifications
};

module.exports = {
  notifications,
  storeNotification,
  addNotification,
  getAllNotifications, // Export this method for the /notifications route
};


