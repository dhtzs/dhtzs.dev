const { execSync } = require("child_process");

try {
  console.log("Updating dependencies...");
  execSync(
    "npm install @eslint/css @eslint/js @eslint/json @eslint/markdown @tailwindcss/postcss eslint postcss postcss-cli prettier prettier-plugin-tailwindcss tailwindcss --save-dev",
    { stdio: "inherit" }
  );

  console.log("Updating submodules...");
  execSync("git submodule update --remote --merge", { stdio: "inherit" });

  console.log("Update process completed successfully.");
} catch (error) {
  console.error("Error during update:", error.message);
  process.exit(1);
}
