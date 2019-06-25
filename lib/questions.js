const fs = require('fs')
const { isValidFileName, isValidChineseName } = require('./util')

const initQuestions = [
  {
    type: 'confirm',
    name: 'reset',
    default: false,
    message: '已经初始化了，确定重置？'
  }
]

const newPageQuestions = [
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
  },
  {
    type: 'input',
    name: 'folderName',
    message: '目录名(留空则不创建目录)',
    default: () => '',
    validate: input => {
      if (!input) {
        return true
      }
      if (isValidFileName(input)) {
        return true
      }
      return '非法的目录名'
    }
  },
  {
    type: 'input',
    name: 'fileName',
    message: '文件名',
    default: () => 'index',
    validate: input => {
      if (isValidChineseName(input)) {
        return true
      }
      return '非法的中文名'
    }
  },
  {
    type: 'input',
    name: 'chinese',
    message: '中文名',
    default: '我的业务',
    validate: input => {
      if (isValidFileName(input)) {
        return true
      }
      return '非法的文件名'
    }
  }
]

module.exports = {
  initQuestions,
  newPageQuestions
}
