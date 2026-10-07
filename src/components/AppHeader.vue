<script setup lang="ts">
import type { Locale } from '../i18n/messages'
import { usePreferencesStore } from '../stores/preferences'

const preferences = usePreferencesStore()

function changeLocale(event: Event) {
  const value = (event.currentTarget as HTMLSelectElement).value
  if (value === 'it' || value === 'en') preferences.setLocale(value as Locale)
}
</script>

<template>
  <header class="sticky top-0 z-20 border-b border-neutral-200 bg-white/90 backdrop-blur">
    <div class="flex min-h-18 items-center justify-between gap-4 px-5 sm:px-8 xl:px-12">
      <RouterLink class="text-lg font-semibold tracking-tight text-black no-underline" :to="{ name: 'home' }">
        {{ preferences.t('brand') }}
      </RouterLink>
      <label class="sr-only" for="language-select">{{ preferences.t('languageLabel') }}</label>
      <div class="flex items-center gap-2 rounded-xl border border-neutral-200 bg-neutral-50 px-3">
        <svg aria-hidden="true" class="size-4 text-neutral-500" fill="none" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.5" />
          <path d="M3 12h18M12 3a15 15 0 0 1 0 18 15 15 0 0 1 0-18Z" stroke="currentColor" stroke-width="1.5" />
        </svg>
        <select
          id="language-select"
          class="max-w-24 rounded-lg border-0 bg-transparent py-2 pr-2 text-sm text-neutral-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
          :value="preferences.locale"
          @change="changeLocale"
        >
          <option value="it">{{ preferences.t('italian') }}</option>
          <option value="en">{{ preferences.t('english') }}</option>
        </select>
      </div>
    </div>
  </header>
</template>
