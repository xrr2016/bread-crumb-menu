const fs = require('fs')

const isNuxtProject = fs.existsSync('nuxt.config.js')

const folderChoices = isNuxtProject
  ? [
      {
        name: 'pages',
        value: 'pages',
        checked: true
      },
      {
        name: 'views',
        value: 'views'
      }
    ]
  : [
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

const questions = [
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
    choices: folderChoices
  }
]

module.exports = {
  isNuxtProject,
  questions
}
