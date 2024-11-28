const { execSync } = require("child_process");

try {
  console.log("Updating dependencies...");
  execSync(
    "npm install @eslint/js @tailwindcss/postcss@next eslint eslint-plugin-html postcss postcss-cli tailwindcss@next --save-dev",
    { stdio: "inherit" }
  );

  console.log("Updating submodules...");
  execSync("git submodule update --remote --merge", { stdio: "inherit" });

  console.log("Update process completed successfully.");
} catch (error) {
  console.error("Error during update:", error.message);
  process.exit(1);
}
