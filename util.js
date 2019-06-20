const fs = require('fs')
const fsPromise = fs.promises
const path = require('path')

const createFile = (filename = '', data) => {
  if (!filename || !data) {
    return false
  }
  const file = path.resolve(__dirname, filename)

  fs.open(file, 'wx', (err, fd) => {
    if (err) {
      if (err.code === 'EEXIST') {
        console.error('myfile 已存在')
        return
      }

      throw err
    }
  })
}

const createFolder = (path = '') => {
  if (!path) {
    return false
  }

  return fsPromise
    .mkdir(path, { recursive: true })
    .then(() => {
      console.log(`文件夹 ${path} 已被创建`)
    })
    .catch(err => {
      throw err
    })
}

const checkFileExists = path => fs.existsSync(path)

module.exports = {
  createFile,
  createFolder,
  checkFileExists
}
