<script setup lang="ts">
import { usePreferencesStore } from '../stores/preferences'

const preferences = usePreferencesStore()
</script>

<template>
  <aside
    data-testid="privacy-notice"
    role="note"
    class="mb-3 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm leading-6 text-emerald-950"
  >
    <svg aria-hidden="true" class="mt-0.5 size-5 shrink-0" fill="none" viewBox="0 0 24 24">
      <path
        d="M12 3 20 6v5c0 5-3.3 8.4-8 10-4.7-1.6-8-5-8-10V6l8-3Z"
        stroke="currentColor"
        stroke-linejoin="round"
        stroke-width="1.5"
      />
      <path
        d="m9 12 2 2 4-4"
        stroke="currentColor"
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="1.5"
      />
    </svg>
    <span>{{ preferences.t('privacyNotice') }}</span>
  </aside>
</template>
