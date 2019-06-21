<template>
  <ul class="dp-breadcrumb" role="navigation" aria-roledescription="bread crumbs">
    <li class="dp-breadcrumb__item" v-for="(bread, index) of renderBreads" :key="index">
      <a class="dp-breadcrumb__link" :href="bread.path">{{ bread.name }}</a>
      <span class="dp-breadcrumb__separator">{{ separator }}</span>
    </li>
  </ul>
</template>

<script>
import breadcrumbs from "./dp-bread-crumb.json";

export default {
  name: "DpBreadCrumb",
  props: {
    separator: {
      type: String,
      default: "/"
    }
  },
  computed: {
    renderBreads() {
      let paths = null;
      const path = this.$route.path;

      if (path === "/") {
        paths = [path];
      } else {
        paths = path
          .split("/")
          .filter(p => p)
          .map(p => "/" + p)
          .map((path, index, paths) => {
            if (index) {
              let result = "";
              for (let i = 0; i <= index; i++) {
                result += paths[i];
              }
              return result;
            }
            return path;
          });
      }

      return paths.map(path => {
        const item = breadcrumbs.find(bread => bread.path === path);
        if (item) {
          return item;
        }
      });
    }
  }
};
</script>

<style scoped>
.dp-breadcrumb {
  padding: 0;
  margin: 0;
  font-size: 14px;
  list-style: none;
}

.dp-breadcrumb::after,
.dp-breadcrumb::before {
  display: table;
  content: "";
}

.dp-breadcrumb::after {
  clear: both;
}

.dp-breadcrumb__separator {
  margin: 0 9px;
  font-weight: 700;
  color: #c0c4cc;
}

.dp-breadcrumb__item {
  float: left;
  padding: 1em 0;
  color: #606266;
}

.dp-breadcrumb__link {
  text-decoration: none;
  transition: color 0.2s cubic-bezier(0.645, 0.045, 0.355, 1);
}

.dp-breadcrumb__link:hover {
  color: #409eff;
  cursor: pointer;
}

.dp-breadcrumb__item:last-child .dp-breadcrumb__link,
.dp-breadcrumb__item:last-child .dp-breadcrumb__link:hover {
  cursor: text;
  font-weight: 400;
  color: #409eff;
}

.dp-breadcrumb__item:last-child .dp-breadcrumb__separator {
  display: none;
}
</style>
