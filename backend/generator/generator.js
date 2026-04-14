const { getTemperature } = require('../utils/weather');
const { storeNotification } = require('../storage/store');
const fs = require('fs-extra');
const path = require('path');

// Health, Diet, Mental Health Tips
const healthTips = [
  "Lemon water is good for weight loss.",
  "Start your day with a glass of warm water.",
  "Avoid sugar after 6 PM.",
  "Eat slowly and mindfully.",
  "Drinking water before meals can help with digestion and prevent overeating.",
  "Regular handwashing is one of the best ways to prevent the spread of illness.",
  "Include a variety of colorful fruits and vegetables in your diet to ensure you're getting a range of nutrients.",
  "Taking short breaks during long tasks can improve focus and productivity.",
  "Avoid skipping breakfast; it kick-starts your metabolism and provides energy for the day.",
  "Incorporate whole grains like oats and brown rice into your meals for added fiber.",
  "Limit your intake of processed foods to reduce the risk of chronic diseases.",
  "Aim for at least 30 minutes of moderate physical activity most days of the week.",
  "Ensure you're getting enough calcium and vitamin D to support bone health.",
  "Practice good posture to prevent back and neck pain.",
];

const dietTips = [
  "Add more vegetables to your meals for better digestion.",
  "Try cutting down on carbs for better energy.",
  "Start your day with a high-protein breakfast to keep you full longer.",
  "Choose whole fruits over fruit juices to benefit from fiber.",
  "Limit sugary snacks and opt for nuts or yogurt as healthier alternatives.",
  "Plan your meals ahead to avoid last-minute unhealthy choices.",
  "Read nutrition labels to make informed food choices.",
  "Incorporate legumes like beans and lentils into your diet for plant-based protein.",
  "Reduce your intake of red and processed meats; choose lean proteins like chicken or fish.",
  "Use herbs and spices to flavor your food instead of salt.",
  "Eat smaller portions to help manage your weight.",
  "Stay hydrated by drinking water throughout the day.",
];

const mentalHealthTips = [
  "Take 5 minutes to meditate for your mental well-being.",
  "Remember to take breaks during work to avoid burnout.",
  "Take time each day to relax and unwind; it's essential for mental well-being.",
  "Engage in activities that bring you joy, whether it's a hobby or spending time with loved ones.",
  "Practice mindfulness or meditation to reduce stress and improve focus.",
  "Set realistic goals and break them into manageable steps.",
  "Talk to someone you trust when you're feeling overwhelmed; sharing can lighten the load.",
  "Spend time outdoors to boost your mood and vitamin D levels.",
  "Limit screen time before bed to improve sleep quality.",
  "Keep a gratitude journal to focus on the positive aspects of your life.",
  "Learn to say no to commitments that cause unnecessary stress.",
  "Seek professional help if you're struggling; it's a sign of strength, not weakness.",
];

const seasonalMessages = {
  spring: "Spring is here! Time to enjoy the blooming flowers and fresh air.",
  summer: "Stay hydrated and protect your skin from the sun this summer.",
  autumn: "Autumn is a great time to enjoy warm soups and cozy evenings.",
  winter: "Keep active indoors during the winter months to stay healthy.",
};

const mealTimes = {
  breakfast: { start: 6, end: 7 },     // 6 AM - 7 AM
  meal: { start: 11.5, end: 12 },      // 11:30 AM - 12 PM
  dinner: { start: 18.5, end: 19 },    // 6:30 PM - 7 PM
};

// Helper function to check if the current time falls within the reminder window
function isInReminderWindow(startHour, endHour) {
  const now = new Date();
  const hour = now.getHours() + now.getMinutes() / 60;
  return hour >= startHour && hour <= endHour;
}

// Path to the used messages file
const usedMessagesPath = path.join(__dirname, '../storage/usedMessages.json');

// Load used messages from file
async function loadUsedMessages() {
  try {
    if (await fs.pathExists(usedMessagesPath)) {
      const data = await fs.readJson(usedMessagesPath);
      return data;
    }
    return {};
  } catch (err) {
    console.error('Error loading used messages:', err);
    return {};
  }
}

// Save used messages to file
async function saveUsedMessages(data) {
  try {
    await fs.writeJson(usedMessagesPath, data, { spaces: 2 });
  } catch (err) {
    console.error('Error saving used messages:', err);
  }
}

// Get today's date string
function getTodayDateString() {
  const now = new Date();
  return now.toISOString().split('T')[0]; // Format: YYYY-MM-DD
}

// Get a unique message from the list
function getUniqueMessage(tipsList, usedSet) {
  const availableTips = tipsList.filter(tip => !usedSet.has(tip));
  if (availableTips.length === 0) {
    return null; // All messages have been used
  }
  const randomIndex = Math.floor(Math.random() * availableTips.length);
  return availableTips[randomIndex];
}

async function generateNotifications() {
  const now = new Date();
  const hour = now.getHours();
  const notifs = [];

  // Load used messages
  const usedMessages = await loadUsedMessages();
  const today = getTodayDateString();
  if (!usedMessages[today]) {
    usedMessages[today] = {
      healthTips: [],
      dietTips: [],
      mentalHealthTips: []
    };
  }

  // Meal Reminders
  Object.entries(mealTimes).forEach(([meal, { start, end }]) => {
    if (isInReminderWindow(start, end)) {
      const msg = `Time for your ${meal}! Don't miss it.`;
      const notification = { type: `${meal} Reminder`, message: msg, time: now };
      notifs.push(notification);
      storeNotification(`${meal} Reminder`, msg, now);
      console.log('Generated Notification:', notification);
    }
  });

  // Weather-based Notification
  const temperature = await getTemperature();
  if (temperature > 35 && [11, 15].includes(hour)) {
    const msg = "It's hot outside. Stay hydrated and drink more water.";
    const notification = { type: "Weather", message: msg, time: now };
    notifs.push(notification);
    storeNotification("Weather", msg, now);
    console.log('Generated Notification:', notification);
  }

  // Health Tip (every 4 hours)
  if (hour % 4 === 0) {
    const usedSet = new Set(usedMessages[today].healthTips);
    const tip = getUniqueMessage(healthTips, usedSet);
    if (tip) {
      usedMessages[today].healthTips.push(tip);
      const notification = { type: "Health Tip", message: tip, time: now };
      notifs.push(notification);
      storeNotification("Health Tip", tip, now);
      console.log('Generated Notification:', notification);
    }
  }

  // Diet Tip (randomly)
  if (Math.random() > 0.7) {
    const usedSet = new Set(usedMessages[today].dietTips);
    const tip = getUniqueMessage(dietTips, usedSet);
    if (tip) {
      usedMessages[today].dietTips.push(tip);
      const notification = { type: "Diet Tip", message: tip, time: now };
      notifs.push(notification);
      storeNotification("Diet Tip", tip, now);
      console.log('Generated Notification:', notification);
    }
  }

  // Mental Health Tip (randomly)
  if (Math.random() > 0.7) {
    const usedSet = new Set(usedMessages[today].mentalHealthTips);
    const tip = getUniqueMessage(mentalHealthTips, usedSet);
    if (tip) {
      usedMessages[today].mentalHealthTips.push(tip);
      const notification = { type: "Mental Health Tip", message: tip, time: now };
      notifs.push(notification);
      storeNotification("Mental Health Tip", tip, now);
      console.log('Generated Notification:', notification);
    }
  }

  // Save updated used messages
  await saveUsedMessages(usedMessages);

  return notifs;
}

module.exports = { generateNotifications };