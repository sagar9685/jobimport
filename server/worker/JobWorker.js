const worker = new Worker(
  "job-import",
  async (job) => {
    console.log(`\n=== STARTING JOB ${job.id} ===`);
    console.log("Processing URL:", job.data.fileName);

    try {
      console.log("First job sample:", job.data.jobs[0]);

      let counts = { new: 0, updated: 0, failed: 0 };
      for (const jobData of job.data.jobs) {
        try {
          // Ensure jobData has required fields
          if (!jobData.title || !jobData.company) {
            throw new Error("Invalid job data - missing required fields");
          }

          const jobId =
            jobData.guid ||
            jobData.link ||
            `${jobData.title}-${jobData.company}`
              .replace(/\s+/g, "-")
              .toLowerCase();

          console.log(`Processing job: ${jobId}`);

          const existingJob = await Job.findOne({ jobId });
          if (existingJob) {
            await Job.updateOne({ _id: existingJob._id }, jobData);
            counts.updated++;
            console.log(`Updated job ${jobId}`);
          } else {
            await Job.create({ ...jobData, jobId });
            counts.new++;
            console.log(`Created new job ${jobId}`);
          }
        } catch (error) {
          counts.failed++;
          console.error(`Failed to process job:`, error.message);
        }
      }

      console.log("Final counts:", counts);

      const logEntry = {
        fileName: job.data.fileName,
        totalFetched: job.data.jobs.length,
        totalImported: counts.new + counts.updated,
        newJobs: counts.new,
        updatedJobs: counts.updated,
        failedJobs: counts.failed,
      };

      console.log("Saving import log:", logEntry);
      await ImportLog.create(logEntry);
    } catch (error) {
      console.error("FATAL WORKER ERROR:", error);
    }
  },
  { connection }
);
