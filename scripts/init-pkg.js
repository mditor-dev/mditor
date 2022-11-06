const path = require('path');
const { prompt } = require('enquirer');
const childProcess = require('child_process');
const semver = require('semver');
const chalk = require('chalk');
const fs = require('fs');

const projectPath = path.resolve(__dirname, '../');
const pkgPath = path.resolve(projectPath, 'package.json');
const pkg = require(pkgPath);

function cmdGet(cmd) {
  try {
    return childProcess.execSync(cmd).toString().trim();
  } catch (e) {
    return '';
  }
}

async function getConfig() {
  const config = {
    name: path.basename(projectPath),
    description: pkg.description,
    author: cmdGet('git config user.name'),
    keywords: pkg.keywords.join(','),
    git: cmdGet('git remote get-url origin'),
    version: '0.0.0',
    license: pkg.license,
  };
  // 1.获取项目名称
  ({ name: config.name } = await prompt({
    type: 'input',
    name: 'name',
    initial: config.name,
    message: '输入项目名称：',
  }));
  // 2.获取版本号version
  ({ version: config.version } = await prompt({
    type: 'input',
    name: 'version',
    initial: config.version,
    message: '输入版本号(version)：',
    validate(value) {
      // 校验版本号
      if (!semver.valid(value)) {
        return `invalid version: ${value}`;
      }
      return true;
    },
  }));
  // 3.获取description
  ({ description: config.description } = await prompt({
    type: 'input',
    name: 'description',
    initial: config.description,
    message: '输入项目描述(description)：',
  }));
  // 4.获取keywords
  ({ keywords: config.keywords } = await prompt({
    type: 'input',
    name: 'keywords',
    initial: config.keywords,
    message: '输入关键词(keywords)：',
  }));
  // 5.获取author
  ({ author: config.author } = await prompt({
    type: 'input',
    name: 'author',
    initial: config.author,
    message: '输入作者(author)：',
  }));
  // 6.获取license
  ({ license: config.license } = await prompt({
    type: 'input',
    name: 'license',
    initial: config.license,
    message: '输入license：',
  }));

  console.log(chalk.green(JSON.stringify(config, null, 2)));

  const { confirm } = await prompt({
    type: 'confirm',
    name: 'confirm',
    message: '是否确认',
  });

  if (!confirm) return Promise.reject('cancel');

  return config;
}
async function setup() {
  try {
    console.log(chalk.cyan('初始化package.json开始...'));
    const config = await getConfig();
    //  console.log(config);
    // 3.根据description填写README.md
    // 5.获取远程git地址

    // 设置项目名称
    pkg.name = config.name;
    // 设置版本号version
    pkg.version = config.version;
    // 设置description
    pkg.description = config.description;
    // 设置keywords
    pkg.keywords = config.keywords.trim().split(',');
    // 设置author
    pkg.author = config.author;
    // 设置git
    if (config.git) {
      if (!pkg.repository) pkg.repository = { type: 'git' };
      pkg.repository.url = 'git+' + config.git;

      if (!pkg.bugs) pkg.bugs = {};
      pkg.bugs.url = config.git.replace('.git', '/issues');

      pkg.homepage = config.git.replace('.git', '#readme');
    }
    fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));

    console.log(chalk.cyan('初始化package.json完成...'));
  } catch (e) {
    console.log(e);
  }
}
setup();
