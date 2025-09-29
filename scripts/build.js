const { execSync } = require("child_process");
const fs = require("fs");

try {
  console.log("-> Building sites …");
  fs.rmSync(require("path").resolve(__dirname, "../public"), { recursive: true, force: true });
  execSync("hugo --gc", { stdio: "inherit" });

  console.log("\n-> Formatting sites …");
  execSync("prettier --ignore-path '' --write 'public/**/*.{html,json}'", { stdio: "inherit" });

  console.log("\n-> Building worker …");
  execSync("wrangler pages functions build --outdir=./ --minify", { stdio: "inherit" });
} catch (error) {
  console.error("Error during build process:", error.message);
}
