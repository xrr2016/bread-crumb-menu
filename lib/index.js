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
  boxen('Bread Crumbs Menu', { padding: 1, margin: 1, borderStyle: 'classic' })
)

const TEMPLATES_PATH = '../templates'
const COMPONENT_PATH = '../components'
const PACKAGE = fs.readJSONSync('package.json')
const BREAD_CRUMBS_PATH = 'src/components/breadcrumb'
const BREAD_CRUMBS_JSON_PATH = `${BREAD_CRUMBS_PATH}/dp-bread-crumb.json`

const program = new commander.Command()

function updateJson(answer = {}) {
  if (!answer) {
    return
  }
  try {
    const breads = fs.readJSONSync(BREAD_CRUMBS_JSON_PATH)

    let itemPath = ''
    if (answer.folderName) {
      itemPath = `/${answer.folderName}/${answer.fileName}`
    } else {
      itemPath = `/${answer.fileName}`
    }

    const item = {
      name: answer.chinese,
      path: itemPath,
      isLink: true
    }

    breads.push(item)

    fs.writeJSONSync(BREAD_CRUMBS_JSON_PATH, breads, {
      spaces: 2
    })

    console.log('更新 JSON 文件成功了\n')
    console.log('breads :', JSON.stringify(breads, null, 2))
  } catch (error) {
    console.error('更新 JSON 文件失败了')
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
  const spinner = ora('初始化面包屑组件...\n').start()

  const filter = (fileName, dest) => {
    return fileName !== 'page'
  }

  try {
    await fs.emptyDir(BREAD_CRUMBS_PATH)
    await fs.ensureDir(BREAD_CRUMBS_PATH)

    await fs.copy(path.join(__dirname, COMPONENT_PATH), BREAD_CRUMBS_PATH, {
      filter
    })

    spinner.succeed('初始化成功了 👌')
  } catch (error) {
    spinner.fail('初始化失败了 😢')
    throw error
  }
}

program
  .command('init')
  .description('初始化面包屑组件')
  .action(initBreadCrumbs)

program
  .command('show')
  .description('显示面包屑目前的 JSON 配置')
  .action(() => {
    const isJonsExist = fs.existsSync(BREAD_CRUMBS_JSON_PATH)

    if (isJonsExist) {
      const json = fs.readJSONSync(BREAD_CRUMBS_JSON_PATH)
      console.log(JSON.stringify(json, null, 2))
    } else {
      console.log('请先初始化')
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
          message: '目录名(留空则不创建目录)',
          default: () => ''
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
          default: '业务模块名称'
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
          promisify(fs.writeFile)(filePath, content)
            .then(() => {
              spinner.succeed(`${fileName} 新增成功了 👌 ${filePath}`)
            })
            .then(() => {
              const isJsonExist = fs.existsSync(BREAD_CRUMBS_JSON_PATH)

              if (isJsonExist) {
                updateJson(answers)
              } else {
                initBreadCrumbs().then(() => {
                  updateJson(answers)
                })
              }
            })
        })
      })
      .catch(error => {
        spinner.fail('新增失败了 😢\n')
        throw error
      })
  })

program.version(PACKAGE.version).parse(process.argv)

if (!process.argv.slice(2).length) {
  program.outputHelp()
}
