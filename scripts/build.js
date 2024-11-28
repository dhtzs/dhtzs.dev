const { execSync } = require("child_process");

require("./clean");

try {
  execSync("hugo", { stdio: "inherit" });
} catch (error) {
  console.error("Error during build:", error.message);
}
