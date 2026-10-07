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
  <header class="border-b border-black/10 bg-white">
    <div class="mx-auto flex min-h-18 max-w-6xl items-center justify-between gap-4 px-5 sm:px-8">
      <RouterLink class="inline-flex shrink-0 items-center gap-3 text-black no-underline" :to="{ name: 'home' }">
        <span class="grid size-9 place-items-center bg-black text-sm font-bold text-white">T</span>
        <span class="text-sm font-semibold tracking-tight">{{ preferences.t('brand') }}</span>
      </RouterLink>

      <div class="flex items-center gap-4 sm:gap-6">
        <nav :aria-label="preferences.t('navHome')" class="flex items-center gap-4 text-sm sm:gap-5">
          <RouterLink
            class="text-neutral-500 transition hover:text-black"
            active-class="!text-black"
            :to="{ name: 'home' }"
          >
            {{ preferences.t('navHome') }}
          </RouterLink>
          <RouterLink
            class="text-neutral-500 transition hover:text-black"
            active-class="!text-black"
            :to="{ name: 'pdf-merge' }"
          >
            {{ preferences.t('navPdfMerge') }}
          </RouterLink>
        </nav>
        <label class="sr-only" for="language-select">{{ preferences.t('languageLabel') }}</label>
        <select
          id="language-select"
          class="max-w-24 border-0 bg-transparent py-2 pl-1 pr-5 text-sm text-neutral-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
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
