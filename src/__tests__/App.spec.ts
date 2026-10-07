import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import App from '../App.vue'
import router from '../router'

describe('app shell', () => {
  beforeEach(() => {
    localStorage.setItem('toolbox.locale', 'it')
  })

  afterEach(() => {
    router.replace('/')
  })

  it('shows the toolbox navigation and the PDF merge tool', async () => {
    await router.push('/')
    await router.isReady()

    const wrapper = mount(App, { global: { plugins: [createPinia(), router] } })

    expect(wrapper.text()).toContain('tools')
    expect(wrapper.text()).toContain('Unisci PDF')
    expect(wrapper.find('a[href="#/pdf-merge"]').exists()).toBe(true)

    wrapper.unmount()
  })
})
