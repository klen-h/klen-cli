#!/usr/bin/env node
const fs = require("fs-extra");
const path = require("path");
const { execSync } = require("child_process");
const { program } = require("commander");
const inquirer = require("inquirer");
const simpleGit = require("simple-git");
const git = simpleGit();
const pkg = require("../package.json");

const repoUrl = "https://gitee.com/Jackeylove123/template.git";

program.version(pkg.version).description("简单的前端脚手架");

program
  .arguments("[projectName] [templateName]")
  .description("以克隆模板创建新项目")
  .action(async (projectName, templateName) => {
    try {
      const options = [];
      let templateList = [];

      if (!templateName) {
        console.log(`💡  获取模板列表...`);
        templateList = await getTemplateList();
      }
      if (!projectName) {
        options.push({
          type: "input",
          name: "projectName",
          message: "项目名称(*)",
          validate: (name) => !!name,
        });
      }

      if (!templateName) {
        options.push({
          type: "list",
          name: "templateName",
          message: "模版类型(*)",
          choices: templateList,
        });
      }

      const answers = await inquirer.prompt(
        options.concat([
          {
            type: "confirm",
            name: "runAfterCreate",
            message: "创建完成后运行?",
          },
        ])
      );

      const proName = projectName || answers.projectName;
      const tempName = templateName || answers.templateName;
      await cloneSubDir(proName, tempName);
      answers.runAfterCreate && installAndRun(proName);
      console.log("🎉  创建完成");
    } catch (error) {
      console.error("创建失败:", error.message);
    }
  });

program.parse(process.argv);

function execCommand(command,stdio = "inherit") {
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
  let packageManager = "npm";
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
