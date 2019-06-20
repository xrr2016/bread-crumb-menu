#!/usr/bin/env node
process.on('exit', () => {
  console.log()
})

if (!process.argv[2]) {
  console.error('[名字]必填 - Please enter new page or folder name')
  process.exit(1)
}

if (!process.argv[3]) {
  console.error(
    '[对应path] 中文名必填 - Please enter the china name of folder or page'
  )
  process.exit(1)
}

// 获取参数
const path = require('path')
const fs = require('fs')
const fileSave = require('file-save')
const mkdirp = require('mkdirp')

const mkdirSync = path =>
  new Promise((resolve, reject) => {
    mkdirp(path, function(err) {
      if (err) {
        reject(err)
      } else {
        resolve()
      }
    })
  })

/**
 * pagename 如果是文件夹，在对应 pages && views 下创建对应文件夹 并且 router-info.json 下生成对应的路由 路径 -> title
 * 创建文件夹只取最后一段 / 后面的 folder 路径
 */
const [, , pagename, routerName] = process.argv

const isVueFile = /.vue$/.test(pagename)

/**
 * 如果文件没有 .vue 后缀 退出进程
 */
// if (!/.vue$/.test(pagename)) {
//   console.error('目前只能生成文件，请带上 .vue 后缀');
//   process.exit(1);
// }

const { name } = path.parse(pagename)

const srcPath = path.resolve(__dirname, '../../src')
const realPath = pagename.replace(/^\/?/, '/').replace('.vue', '')

// 创建vue路由文件
const createVueFilePath = ({ srcPath, name, realPath, routerName }) => {
  const Files = [
    {
      filename: `pages${realPath}.vue`,
      content: `<script>
  /**
  * ${routerName}
  */
  export { default } from '@/views${realPath}/index.vue';
  </script>`
    },
    {
      filename: `views${realPath}/index.vue`,
      content: `<template>
    <div class="${name}">${routerName}</div>
  </template>

  <script>
  export default {
    name: '${name}',
  };
  </script>

  <style lang="less">
  </style>`
    }
  ]

  Files.forEach(file => {
    const pageFullPath = path.join(srcPath, file.filename)
    console.log(pageFullPath)
    fileSave(pageFullPath)
      .write(file.content, 'utf-8')
      .end('\n')
  })
}

// 创建路由
const createRoutePath = ({ realPath, srcPath }) => {
  const Files = [
    {
      filename: `pages${realPath}`,
      content: ''
    },
    {
      filename: `views${realPath}`,
      content: ''
    }
  ]
  Files.forEach(async file => {
    const pageFullPath = path.join(srcPath, file.filename)
    console.log(pageFullPath)
    await mkdirSync(pageFullPath)
  })
}

// 创建文件
if (isVueFile) {
  createVueFilePath({
    name,
    realPath,
    routerName,
    srcPath
  })
} else {
  // 创建文件夹，路由
  createRoutePath({
    srcPath,
    realPath
  })
}

/**
 * 改写 nav.config 路由对应 json
 */
const navPath = '../../src/const/route-info.json'

const routeInfoJSon = fs.existsSync(path.join(__dirname, navPath))
  ? require('../../src/const/route-info.json')
  : {}

routeInfoJSon[realPath] = routerName

fileSave(path.join(__dirname, navPath))
  .write(JSON.stringify(routeInfoJSon, null, '   '), 'utf8')
  .end('\n')
console.log('\nnav.config.json update success\n')

console.log('DONE!')
