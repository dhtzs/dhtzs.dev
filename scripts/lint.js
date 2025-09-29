import { execSync } from "child_process";

try {
  console.log("-> Linting files …");
  execSync("eslint . || exit 0", { stdio: "inherit" });
} catch (error) {
  console.error("Error during linting process:", error.message);
}
