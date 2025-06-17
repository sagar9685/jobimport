// models/ImportLog.js
const mongoose = require("mongoose");

const importLogSchema = new mongoose.Schema({
  fileName: String,
  timestamp: { type: Date, default: Date.now },
  totalFetched: Number,
  totalImported: Number,
  newJobs: Number,
  updatedJobs: Number,
  failedJobs: Number,
  failureReasons: [String],
});

module.exports = mongoose.model("ImportLog", importLogSchema);
