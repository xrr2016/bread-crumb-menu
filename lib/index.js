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
const PAGE_TEMPLATE_PATH = path.resolve(__dirname, '../templates/page.vue')
// 项目目录
const BREAD_CRUMBS_PATH = 'src/components/breadcrumb'
const BREAD_CRUMBS_JSON_PATH = `${BREAD_CRUMBS_PATH}/dp-bread-crumb.json`

const program = new commander.Command()

async function updateJson(answer = {}) {
  if (!answer) {
    return
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
    const isFileExist = fs.existsSync(`${answer.place}${itemPath}.vue`)

    if (isPathExist && isFileExist) {
      console.log(chalk.red('页面已经存在了 \n'))
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

    console.log(chalk.green(JSON.stringify(breads, null, 2)), '\n')

    return Promise.resolve(true)
  } catch (error) {
    return Promise.resolve(false)
    console.error(chalk.red('更新 JSON 文件失败了'))
    throw error
  }
}

async function buildPageContent(data = {}) {
  if (!data) {
    return
  }

  const template = await promisify(fs.readFile)(PAGE_TEMPLATE_PATH, 'utf8')

  return await ejs.render(template, data)
}

async function buildIndexPage(filePath = '', folderName = '') {
  if (!filePath) {
    return
  }

  try {
    const content = await buildPageContent({ fileName: `${folderName}-index` })

    await fs.ensureFile(filePath)
    await promisify(fs.writeFile)(filePath, content)
  } catch (error) {
    console.log(chalk.red(`创建 ${filePath}/index.vue 失败了 😢`))
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

function showBreadJson() {
  const isJonsExist = fs.existsSync(BREAD_CRUMBS_JSON_PATH)

  if (isJonsExist) {
    const json = fs.readJSONSync(BREAD_CRUMBS_JSON_PATH)
    console.log(chalk.green(JSON.stringify(json, null, 2)))
  } else {
    console.log(chalk.red('请先初始化面包屑'))
  }
}

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
  .action((env, options) => {
    inquirer.prompt(newPageQuestions).then(async answers => {
      const spinner = ora('处理中...\n').start()
      const { folderName, fileName, chinese, place } = answers

      try {
        const filePath = path.join(place, folderName, fileName + '.vue')
        const isFileExist = fs.existsSync(filePath)

        if (isFileExist) {
          inquirer
            .prompt([
              {
                type: 'confirm',
                name: 'confirm',
                message: '页面已存在是否覆盖？',
                default: false
              }
            ])
            .then(async answers => {
              const { confirm } = answers

              if (!confirm) {
                spinner.stop()
                return
              }

              await writePageFile()
            })
        } else {
          await writePageFile()
        }

        async function writePageFile() {
          const content = await buildPageContent({ fileName })

          await fs.ensureFile(filePath)
          await promisify(fs.writeFile)(filePath, content)
        }

        const isJsonExist = fs.existsSync(BREAD_CRUMBS_JSON_PATH)

        if (!isJsonExist) {
          await initBreadCrumbs()
        }

        const result = await updateJson(answers)

        if (result) {
          spinner.succeed(`新增页面成功了 👌 ${filePath}`)
        } else {
          spinner.stop()
        }
      } catch (error) {
        spinner.fail('新增页面失败了 😢')
        throw error
      }
    })
  })

program.version('0.0.18').parse(process.argv)

if (!process.argv.slice(2).length) {
  console.log(
    boxen('Bread Crumbs Menu', {
      padding: 1,
      margin: 1,
      borderStyle: 'classic'
    })
  )
  program.outputHelp()
}
