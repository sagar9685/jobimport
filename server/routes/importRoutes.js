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

router.post("/trigger-import", async (req, res) => {
  console.log("🚀 Triggering job import...");

  try {
    const results = await Promise.all(
      urls.map(async (url) => {
        try {
          const jobData = await fetchJobFeed(url);

          console.log("✅ Jobs fetched for", url, jobData);

          const fileName = jobData.fileName || encodeURIComponent(url); // fallback
          await jobQueue.add("import-jobs", { fileName, jobData });

          return {
            fileName,
            importDate: jobData.importDate,
            total: jobData.total,
            new: jobData.new,
            updated: jobData.updated,
            failed: jobData.failed,
          };
        } catch (err) {
          console.error(`❌ Failed to process ${url}:`, err.message);
          return {
            fileName: encodeURIComponent(url),
            error: err.message,
          };
        }
      })
    );

    console.log("📦 All imports completed.");
    res.json(results);
  } catch (error) {
    console.error("❌ Error triggering import:", error.message);
    res.status(500).json({ error: "Failed to trigger import." });
  }
});

router.get("/import-history", async (req, res) => {
  console.log("📜 Fetching import history...");

  try {
    const logs = await ImportLog.find().sort({ timestamp: -1 });

    const formatted = logs.map((log) => ({
      fileName: log.fileName,
      timestamp: log.timestamp,
      total: log.totalFetched,
      new: log.newJobs,
      updated: log.updatedJobs,
      failed: log.failedJobs,
    }));

    res.json(formatted);
  } catch (error) {
    console.error("❌ Failed to fetch import history:", error.message);
    res.status(500).json({ error: "Failed to fetch import history." });
  }
});

module.exports = router;
