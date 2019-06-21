<h1 align="center">Welcome to Bread Crumb Menu 👋</h1>
<p>
  <img src="https://img.shields.io/badge/version-0.0.12-blue.svg?cacheSeconds=2592000" />
</p>

## Usage

```bash
npx bcm init // 初始化面包屑组件
npx bcm new  // 新增页面文件
npx bcm show // 显示面包屑的配置
```

在需要渲染面包屑的地方引入组件

```html
<template>
  <dp-bread-crumb />
</template>

<script>
  import DpBreadCrumb from './components/breadcrumb/dp-bread-crumb.vue'

  export default {
    components: {
      DpBreadCrumb
    }
  }
</script>
```

## Contributing

1. Fork it (<https://github.com/xrr2016/bread-crumb-menu.git>)
2. Create your feature branch (`git checkout -b feat/fooBar`)
3. Commit your changes (`git commit -am 'Add some fooBar'`)
4. Push to the branch (`git push origin feature/fooBar`)
5. Create a new Pull Request

## License

[MIT](LICENSE)

## Show your support

Give a ⭐️ if this project helped you!

---

_This README was generated with ❤️ by [readme-md-generator](https://github.com/kefranabg/readme-md-generator)_
