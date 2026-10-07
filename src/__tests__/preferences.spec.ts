import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { usePreferencesStore } from '../stores/preferences'

const localeStorageKey = 'toolbox.locale'

beforeEach(() => {
  localStorage.clear()
  document.documentElement.lang = 'it'
  document.title = ''
  setActivePinia(createPinia())
})

describe('language preference', () => {
  it('defaults to Italian and provides Italian copy', () => {
    const preferences = usePreferencesStore()

    expect(preferences.locale).toBe('it')
    expect(preferences.t('availableTools')).toBe('Strumenti disponibili')
    expect(document.documentElement.lang).toBe('it')
  })

  it('changes and persists English across store instances', () => {
    const preferences = usePreferencesStore()
    preferences.setLocale('en')

    expect(preferences.t('availableTools')).toBe('Available tools')
    expect(localStorage.getItem(localeStorageKey)).toBe('en')
    expect(document.documentElement.lang).toBe('en')
    expect(document.title).toContain('tools')

    setActivePinia(createPinia())
    expect(usePreferencesStore().locale).toBe('en')
  })
})
