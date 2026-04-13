import { execSync } from "child_process";

try {
  console.log("-> Updating dependencies …");
  execSync("ncu -u --install always", { stdio: "inherit" });

  console.log("\n-> Updating submodules …");
  execSync("git submodule update --remote --merge", { stdio: "inherit" });
  console.log("\n\x1b[32m%s\x1b[0m", "-> Update process completed successfully!");
} catch (error) {
  console.error("\n\x1b[31m%s\x1b[0m", "Error during update process:", error.message);
  process.exit(1);
}
