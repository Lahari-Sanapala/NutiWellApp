
const express = require("express");
const router = express.Router();
//const UserDetails = require("../models/UserDetails");
const axios = require('axios')
const UserDetails = require("../models/UserDetails");
const mongoose = require("mongoose");

const moment = require("moment-timezone");
const { getAllNotifications } = require('../storage/store');
require("dotenv").config();

const activityMultipliers = {
  "Sedentary": 1.2,
  "Light Active": 1.375,
  "Moderate Active": 1.55,
  "Heavy Active": 1.725,
  "Very Heavy": 1.9
};

function getWaterGoal(TDEE) {
  const liters = TDEE * 0.001;
  return Math.round(liters / 0.25); // glasses
}

function calculateNutrition({ age, gender, height, weight, activityLevel }) {
  if (!age || !gender || !height || !weight || !activityLevel) {
    return null;
  }

  // BMR — Mifflin St Jeor
  let BMR;
  if (gender === "Male") {
    BMR = 10 * weight + 6.25 * height - 5 * age + 5;
  } else {
    BMR = 10 * weight + 6.25 * height - 5 * age - 161;
  }

  const multiplier = activityMultipliers[activityLevel] || 1.2;
  const TDEE = BMR * multiplier;

  // Macros
  const carbs = (0.50 * TDEE) / 4;
  const protein = (0.20 * TDEE) / 4;
  const fat = (0.30 * TDEE) / 9;

  return {
    TDEE: Math.round(TDEE),
    carbs: Math.round(carbs),
    protein: Math.round(protein),
    fat: Math.round(fat),
    waterGlasses: getWaterGoal(TDEE)
  };
}


const baseURL = process.env.BASE_URL;
const getIndianDate = () => {
  return new Date().toLocaleDateString('en-CA', {
    timeZone: 'Asia/Kolkata'
  });
};




router.post("/submit", async (req, res) => {
  try {
    const {
      userId,
      name,
      gender,
      age,
      height,
      weight,
      state,
      sleepHours,
      activityLevel,
      healthIssues
    } = req.body;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: "Invalid user ID format" });
    }

    // userId is already an ObjectId string → no need to wrap
    const existingDetails = await UserDetails.findOne({ userId });

    if (existingDetails) {
      // Update fields
      existingDetails.name = name;
      existingDetails.gender = gender;
      existingDetails.age = age;
      existingDetails.height = height;
      existingDetails.weight = weight;
      existingDetails.state = state;
      existingDetails.sleepHours = sleepHours;
      existingDetails.activityLevel = activityLevel;
      existingDetails.healthIssues = healthIssues;

      await existingDetails.save();

      return res.json({ message: "User details updated successfully" });
    }

    // Create new user details
    const newUserDetails = new UserDetails({
      _id: new mongoose.Types.ObjectId(),
      userId,
      name,
      gender,
      age,
      height,
      weight,
      state,
      sleepHours,
      activityLevel,
      healthIssues,
      food: []
    });

    await newUserDetails.save();

    res.status(201).json({
      message: "User details saved successfully",
      userDetails: newUserDetails
    });

  } catch (err) {
    console.error("Error in /submit:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});



router.post("/upload-image", async (req, res) => {
  try {
    const { userId, base64Image, mealType } = req.body;
    console.log("Received userId in backend:", userId);
    console.log("Is valid ObjectId?", mongoose.Types.ObjectId.isValid(userId));

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: `Invalid user ID format. Received: ${userId}` });
    }

    const userIdd = new mongoose.Types.ObjectId(userId);

    if (!userIdd || !base64Image) {
      return res.status(400).json({ error: "Missing userId or base64Image" });
    }
    // ✅ Step 1: Find the user from DB
    console.log("we got user id from frontend in upload image route", userIdd)
    const user = await UserDetails.findOne({ userId: userIdd });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }



    const pythonResponse = await axios.post("http://10.33.15.69:8501/analyze", {
      base64Image,
      userId,
      mealType,
      name: req.body.name,
      gender: req.body.gender,
      age: req.body.age,
      height: req.body.height,
      weight: req.body.weight,
      sleepHours: req.body.sleepHours,
      activityLevel: req.body.activityLevel,
      healthIssues: req.body.healthIssues
    });

    const summary = pythonResponse.data?.summary || "No summary returned";
    console.log("🍽 Summary:", summary);

    // Send summary to get calorie estimation
    const pythonResponseCalorie = await axios.post("http://10.33.15.69:8501/analyzeCalorie", {
      summary,
      userId 
    });

    console.log("🍽 Calorie response data:", pythonResponseCalorie.data);


    const calorieData = pythonResponseCalorie.data.food || {
      calories: 0,
      carbs: 0,
      protein: 0,
      fat: 0,
      score: 0,
      summary: summary
    };

    const newFoodEntry = {
      base64Image,
      mealType,
      CalorieResponse: `${calorieData.calories},${calorieData.carbs},${calorieData.protein},${calorieData.fat}`,
      summary: calorieData.summary,   
      score: calorieData.score 
    };


    user.food.push(newFoodEntry);
    await user.save();

    const newIndex = user.food.length - 1;

    res.status(200).json({
      message: "Image uploaded",
      food: {
        image: base64Image,
        summary: calorieData.summary,
        mealType,
        calories: calorieData.calories,
        carbs: calorieData.carbs,
        protein: calorieData.protein,
        fat: calorieData.fat,
        score: calorieData.score
      },
      foodIndex: user.food.length - 1
    });
  } catch (error) {
    console.error("❌ Upload Image Error:", error);
    res.status(500).json({ error: "Server error" });
  }
});




function extractMealName(summary) {
  if (!summary) return "Unnamed Meal";

  // Match the actual line where meal name appears
  const match = summary.match(/Meal Analysis:\s*([^.\n]+)/i);

  return match ? match[1].trim() : "Unnamed Meal";
}




router.get('/:userId/meals', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.userId)) {
      return res.status(400).json({ error: 'Invalid user ID format' });
    }

    const userIdd = new mongoose.Types.ObjectId(req.params.userId);
    const user = await UserDetails.findOne({ userId: userIdd });
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Get current system date (without time component)
    const currentDate = getIndianDate();

    // Filter meals created today
    const todaysMeals = user.food.filter(meal => {
      const mealDate = new Date(meal.createdAt).toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
      console.log("meal date", mealDate)
      return mealDate === currentDate;
    });

    const formattedMeals = todaysMeals.map(meal => {
      const calories = meal.CalorieResponse ?
        meal.CalorieResponse.split(',')[0].trim() :
        '0';

      return {
        id: meal._id,
        name: extractMealName(meal.summary),
        time: new Date(meal.createdAt).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit'
        }),
        calories: calories + ' cal',
        base64Image: meal.base64Image,
        summary: meal.summary,
        mealType: meal.mealType || "General",

        macros: (() => {
          if (!meal.CalorieResponse) return { carbs: 0, protein: 0, fat: 0 };

          const parts = meal.CalorieResponse.split(',').map(x => x?.trim());

          return {
            carbs: parts[1] || "0",
            protein: parts[2] || "0",
            fat: parts[3] || "0",
          };
        })()

      };
    });

    res.json(formattedMeals);
  } catch (error) {
    console.error('Error fetching meals:', error);
    res.status(500).json({ error: 'Server error' });
  }
});


// routes/userDetails.js
router.get('/:userId/daily-totals', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.userId)) {
      return res.status(400).json({ error: 'Invalid user ID format' });
    }

    const userIdd = new mongoose.Types.ObjectId(req.params.userId);
    const currentDate = getIndianDate();
    console.log("current system date", currentDate)

    const user = await UserDetails.findOne({ userId: userIdd });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const todaysMeals = user.food.filter(meal => {
      const mealDate = new Date(meal.createdAt).toLocaleDateString('en-CA', {
        timeZone: 'Asia/Kolkata'
      });
      return mealDate === currentDate;
    });

    // Calculate Streaks natively using backend Dates
    const activeDates = new Set();
    user.food.forEach(meal => {
        if (meal.createdAt) {
           const mealDate = new Date(meal.createdAt).toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
           activeDates.add(mealDate);
        }
    });
    
    // Sort descending
    const sortedDates = Array.from(activeDates).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
    
    let currentStreak = 0;
    
    if (sortedDates.length > 0) {
        let yesterdayDate = new Date(new Date().toLocaleDateString('en-US', { timeZone: 'Asia/Kolkata' }));
        yesterdayDate.setDate(yesterdayDate.getDate() - 1);
        let yesterdayStr = yesterdayDate.toLocaleDateString('en-CA'); // Defaults format correctly if mapped Date object is modified

        if (sortedDates[0] === currentDate) {
            currentStreak = 0;
            // Iterate backwards from today
            let iterDate = new Date(new Date().toLocaleDateString('en-US', { timeZone: 'Asia/Kolkata' }));
            while (activeDates.has(iterDate.toLocaleDateString('en-CA'))) {
                currentStreak++;
                iterDate.setDate(iterDate.getDate() - 1);
            }
        } else if (sortedDates[0] === yesterdayStr) {
            currentStreak = 0;
            // Iterate backwards from yesterday
            let iterDate = new Date(yesterdayDate);
            while (activeDates.has(iterDate.toLocaleDateString('en-CA'))) {
                currentStreak++;
                iterDate.setDate(iterDate.getDate() - 1);
            }
        } else {
            // Gap between today/yesterday and last logged day -> Streak broken
            currentStreak = 0;
        }
    }

    // Calculate totals
    const totals = todaysMeals.reduce((acc, meal) => {
      if (meal.CalorieResponse) {
        const [calories, carbs, protein, fat] = meal.CalorieResponse.split(',').map(Number);

        if (!isNaN(calories) && !isNaN(carbs) && !isNaN(protein) && !isNaN(fat)) {
          acc.calories += calories;
          acc.carbs += carbs;
          acc.protein += protein;
          acc.fat += fat;
        }
      }
      return acc;
    }, { calories: 0, carbs: 0, protein: 0, fat: 0 });

    res.json({
      totals,
      mealCount: todaysMeals.length,
      currentStreak
    });
  } catch (error) {
    console.error('Error fetching daily totals:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/:userId/weekly-totals', async (req, res) => {
  try {
    // Validate user ID
    if (!mongoose.Types.ObjectId.isValid(req.params.userId)) {
      return res.status(400).json({ error: 'Invalid user ID format' });
    }

    const userIdd = new mongoose.Types.ObjectId(req.params.userId);

    // Get pure date strings for the 7-day range (YYYY-MM-DD format)
    const today = getIndianDate();
    const dateStrings = [];

    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      dateStrings.push(date.toISOString().split('T')[0]);
    }

    const user = await UserDetails.findOne({ userId: userIdd });
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Initialize totals
    const weeklyTotals = { calories: 0, carbs: 0, protein: 0, fat: 0 };
    const dailyBreakdown = {};

    // Initialize empty days
    dateStrings.forEach(date => {
      dailyBreakdown[date] = {
        calories: 0,
        carbs: 0,
        protein: 0,
        fat: 0,
        mealCount: 0
      };
    });

    // Process each meal
    user.food.forEach(meal => {
      const mealDate = new Date(meal.createdAt).toISOString().split('T')[0];

      // Only process if meal is within our 7-day window
      if (dateStrings.includes(mealDate)) {
        if (meal.CalorieResponse) {
          const [calories, carbs, protein, fat] = meal.CalorieResponse.split(',').map(Number);

          if (
            !isNaN(calories) &&
            !isNaN(carbs) &&
            !isNaN(protein) &&
            !isNaN(fat)
          ) {
            dailyBreakdown[mealDate].calories += calories;
            dailyBreakdown[mealDate].carbs += carbs;
            dailyBreakdown[mealDate].protein += protein;
            dailyBreakdown[mealDate].fat += fat;
            dailyBreakdown[mealDate].mealCount += 1;

            weeklyTotals.calories += calories;
            weeklyTotals.carbs += carbs;
            weeklyTotals.protein += protein;
            weeklyTotals.fat += fat;
          }

        }
      }
    });

    // Convert daily breakdown to sorted array (newest first)
    const sortedDailyBreakdown = dateStrings
      .map(date => ({
        date,
        ...dailyBreakdown[date]
      }))
      .reverse(); // Most recent day first

    res.json({
      weeklyTotals,
      dailyBreakdown: sortedDailyBreakdown,
      mealCount: Object.values(dailyBreakdown).reduce((sum, day) => sum + day.mealCount, 0)
    });

  } catch (error) {
    console.error('Error fetching weekly totals:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// router.get('/:userId/edit-details', async (req, res) => {
//   try {
//     if (!mongoose.Types.ObjectId.isValid(req.params.userId)) {
//       return res.status(400).json({ error: 'Invalid user ID format' });
//     }

//     const userId = new mongoose.Types.ObjectId(req.params.userId);
//     const userDetails = await User.findOne({ userId: userId });
//     if (!userDetails) return res.status(404).json({ error: "User details not found" });

//     res.json(userDetails);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Server error" });
//   }
// });
router.get("/:userId/edit-details", async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }

    const userDetails = await UserDetails.findOne({ userId });

    if (!userDetails) {
      return res.status(404).json({ error: "User details not found" });
    }

    const nutrition = calculateNutrition({
      age: userDetails.age,
      gender: userDetails.gender,
      height: userDetails.height,
      weight: userDetails.weight,
      activityLevel: userDetails.activityLevel
    });

    console.log("----- NUTRITION DEBUG -----");
    console.log("Activity Level:", userDetails.activityLevel);
    console.log("Age:", userDetails.age);
    console.log("Weight:", userDetails.weight);
    console.log("Height:", userDetails.height);
    console.log("Calculated TDEE:", nutrition?.TDEE);
    console.log("Water Glasses:", nutrition?.waterGlasses);
    console.log("----------------------------");

    console.log("Sending response:", {
      activityLevel: userDetails.activityLevel,
      waterGlasses: nutrition?.waterGlasses
    });

    res.json({
      name: userDetails.name,
      gender: userDetails.gender,
      age: userDetails.age,
      height: userDetails.height,
      weight: userDetails.weight,
      state: userDetails.state,
      sleepHours: userDetails.sleepHours,
      activityLevel: userDetails.activityLevel,
      healthIssues: userDetails.healthIssues,
      food: userDetails.food,
      nutrition
    });

  } catch (err) {
    console.error("Error in /edit-details:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
});


router.get('/:userId/getTodaysMealsAndNutrition', async (req, res) => {
  //const { userId } = req.params.userId;
  const currentDate = moment().tz("Asia/Kolkata").format("YYYY-MM-DD");

  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.userId)) {
      return res.status(400).json({ error: 'Invalid user ID format' });
    }

    const userIdd = new mongoose.Types.ObjectId(req.params.userId);
    console.log("user id in backend route getTodayMealsandnutritiron", userIdd);
    const user = await UserDetails.findOne({ userId: userIdd });
    //const user = await User.findOne({ userId : userIdd });
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Filter today's meals
    const todaysMeals = user.food.filter(meal => {
      const mealDate = moment(meal.createdAt).tz("Asia/Kolkata").format("YYYY-MM-DD");
      return mealDate === currentDate;
    });

    const { totalNutrition, summaries } = todaysMeals.reduce(
      (acc, meal) => {
        if (meal.CalorieResponse) {
          const [calories, carbs, protein, fat] = meal.CalorieResponse.split(',').map(Number);

          acc.totalNutrition.calories += isNaN(calories) ? 0 : calories;
          acc.totalNutrition.carbs += isNaN(carbs) ? 0 : carbs;
          acc.totalNutrition.protein += isNaN(protein) ? 0 : protein;
          acc.totalNutrition.fat += isNaN(fat) ? 0 : fat;
        }

        if (meal.summary) {
          const MealName = extractMealName(meal.summary);
          acc.summaries.push(MealName);
        }

        return acc;
      },
      {
        totalNutrition: { calories: 0, carbs: 0, protein: 0, fat: 0 },
        summaries: [],
      }
    );

    // Calculate daily limits to give the AI context of target goals
    const targetNutrition = calculateNutrition({
      age: user.age,
      gender: user.gender,
      height: user.height,
      weight: user.weight,
      activityLevel: user.activityLevel
    });

    res.status(200).json({
      userName: user.name,
      age: user.age,
      gender: user.gender,
      height: user.height,
      weight: user.weight,
      activityLevel: user.activityLevel,
      sleepHours: user.sleepHours,
      healthIssues: user.healthIssues,
      date: currentDate,
      targetNutrition, // Includes TDEE limits
      totalNutrition,  // Currently consumed today
      summaries,       // Arrays of strings detailing exact foods eaten
    });

  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});



// GET /notifications
router.get('/', (req, res) => {
  const notifications = getAllNotifications();
  res.json(notifications);
});

// POST /:userId/meal-analysis
router.post('/:userId/meal-analysis', async (req, res) => {
  try {
    const { mealType } = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(req.params.userId)) {
      return res.status(400).json({ error: 'Invalid user ID format' });
    }
    
    if (!mealType) {
      return res.status(400).json({ error: 'Meal type is required' });
    }

    const userIdd = new mongoose.Types.ObjectId(req.params.userId);
    const user = await UserDetails.findOne({ userId: userIdd });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const currentDate = getIndianDate();

    // Filter today's meals matching the specified meal type
    const matchingMeals = user.food.filter(meal => {
      const mealDate = new Date(meal.createdAt).toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
      return mealDate === currentDate && meal.mealType === mealType;
    });

    if (matchingMeals.length === 0) {
      return res.status(404).json({ error: `No meals logged today for ${mealType}` });
    }

    // Format the items to send to the Python AI backend
    let foodDescriptions = "";
    matchingMeals.forEach((meal, i) => {
      let mealName = extractMealName(meal.summary) || "Unknown food";
      let macros = "";
      if (meal.CalorieResponse) {
        const [calories, carbs, protein, fat] = meal.CalorieResponse.split(',').map(x => x?.trim());
        macros = `(${calories} calories, ${carbs}g carbs, ${protein}g protein, ${fat}g fat)`;
      }
      foodDescriptions += `${i+1}. ${mealName} ${macros}\n`;
    });

    // Request the AI backend
    const pythonResponse = await axios.post("http://10.33.15.69:5001/meal-analysis", {
      meal_type: mealType,
      food_items: foodDescriptions
    });

    return res.status(200).json({ 
      analysis: pythonResponse.data.analysis 
    });

  } catch (err) {
    console.error("Error in /meal-analysis:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
});


module.exports = router;

