const schedule = require('node-schedule');
const { addNotification } = require('../storage/store');
const { generateNotifications } = require('./generator');

async function startScheduler() {
  console.log("⏳ Scheduler started. Running initial check...");

  // Run immediately on startup for verification
  const initialNotifs = await generateNotifications();
  if (initialNotifs && initialNotifs.length > 0) {
    console.log('✅ Initial Notifications Generated:', initialNotifs);
  } else {
    console.log('ℹ️ No initial notifications generated (might be empty or fallback used).');
  }

  schedule.scheduleJob('*/10 * * * *', async () => {  // every 10 minutes
    console.log("⏰ Scheduled check running...");
    const newNotifs = await generateNotifications();

    if (!newNotifs || !newNotifs.length) {
      // If no notifications are generated, use a fallback message
      const fallback = {
        type: 'General Reminder',
        message: 'Don’t forget to take care of your health today!',
        time: new Date(),
      };
      await addNotification(fallback);  // Ensure the notification is stored correctly
      console.log('Fallback Notification:', fallback);
    } else {
      console.log('Generated Notifications:', newNotifs);
    }
  });
}

module.exports = startScheduler;