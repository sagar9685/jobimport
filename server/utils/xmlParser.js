const xml2js = require("xml2js");

const parseXML = async (xml) => {
  const parser = new xml2js.Parser({ explicitArray: false });
  return await parser.parseStringPromise(xml);
};

module.exports = parseXML;
