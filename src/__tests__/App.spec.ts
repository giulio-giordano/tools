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

  it('shows the available tools heading and the PDF merge tool', async () => {
    await router.push('/')
    await router.isReady()

    const wrapper = mount(App, { global: { plugins: [createPinia(), router] } })

    expect(wrapper.text()).toContain('tools')
    expect(wrapper.find('h1').text()).toBe('Strumenti disponibili')
    expect(wrapper.text()).toContain('Unisci PDF')
    expect(wrapper.find('a[href="#/pdf-merge"]').exists()).toBe(true)
    expect(wrapper.text()).toContain('Converti DOCX in PDF')
    expect(wrapper.find('a[href="#/docx-to-pdf"]').exists()).toBe(true)
    expect(wrapper.find('nav a[href="#/docx-to-pdf"]').exists()).toBe(true)

    wrapper.unmount()
  })
})
