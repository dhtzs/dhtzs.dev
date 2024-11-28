const { execSync } = require("child_process");

try {
  console.log("-> Updating dependencies …");
  execSync("ncu -u --install always", { stdio: "inherit" });

  console.log("-> Updating submodules …");
  execSync("git submodule update --remote --merge", { stdio: "inherit" });
} catch (error) {
  console.error("Error during update process:", error.message);
}
