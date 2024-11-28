const { execSync } = require("child_process");
const fs = require("fs");

try {
  console.log("-> Building sites …");
  fs.rmSync(require("path").resolve(__dirname, "../public"), { recursive: true, force: true });
  execSync("hugo --gc --quiet", { stdio: "inherit" });

  console.log("-> Formatting sites …");
  execSync("prettier --ignore-path '' --log-level silent --write 'public/**/*.{html,json}'", { stdio: "inherit" });
} catch (error) {
  console.error("Error during build process:", error.message);
}
