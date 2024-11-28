const { execSync } = require("child_process");
const fs = require("fs");

try {
  console.log("-> Starting server …");
  fs.rmSync(require("path").resolve(__dirname, "../public"), { recursive: true, force: true });
  execSync("hugo server", { stdio: "inherit" });
} catch (error) {
  console.error("Error during server startup:", error.message);
}
