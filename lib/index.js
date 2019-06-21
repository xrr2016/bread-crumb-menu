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

const { isNuxtProject, questions } = require('./questions')

const BREAD_CRUMBS_PATH = isNuxtProject
  ? 'components/breadcrumb'
  : 'src/components/breadcrumb'
const COMPONENT_PATH = '../components'
const BREAD_CRUMBS_JSON_PATH = `${BREAD_CRUMBS_PATH}/dp-bread-crumb.json`
const PAGE_TEMPLATE_PATH = path.resolve(__dirname, '../templates/page.vue')

const program = new commander.Command()

async function updateJson(answer = {}) {
  if (!answer) {
    return
  }

  try {
    const breads = await fs.readJSON(BREAD_CRUMBS_JSON_PATH)

    const itemPath = answer.folderName
      ? `/${answer.folderName}/${answer.fileName}`
      : `/${answer.fileName}`

    const isExistItem = breads.find(b => b.path === itemPath)

    if (isExistItem) {
      return Promise.resolve()
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
  } catch (error) {
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
    const content = await buildPageContent({ fileName: folderName })

    await fs.ensureFile(filePath)
    await promisify(fs.writeFile)(filePath, content)
  } catch (error) {
    console.log(chalk.red(`创建 ${filePath}/index.vue 失败了 😢`))

    throw error
  }
}

async function initBreadCrumbs() {
  const spinner = ora('初始化面包屑组件...').start()

  try {
    await fs.emptyDir(BREAD_CRUMBS_PATH)
    await fs.ensureDir(BREAD_CRUMBS_PATH)
    await fs.copy(path.join(__dirname, COMPONENT_PATH), BREAD_CRUMBS_PATH)
    spinner.succeed('初始化面包屑组件成功了 👌')
    console.log(chalk.green(`${BREAD_CRUMBS_PATH}`))
  } catch (error) {
    spinner.fail('初始化面包屑组件失败了 😢')
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
    inquirer.prompt(questions).then(async answers => {
      const spinner = ora('处理中...\n').start()
      const { folderName, fileName, chinese, place } = answers
      const filePath = path.join(place, folderName, fileName + '.vue')

      try {
        const content = await buildPageContent({ fileName })

        await fs.ensureFile(filePath)
        await promisify(fs.writeFile)(filePath, content)

        if (folderName && fileName !== 'index') {
          const indexPath = path.join(place, folderName, 'index.vue')

          await buildIndexPage(indexPath, folderName)

          const breads = fs.readJSONSync(BREAD_CRUMBS_JSON_PATH)

          const itemPath = folderName.split('/').pop()

          breads.push({
            name: folderName,
            path: itemPath
          })

          fs.writeJSONSync(BREAD_CRUMBS_JSON_PATH, breads, {
            spaces: 2
          })
        }

        const isJsonExist = fs.existsSync(BREAD_CRUMBS_JSON_PATH)

        if (isJsonExist) {
          await updateJson(answers)
        } else {
          await initBreadCrumbs()
          await updateJson(answers)
        }

        spinner.succeed(`新增页面成功了 👌 ${filePath}`)
      } catch (error) {
        spinner.fail('新增页面失败了 😢')
        throw error
      }
    })
  })

program.version('0.0.15').parse(process.argv)

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
