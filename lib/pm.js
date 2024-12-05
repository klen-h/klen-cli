
const path = require("path");
const { execSync } = require("child_process");
function execCommand(command, stdio = "inherit") {
  execSync(command, { stdio });
}

function isCommandAvailable(cmd) {
  try {
    execCommand(`${cmd} --version`,ignore)
    return true;
  } catch (error) {
    return false;
  }
}

function installAndRun(proName) {
  const cwd = process.cwd()
  const subDirPath = path.resolve(cwd, proName);
  process.chdir(subDirPath);
  let packageManager = "pnpm";
  if (isCommandAvailable("pnpm")) {
    packageManager = "pnpm";
  } else if (isCommandAvailable("yarn")) {
    packageManager = "yarn";
  }
  console.log(`📦  安装依赖...`);
  execCommand(`${packageManager} install`);
  execCommand(`${packageManager} run dev`);
  process.chdir(cwd);
}

module.exports = { installAndRun };