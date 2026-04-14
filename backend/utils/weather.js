//weather.js
const axios = require('axios');

async function getTemperature() {
  try {
    const API_KEY = '79fade3acd4f94f72324fe76d6a78751'; // Replace with actual key
    const CITY = 'Hyderabad';
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${CITY}&appid=${API_KEY}&units=metric`;
    const res = await axios.get(url);
    return res.data.main.temp;
  } catch (err) {
    console.error('Weather API failed:', err.message);
    return 30; // Default fallback temperature
  }
}

module.exports = { getTemperature };