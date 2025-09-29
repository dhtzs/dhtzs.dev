import { execSync } from "child_process";
import fs from "fs";
import path from "path";

try {
  console.log("-> Building sites …");
  fs.rmSync(path.resolve(import.meta.dirname, "../public"), { recursive: true, force: true });
  execSync("hugo --gc", { stdio: "inherit" });

  console.log("\n-> Formatting sites …");
  execSync("prettier --ignore-path '' --write 'public/**/*.{html,json}'", { stdio: "inherit" });

  console.log("\n-> Building worker …");
  execSync("wrangler pages functions build --outdir=./ --minify", { stdio: "inherit" });
} catch (error) {
  console.error("Error during build process:", error.message);
}
