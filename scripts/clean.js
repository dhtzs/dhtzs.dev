const fs = require("fs");
const dir = require("path").resolve(__dirname, "../public");

try {
  console.log(`-> Cleaning sites …`);
  fs.rmSync(dir, { recursive: true, force: true });
} catch (error) {
  console.error(`Error removing ${dir}:`, error.message);
}