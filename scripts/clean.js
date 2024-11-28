const fs = require("fs");

try {
  console.log(`-> Cleaning sites …`);
  fs.rmSync(require("path").resolve(__dirname, "../public"), { recursive: true, force: true });
} catch (error) {
  console.error(`Error cleaning sites: ${error.message}`);
}
