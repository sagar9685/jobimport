const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const cron = require("node-cron");
const { fetchJobFeed } = require("./services/JobService");
const jobQueue = require("./queues/JobQueue");

const urls = [
  "https://jobicy.com/?feed=job_feed",
  "https://jobicy.com/?feed=job_feed&job_categories=copywriting",
  "https://www.higheredjobs.com/rss/articleFeed.cfm",
];

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Import controller
const importController = require("./routes/importRoutes");
app.use("/api/import", importController); // This becomes /api/import/*

cron.schedule("0 * * * *", async () => {
  console.log("Running cron job to queue imports...");
  for (let url of urls) {
    const jobs = await fetchJobFeed(url);
    await jobQueue.add("import-jobs", { fileName: url, jobs });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
