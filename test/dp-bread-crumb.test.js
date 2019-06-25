import { createLocalVue, shallowMount } from '@vue/test-utils'
import VueRouter from 'vue-router'
import DpBreadCrumb from '../breadcrumb/dp-bread-crumb.vue'

const localVue = createLocalVue()
const router = new VueRouter()
localVue.use(VueRouter)

describe('测试面包屑组件', () => {
  test('是一个 Vue 组件', () => {
    const wrapper = shallowMount(DpBreadCrumb, {
      localVue,
      router
    })

    expect(wrapper.isVueInstance()).toBeTruthy()
  })

  test('渲染不同的 separator', () => {
    const wrapper = shallowMount(DpBreadCrumb, {
      localVue,
      router,
      propsData: {
        separator: '-'
      }
    })

    expect(wrapper.vm.separator).toBe('-')
  })
})
