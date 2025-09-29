import { execSync } from "child_process";
import fs from "fs";
import path from "path";

try {
  console.log("-> Starting server …");
  fs.rmSync(path.resolve(import.meta.dirname, "../public"), { recursive: true, force: true });
  execSync("hugo server", { stdio: "inherit" });
} catch (error) {
  console.error("Error during server startup:", error.message);
}
