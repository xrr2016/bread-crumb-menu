<template>
  <ul class="dp-breadcrumb" role="navigation" aria-roledescription="bread crumbs">
    <li class="dp-breadcrumb__item" v-for="(bread, index) of breads" :key="index">
      <a class="dp-breadcrumb__link" :href="bread.path" v-if="bread.isLink">{{ bread.name }}</a>
      <a class="dp-breadcrumb__link" v-else>{{ bread.name }}</a>
      <span class="dp-breadcrumb__separator">{{ separator }}</span>
    </li>
  </ul>
</template>

<script>
import breadcrumbs from "./dp-bread-crumb.json";

export const findMatchRoutes = (
  paths = [],
  routers = [],
  index = 0,
  matched = []
) => {
  if (!paths.length || !routers.length) {
    return [];
  }

  const path = paths[index];
  const matchRoute = routers.find(r => r.path === path);

  if (matchRoute) {
    if (matchRoute.children && matchRoute.children.length) {
      return findMatchRoutes(
        paths,
        matchRoute.children,
        index + 1,
        matched.concat(matchRoute)
      );
    } else {
      return matched.concat(matchRoute);
    }
  } else {
    return matched;
  }
};

export default {
  name: "DpBreadCrumb",
  props: {
    separator: {
      type: String,
      default: "/"
    }
  },
  computed: {
    breads() {
      const path = this.$route.path;

      if (path === "/") {
        return [{ name: "首页", path, isLink: false }];
      }

      const breads = breadcrumbs;
      const paths = this.$route.path
        .split("/")
        .filter(r => r)
        .map(r => "/" + r);

      return findMatchRoutes(paths, breads, 0, []);
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
