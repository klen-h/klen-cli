const fs = require("fs-extra");
const path = require("path");
const simpleGit = require("simple-git");
const git = simpleGit();

const repoUrl = "https://gitee.com/Jackeylove123/template.git";
async function cloneSubDir(proName, subDir) {
  try {
    const temp = path.resolve(process.cwd(), ".TEMP");
    // 创建目标目录
    if (!fs.existsSync(temp)) {
      fs.mkdirSync(temp, { recursive: true });
    }
    const git = simpleGit(temp);
    await git.init();
    await git.addRemote("origin", repoUrl);
    await git.raw(["sparse-checkout", "init"]);
    await git.raw(["sparse-checkout", "set", subDir]);
    await git.raw(["sparse-checkout", "list"]);
    await git.pull("origin", "main");
    // 移动子目录到父目录的上一级目录
    const parentDir = path.resolve(temp, "..");
    fs.moveSync(path.join(temp, subDir), path.join(parentDir, subDir), {
      overwrite: true,
    });
    //重命名子目录
    const oldPath = path.resolve(process.cwd(), subDir);
    const newPath = path.resolve(process.cwd(), proName);
    fs.renameSync(oldPath, newPath);
    // 删除父目录
    fs.removeSync(temp);
    console.log("🎉  创建完成");
  } catch (error) {
    console.error("cloneSubDir:", error.message);
  }
}

/**
 * 拉所有 template
 */
async function getTemplateList() {
  try {
    // Clone 远程仓库到临时目录
    await git.clone(repoUrl, ".TEMP", ["--depth=1"]);
    // 获取 .TEMP 目录下的子目录列表
    const tempDir = fs
      .readdirSync(".TEMP", { withFileTypes: true })
      .filter((dirent) => dirent.isDirectory() && dirent.name !== ".git")
      .map((dirent) => dirent.name);
    // 删除临时目录
    fs.removeSync(".TEMP", { recursive: true });
    return tempDir;
  } catch (err) {
    console.error("getTemplateList:", err);
  }
}

module.exports = { cloneSubDir, getTemplateList };
