// routes/importRoutes.js
const express = require("express");
const router = express.Router();
const { fetchJobFeed } = require("../services/JobService");
const jobQueue = require("../queues/JobQueue");
const ImportLog = require("../models/ImportLog");

const urls = [
  "https://jobicy.com/?feed=job_feed",
  "https://jobicy.com/?feed=job_feed&job_categories=copywriting",
  "https://www.higheredjobs.com/rss/articleFeed.cfm",
];

// Trigger job import
router.post("/trigger-import", async (req, res) => {
  console.log("In trigger");
  try {
    for (let url of urls) {
      console.log("url", url);
      const jobs = await fetchJobFeed(url);
      console.log("jjjjjjjjjjj", jobs);
      const fileName = url; // Using full URL as fileName
      await jobQueue.add("import-jobs", { fileName, jobs });
    }
    res.json({ message: "Jobs added to queue for processing" });
  } catch (error) {
    console.error("Error triggering import:", error);
    res.status(500).json({ error: "Failed to trigger import" });
  }
});

// Get import history
router.get("/import-history", async (req, res) => {
  console.log("Import History");
  try {
    const logs = await ImportLog.find().sort({ timestamp: -1 });
    console.log(logs);
    res.json(
      logs.map((log) => ({
        fileName: log.fileName,
        timestamp: log.timestamp,
        total: log.totalFetched,
        new: log.newJobs,
        updated: log.updatedJobs,
        failed: log.failedJobs,
      }))
    );
  } catch (error) {
    console.error("Failed to fetch import history:", error);
    res.status(500).json({ error: "Failed to fetch import history" });
  }
});

module.exports = router;
