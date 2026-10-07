import { defineStore } from 'pinia'
import { ref } from 'vue'
import { messages, type Locale, type MessageKey } from '../i18n/messages'

const localeStorageKey = 'toolbox.locale'

function readSavedLocale(): Locale {
  return localStorage.getItem(localeStorageKey) === 'en' ? 'en' : 'it'
}

export const usePreferencesStore = defineStore('preferences', () => {
  const locale = ref<Locale>(readSavedLocale())

  function applyLocale(value: Locale) {
    localStorage.setItem(localeStorageKey, value)
    document.documentElement.lang = value
    document.title = messages[value].documentTitle
  }

  applyLocale(locale.value)

  function setLocale(value: Locale) {
    locale.value = value
    applyLocale(value)
  }

  function t(key: MessageKey, params?: Record<string, string | number>): string {
    let text: string = messages[locale.value][key]

    if (params) {
      for (const [name, value] of Object.entries(params)) {
        text = text.split(`{${name}}`).join(String(value))
      }
    }

    return text
  }

  return { locale, setLocale, t }
})
