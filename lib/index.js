#!/usr/bin/env node

const path = require('path')
const ejs = require('ejs')
const ora = require('ora')
const boxen = require('boxen')
const fs = require('fs-extra')
const inquirer = require('inquirer')
const commander = require('commander')

console.log(
  boxen('Bread Crumbs Cli', { padding: 1, margin: 1, borderStyle: 'classic' })
)

const TEMPLATES_PATH = 'templates'
const COMPONENT_PATH = 'components'
const BREAD_CRUMBS_PATH = 'src/breadcrumb'
const pkg = fs.readJSONSync('package.json')

const program = new commander.Command()

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
  .action((env, options) => {
    console.log('新增目录或页面文件')
  })
program.version(pkg.version)
program.parse(process.argv)

if (!process.argv.slice(2).length) {
  program.outputHelp()
}

// inquirer
//   .prompt([
//     {
//       type: 'list',
//       name: 'type',
//       message: '创建目录还是文件？',
//       choices: [
//         {
//           name: '目录',
//           value: 'folder',
//           checked: true
//         },
//         {
//           name: '文件',
//           value: 'file'
//         }
//       ]
//     },
//     {
//       type: 'input',
//       name: 'name',
//       message: '目录或文件名',
//       default: 'my-page'
//     },
//     {
//       type: 'list',
//       name: 'path',
//       message: '放在哪?',
//       choices: [
//         {
//           name: 'src/views',
//           value: 'src/views',
//           checked: true
//         },
//         {
//           name: 'src/pages',
//           value: 'src/pages'
//         }
//       ]
//     }
//   ])
//   .then(answers => {
//     const { type, name, path } = answers

//     switch (type) {
//       case 'folder':
//         generateFolder(name, path)
//         break
//       case 'file':
//         generateFile(name, path)
//         break
//     }
//   })

function generateCompFolder(path) {}

function generateFolder(name = '', path = '') {
  if (!name || !path) {
    return
  }

  const spinner = ora('创建目录中...').start()

  console.log('name :', name)
  console.log('path :', path)
}

async function generateFile(fileName = '', filePath = '') {
  if (!fileName || !filePath) {
    return
  }

  const spinner = ora('生成文件中...').start()

  const _filePath = path.join(filePath, fileName + '.vue')

  console.log('_filePath :', _filePath)

  fs.ensureFile(_filePath)
    .then(() => {
      console.log('success!')
      spinner.succeed('文件生成了 👌')
    })
    .catch(err => {
      throw err
      spinner.fail('文件生成失败了 😢')
    })
}
