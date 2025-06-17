const mongoose = require("mongoose");
const { Worker } = require("bullmq"); // ✅ Correct class
const Job = require("../models/Job");
const ImportLog = require("../models/ImportLog");

require("dotenv").config();

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Worker connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// ✅ Define the worker
const worker = new Worker(
  "jobQueue",
  async (job) => {
    try {
      const jobFeed = job.data.jobs;
      const fileName = job.data.url;

      let newCount = 0;
      let updateCount = 0;
      let failCount = 0;

      for (const item of jobFeed) {
        try {
          const result = await Job.findOneAndUpdate(
            { externalId: item.externalId },
            item,
            { upsert: true, new: true, rawResult: true }
          );

          if (result.lastErrorObject.updatedExisting) updateCount++;
          else newCount++;
        } catch (err) {
          failCount++;
        }
      }

      await ImportLog.create({
        fileName,
        total: jobFeed.length,
        new: newCount,
        updated: updateCount,
        failed: failCount,
      });

      console.log("✅ Import completed for", fileName);
    } catch (err) {
      console.error("❌ Worker error:", err);
      throw err;
    }
  },
  {
    connection: { host: "127.0.0.1", port: 6379 }, // Redis connection
  }
);
