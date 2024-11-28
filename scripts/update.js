const { execSync } = require("child_process");

try {
  console.log("-> Updating dependencies …");
  execSync("ncu -u", { stdio: "inherit" });
  execSync("npm install", { stdio: "inherit" });

  console.log("-> Updating submodules …");
  execSync("git submodule update --remote --merge", { stdio: "inherit" });
} catch (error) {
  console.error("Error during update process:", error.message);
}
