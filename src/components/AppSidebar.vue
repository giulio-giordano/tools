<script setup lang="ts">
import { usePreferencesStore } from '../stores/preferences'

const preferences = usePreferencesStore()
</script>

<template>
  <aside class="border-b border-neutral-200 bg-white px-5 py-4 sm:px-8 lg:sticky lg:top-[4.5rem] lg:w-64 lg:shrink-0 lg:border-b-0 lg:border-r lg:px-5 lg:py-8">
    <nav :aria-label="preferences.t('navHome')">
      <h2 class="mb-3 px-3 text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">
        {{ preferences.t('navHome') }}
      </h2>
      <RouterLink
        class="group flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-neutral-600 transition hover:bg-neutral-100 hover:text-black"
        active-class="bg-neutral-100 font-medium text-black"
        :to="{ name: 'pdf-merge' }"
      >
        <span class="grid size-10 shrink-0 place-items-center rounded-xl bg-neutral-100 text-neutral-600 transition group-hover:bg-white">
          <svg aria-hidden="true" class="size-5" fill="none" viewBox="0 0 24 24">
            <path d="M6 3.75h8l4.25 4.5v12H6z" stroke="currentColor" stroke-linejoin="round" stroke-width="1.5" />
            <path d="M14 4v5h4M9 13h6m-6 3h6" stroke="currentColor" stroke-linecap="round" stroke-width="1.5" />
          </svg>
        </span>
        <span class="min-w-0 flex-1">{{ preferences.t('pdfMergeTitle') }}</span>
        <svg aria-hidden="true" class="size-4 text-neutral-400 transition group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24">
          <path d="M5 12h14m-6-6 6 6-6 6" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" />
        </svg>
      </RouterLink>
      <RouterLink
        class="group flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-neutral-600 transition hover:bg-neutral-100 hover:text-black"
        active-class="bg-neutral-100 font-medium text-black"
        :to="{ name: 'docx-to-pdf' }"
      >
        <span class="grid size-10 shrink-0 place-items-center rounded-xl bg-neutral-100 text-neutral-600 transition group-hover:bg-white">
          <svg aria-hidden="true" class="size-5" fill="none" viewBox="0 0 24 24">
            <path d="M6 3.75h8l4.25 4.5v12H6z" stroke="currentColor" stroke-linejoin="round" stroke-width="1.5" />
            <path d="M14 4v5h4M9 13h6m-6 3h6" stroke="currentColor" stroke-linecap="round" stroke-width="1.5" />
          </svg>
        </span>
        <span class="min-w-0 flex-1">{{ preferences.t('docxPdfToolTitle') }}</span>
        <svg aria-hidden="true" class="size-4 text-neutral-400 transition group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24">
          <path d="M5 12h14m-6-6 6 6-6 6" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" />
        </svg>
      </RouterLink>
    </nav>
  </aside>
</template>
