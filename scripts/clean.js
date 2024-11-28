const fs = require("fs");
const path = require("path");

const dir = path.resolve(__dirname, "../public");

try {
  fs.rmSync(dir, { recursive: true, force: true });
  console.log(`Cleaned sites ${dir} ...`);
} catch (error) {
  console.error(`Error removing ${dir}:`, error.message);
}