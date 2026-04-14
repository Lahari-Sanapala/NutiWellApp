const express = require("express");
const router = express.Router();
const Water = require("../models/waterModel");

// Get water
router.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const today = new Date().toISOString().split("T")[0];

    let record = await Water.findOne({ userId, date: today });

    if (!record) {
      record = await Water.create({ userId, date: today, water: 0 });
    }

    res.json({ water: record.water });
  } catch (error) {
    console.error("GET WATER ERROR:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Add water
router.post("/add", async (req, res) => {
  try {
    const { userId, amount } = req.body;

    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }

    const today = new Date().toISOString().split("T")[0];

    let record = await Water.findOne({ userId, date: today });

    if (!record) {
      record = await Water.create({ userId, date: today, water: amount || 1 });
    } else {
      record.water += amount || 1;
      await record.save();
    }

    res.json({ water: record.water });
  } catch (error) {
    console.error("ADD WATER ERROR:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Remove water
router.post("/remove", async (req, res) => {
  try {
    const { userId, amount } = req.body;

    const today = new Date().toISOString().split("T")[0];

    let record = await Water.findOne({ userId, date: today });

    if (record && record.water > 0) {
      record.water -= amount || 1;
      if (record.water < 0) record.water = 0;
      await record.save();
    }

    res.json({ water: record ? record.water : 0 });
  } catch (error) {
    console.error("REMOVE WATER ERROR:", error);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;