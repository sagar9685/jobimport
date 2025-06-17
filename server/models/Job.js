const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema({
  jobId: { type: String, unique: true },
  title: String,
  company: String,
  location: String,
  description: String,
  url: String,
  postedAt: Date,
});

module.exports = mongoose.model("Job", jobSchema);
