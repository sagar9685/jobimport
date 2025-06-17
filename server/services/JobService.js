const axios = require("axios");
const parseXML = require("../utils/xmlParser");

const fetchJobFeed = async (url) => {
  const response = await axios.get(url);
  const json = await parseXML(response.data);
  return json.rss?.channel?.item || [];
};

module.exports = { fetchJobFeed };
