#!/usr/bin/env node

const path = require('path')
const ejs = require('ejs')
const ora = require('ora')
const boxen = require('boxen')
const fs = require('fs-extra')
const inquirer = require('inquirer')
const { promisify } = require('util')
const commander = require('commander')

console.log(
  boxen('Bread Crumbs Cli', { padding: 1, margin: 1, borderStyle: 'classic' })
)

const TEMPLATES_PATH = 'templates'
const COMPONENT_PATH = 'components'
const BREAD_CRUMBS_PATH = 'src/breadcrumb'
const pkg = fs.readJSONSync('package.json')

const program = new commander.Command()

// `${BREAD_CRUMBS_PATH}/dp-bread-crumb.json`

function updateJson(jsonPath = '') {
  if (!jsonPath) {
    return
  }

  fs.ensureFileSync(jsonPath)

  const breads = fs.readJSON(jsonPath)

  console.log('breads :', breads)
}
const pageTemplatePath = `${TEMPLATES_PATH}/page.vue`
const fileName = 'test'

async function buildPageContent(templatePath = '', data = {}) {
  if (!templatePath || !data) {
    return
  }

  const template = await promisify(fs.readFile)(templatePath, 'utf8')

  return await ejs.render(template, data)
}

program
  .command('init')
  .description('初始化面包屑组件')
  .action(async (env, options) => {
    const spinner = ora('初始化面包屑组件...\n').start()

    const filter = (fileName, dest) => {
      return fileName !== 'page'
    }

    try {
      await fs.emptyDir(BREAD_CRUMBS_PATH)
      await fs.ensureDir(BREAD_CRUMBS_PATH)
      await fs.copy(COMPONENT_PATH, BREAD_CRUMBS_PATH, { filter })

      spinner.succeed('初始化成功了 👌')
    } catch (error) {
      spinner.fail('初始化失败了 😢')
      throw error
    }
  })

program
  .command('new')
  .description('新增目录或页面文件')
  .action(async (env, options) => {
    let spinner = null

    await inquirer
      .prompt([
        {
          type: 'input',
          name: 'folderName',
          message: '目录名，留空则不创建目录',
          default: () => '',
          transformer: input => input.trim()
        },
        {
          type: 'input',
          name: 'fileName',
          message: '文件名',
          default: () => 'my-page',
          validate(input) {
            return /^[0-9a-zA-Z].+$/.test(input.trim())
          }
        },
        {
          type: 'input',
          name: 'chinese',
          message: '中文名',
          default: '业务模块',
          transformer: input => input.trim()
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
        spinner = ora('处理中...\n').start()

        const pageTemplatePath = `${TEMPLATES_PATH}/page.vue`
        const { folderName, fileName, chinese, place } = answers
        const filePath = path.join(place, folderName, fileName + '.vue')

        fs.ensureFileSync(filePath)

        buildPageContent(pageTemplatePath, {
          fileName
        }).then(content => {
          promisify(fs.writeFile)(filePath, content).then(() => {
            spinner.succeed(`${fileName} 新增成功了 👌 \n ${filePath}`)
          })
        })
      })
      .catch(error => {
        spinner.fail('新增失败了 😢\n')
        throw error
      })
  })

program.version(pkg.version).parse(process.argv)

if (!process.argv.slice(2).length) {
  program.outputHelp()
}
