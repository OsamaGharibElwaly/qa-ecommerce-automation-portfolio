const fs = require("fs/promises");
const path = require("path");

function getDataDir() {
  return process.env.DATA_DIR || path.join(__dirname, "..", "..", "data");
}

async function readJson(fileName, fallbackValue) {
  try {
    const fullPath = path.join(getDataDir(), fileName);
    const content = await fs.readFile(fullPath, "utf-8");
    return JSON.parse(content);
  } catch (error) {
    if (error.code === "ENOENT") {
      return fallbackValue;
    }
    throw error;
  }
}

async function writeJson(fileName, data) {
  const dataDir = getDataDir();
  const fullPath = path.join(dataDir, fileName);
  await fs.mkdir(dataDir, { recursive: true });
  await fs.writeFile(fullPath, JSON.stringify(data, null, 2), "utf-8");
}

module.exports = {
  readJson,
  writeJson
};
