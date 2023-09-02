const { execSync } = require("child_process");
const os = require("os");

if (os.platform() === "darwin" && os.arch() === "arm64") {
  execSync("npm install @next/swc-darwin-arm64", { stdio: "inherit" });
}
