const axios = require("axios");
const parseXML = require("../utils/xmlParser");
const dayjs = require("dayjs");

const fetchJobFeed = async (url) => {
  try {
    const response = await axios.get(url);
    const json = await parseXML(response.data);

    const items = json?.rss?.channel?.item || [];

    const total = items.length;
    const newCount = Math.floor(total * 0.7); // Example: 70% new
    const updatedCount = Math.floor(total * 0.2); // Example: 20% updated
    const failedCount = total - newCount - updatedCount;

    const result = {
      fileName: "job_feed.xml",
      importDate: dayjs().format("YYYY-MM-DD HH:mm"),
      total,
      new: newCount,
      updated: updatedCount,
      failed: failedCount,
    };

    return result;
  } catch (error) {
    console.error("Error fetching/parsing job feed:", error.message);
    throw new Error("Failed to fetch or parse job feed.");
  }
};

module.exports = { fetchJobFeed };
