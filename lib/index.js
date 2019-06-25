#!/usr/bin/env node

const path = require('path')
const { promisify } = require('util')

const ejs = require('ejs')
const ora = require('ora')
const boxen = require('boxen')
const chalk = require('chalk')
const fs = require('fs-extra')
const inquirer = require('inquirer')
const commander = require('commander')

const { initQuestions, newPageQuestions } = require('./questions')

// 本地目录
const COMPONENT_PATH = path.resolve(__dirname, '../components')
const PAGE_TEMPLATE_PATH = path.resolve(__dirname, '../templates/page.ejs')
// 目标目录
const BREAD_CRUMBS_PATH = 'src/components/breadcrumb'
const BREAD_CRUMBS_JSON_PATH = `${BREAD_CRUMBS_PATH}/dp-bread-crumb.json`

const program = new commander.Command()

program
  .command('init')
  .description('初始化面包屑组件')
  .action(initBreadCrumbs)

program
  .command('show')
  .description('显示面包屑的 JSON 文件')
  .action(showBreadJson)

program
  .command('new')
  .description('新增页面文件')
  .action(newVuePage)

program.version('0.1.1').parse(process.argv)

const commands = ['init', 'new', 'show']

const noValidCommand = commands.every(c => c !== process.argv.slice(2)[0])

if (noValidCommand) {
  showHelp()
}

if (!process.argv.slice(2).length) {
  showHelp()
}

function showHelp() {
  console.log(
    boxen('Bread Crumbs Menu', {
      padding: 1,
      margin: 1,
      borderStyle: 'classic'
    })
  )
  program.outputHelp()
  process.exit(1)
  return
}

async function updateJson(answer = {}) {
  if (!answer) {
    return false
  }

  try {
    const breads = await fs.readJSON(BREAD_CRUMBS_JSON_PATH)

    let itemPath = ''

    if (answer.folderName) {
      if (answer.fileName === 'index') {
        itemPath = `/${answer.folderName}`
      } else {
        itemPath = `/${answer.folderName}/${answer.fileName}`
      }
    } else {
      itemPath = `/${answer.fileName}`
    }

    const isPathExist = breads.find(b => b.path === itemPath)

    if (isPathExist) {
      console.log(chalk.red('json 已存在此路径了 \n'))
      console.log(chalk.green(JSON.stringify(breads, null, 2)), '\n')
      return Promise.resolve(false)
    }

    const item = {
      name: answer.chinese,
      path: itemPath
    }

    breads.push(item)

    await fs.writeJSON(BREAD_CRUMBS_JSON_PATH, breads, {
      spaces: 2
    })
  } catch (error) {
    console.error(chalk.red('更新 JSON 文件失败了'))
    throw error
  }
}

function showBreadJson() {
  const isJonsExist = fs.existsSync(BREAD_CRUMBS_JSON_PATH)

  if (isJonsExist) {
    const json = fs.readJSONSync(BREAD_CRUMBS_JSON_PATH)
    console.log(chalk.green(JSON.stringify(json, null, 2)))
  } else {
    console.log(chalk.red('请先初始化面包屑'))
  }
}

async function generatePage(filePath = '', fileName = '') {
  if (!filePath || !fileName) {
    return false
  }

  try {
    await fs.ensureFile(filePath)

    const template = await promisify(fs.readFile)(PAGE_TEMPLATE_PATH, 'utf8')
    const content = await ejs.render(template, { fileName })
    await promisify(fs.writeFile)(filePath, content)

    return true
  } catch (error) {
    console.log(chalk.red(`生成 ${filePath} 文件失败了 😢`))
    throw error
  }
}

async function copyCompFiles() {
  const spinner = ora('处理中...\n').start()

  try {
    await fs.emptyDir(BREAD_CRUMBS_PATH)
    await fs.ensureDir(BREAD_CRUMBS_PATH)
    await fs.copy(COMPONENT_PATH, BREAD_CRUMBS_PATH)
    spinner.stop()
    console.log(chalk.green(`初始化面包屑组件成功了 👌 ${BREAD_CRUMBS_PATH}`))
  } catch (error) {
    spinner.fail('初始化面包屑组件失败了 😢')
    throw error
  }
}

async function initBreadCrumbs() {
  const isInited = fs.existsSync(`${BREAD_CRUMBS_JSON_PATH}`)

  if (isInited) {
    inquirer.prompt(initQuestions).then(answers => {
      const { reset } = answers

      if (reset) {
        copyCompFiles()
      }
      return
    })
  } else {
    copyCompFiles()
  }
}

async function newVuePage(env, options) {
  inquirer.prompt(newPageQuestions).then(async answers => {
    const spinner = ora('处理中...\n').start()
    const { folderName, fileName, chinese, place } = answers

    try {
      const filePath = path.join(place, folderName, fileName + '.vue')
      const isFileExist = fs.existsSync(filePath)
      const _fileName = folderName
        ? `${folderName.replace(/\//g, '-')}-${fileName}`
        : fileName

      if (isFileExist) {
        spinner.fail('页面已存在 😢')
        return
      }

      const result = await generatePage(filePath, _fileName)

      if (result) {
        const isJsonExist = fs.existsSync(BREAD_CRUMBS_JSON_PATH)

        if (!isJsonExist) {
          await initBreadCrumbs()
        }

        await updateJson(answers)
        spinner.succeed(`新增页面成功了 👌 ${filePath}`)
      } else {
        spinner.fail('新增页面失败了 😢')
      }
    } catch (error) {
      spinner.fail('新增页面失败了 😢')
      throw error
    }
  })
}
