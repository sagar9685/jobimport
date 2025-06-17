const express = require("express");
const router = express.Router();
const { fetchJobFeed } = require("../services/JobService");
const jobQueue = require("../queues/JobQueue");

const urls = [
  "https://jobicy.com/?feed=job_feed",
  "https://jobicy.com/?feed=job_feed&job_categories=copywriting",
  "https://www.higheredjobs.com/rss/articleFeed.cfm",
];

const ImportHistory = require("../models/ImportLog");

router.get("/import-history", async (req, res) => {
  console.log("In Import History Controller");
  const ImportHistory = require("../models/ImportLog");
  try {
    const history = await ImportHistory.find().sort({ createdAt: -1 });
    res.json(history);
  } catch (err) {
    console.error("Failed to fetch import history:", err);
    res.status(500).json({ error: "Failed to fetch import history" });
  }
});

module.exports = router;
