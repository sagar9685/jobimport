const { Queue } = require("bullmq");
const Redis = require("ioredis");

const connection = new Redis(process.env.REDIS_URL);

const jobQueue = new Queue("job-import", { connection });

module.exports = jobQueue;
