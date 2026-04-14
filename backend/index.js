//index.js

// backend/index.js
const startScheduler = require('./generator/scheduler');


console.log('🔔 NutriWell Notification Generator Running...');
startScheduler(); // Start the scheduler to generate notifications
// No need to call server() here; it's already started in server.js