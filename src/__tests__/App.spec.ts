import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
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
    expect(wrapper.text()).toContain('Converti PDF in DOCX')
    expect(wrapper.find('a[href="#/pdf-to-docx"]').exists()).toBe(true)
    expect(wrapper.find('nav a[href="#/pdf-to-docx"]').exists()).toBe(true)

    await router.push('/pdf-to-docx')
    await router.isReady()
    await nextTick()
    expect(wrapper.find('h1').text()).toBe('Converti PDF in DOCX')

    wrapper.unmount()
  })

  it('shows the same localized privacy notice on every tool page', async () => {
    await router.push('/')
    await router.isReady()

    const wrapper = mount(App, { global: { plugins: [createPinia(), router] } })
    const toolRoutes = ['/pdf-merge', '/docx-to-pdf', '/pdf-to-docx']
    const italianNotice =
      'I tuoi file restano sul tuo dispositivo: l’elaborazione avviene nel browser e i documenti non vengono caricati sui nostri server.'
    const englishNotice =
      'Your files stay on your device: processing runs in your browser, and documents are not uploaded to our servers.'

    expect(wrapper.find('[data-testid="privacy-notice"]').exists()).toBe(false)
    for (const route of toolRoutes) {
      await router.push(route)
      await nextTick()
      expect(wrapper.find('[data-testid="privacy-notice"]').text()).toBe(italianNotice)
    }

    await wrapper.find('#language-select').setValue('en')
    await nextTick()
    for (const route of toolRoutes) {
      await router.push(route)
      await nextTick()
      expect(wrapper.find('[data-testid="privacy-notice"]').text()).toBe(englishNotice)
    }

    wrapper.unmount()
  })

  it('explains local language preference storage on the privacy page', async () => {
    await router.push('/privacy')
    await router.isReady()

    const wrapper = mount(App, { global: { plugins: [createPinia(), router] } })

    expect(wrapper.find('h1').text()).toBe('Privacy')
    expect(wrapper.text()).toContain('Preferenza della lingua')
    expect(wrapper.text()).toContain('toolbox.locale')
    expect(
      wrapper.find('a[href="https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement"]').exists(),
    ).toBe(true)

    await wrapper.find('#language-select').setValue('en')
    await nextTick()
    expect(wrapper.find('h1').text()).toBe('Privacy')
    expect(wrapper.text()).toContain('Language preference')
    expect(wrapper.text()).toContain('This site is hosted on GitHub Pages.')

    wrapper.unmount()
  })
})
