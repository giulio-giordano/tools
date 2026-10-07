import { afterEach, describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import App from '../App.vue'
import router from '../router'

describe('app shell', () => {
  afterEach(() => {
    router.replace('/')
  })

  it('shows the toolbox navigation and the PDF merge tool', async () => {
    await router.push('/')
    await router.isReady()

    const wrapper = mount(App, { global: { plugins: [router] } })

    expect(wrapper.text()).toContain('Toolbox')
    expect(wrapper.text()).toContain('Unisci PDF')
    expect(wrapper.find('a[href="#/pdf-merge"]').exists()).toBe(true)

    wrapper.unmount()
  })
})
