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

const TEMPLATES_PATH = '../templates'
const COMPONENT_PATH = '../components'
const PACKAGE = fs.readJSONSync('package.json')
const BREAD_CRUMBS_PATH = 'src/components/breadcrumb'
const BREAD_CRUMBS_JSON_PATH = `${BREAD_CRUMBS_PATH}/dp-bread-crumb.json`

const program = new commander.Command()

async function updateJson(answer = {}) {
  if (!answer) {
    return
  }
  try {
    const breads = fs.readJSONSync(BREAD_CRUMBS_JSON_PATH)

    const itemPath = answer.folderName
      ? `/${answer.folderName}/${answer.fileName}`
      : `/${answer.fileName}`

    const item = {
      name: answer.chinese,
      path: itemPath
    }

    breads.push(item)

    await fs.writeJSON(BREAD_CRUMBS_JSON_PATH, breads, {
      spaces: 2
    })

    console.log(
      chalk.green('更新 JSON 文件成功了\n', JSON.stringify(breads, null, 2))
    )
  } catch (error) {
    console.error(chalk.red('更新 JSON 文件失败了'))
    throw error
  }
}

async function buildPageContent(templatePath = '', data = {}) {
  if (!templatePath || !data) {
    return
  }

  const template = await promisify(fs.readFile)(templatePath, 'utf8')

  return await ejs.render(template, data)
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
    process.exit()
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
  .action(async (env, options) => {
    let spinner = null

    await inquirer
      .prompt([
        {
          type: 'input',
          name: 'folderName',
          message: '目录名(留空则不创建目录)',
          default: () => ''
        },
        {
          type: 'input',
          name: 'fileName',
          message: '文件名',
          default: () => 'index',
          validate(input) {
            return /^[0-9a-zA-Z].+$/.test(input.trim())
          }
        },
        {
          type: 'input',
          name: 'chinese',
          message: '中文名',
          default: '我的业务'
        },
        {
          type: 'list',
          name: 'place',
          message: '放在哪',
          choices: [
            {
              name: 'src/views',
              value: 'src/views',
              checked: true
            },
            {
              name: 'src/pages',
              value: 'src/pages'
            }
          ]
        }
      ])
      .then(async answers => {
        spinner = ora('处理中...').start()

        const pageTemplatePath = path.resolve(
          __dirname,
          `${TEMPLATES_PATH}/page.vue`
        )
        const { folderName, fileName, chinese, place } = answers
        const filePath = path.join(place, folderName, fileName + '.vue')

        fs.ensureFileSync(filePath)

        buildPageContent(pageTemplatePath, {
          fileName
        }).then(content => {
          const isJsonExist = fs.existsSync(BREAD_CRUMBS_JSON_PATH)

          promisify(fs.writeFile)(filePath, content)
            .then(() => {
              spinner.succeed(`${fileName} 新增页面成功了 👌 ${filePath}`)

              if (isJsonExist) {
                updateJson(answers)
              } else {
                initBreadCrumbs().then(() => updateJson(answers))
              }
            })
            .catch(error => {
              spinner.fail('新增页面失败了 😢\n')
              throw error
            })
        })
      })
      .catch(error => {
        spinner.fail('新增页面失败了 😢\n')
        throw error
      })
  })

program.version(PACKAGE.version).parse(process.argv)

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
