const { execSync } = require("child_process");

require("./clean");

try {
  console.log(`-> Building sites …`);
  execSync("hugo --gc --quiet", { stdio: "inherit" });

  console.log(`-> Formatting sites …`);
  execSync("npx prettier --log-level silent --write 'public/**/*.{html,json}'", {
    stdio: "inherit"
  });
} catch (error) {
  console.error("Error during build:", error.message);
}
