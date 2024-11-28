const { execSync } = require("child_process");

require("./clean");

try {
  execSync("hugo server", { stdio: "inherit" });
} catch (error) {
  console.error("Error starting server:", error.message);
}
