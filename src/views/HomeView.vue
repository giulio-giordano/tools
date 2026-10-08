<script setup lang="ts">
import ToolCard from '../components/ToolCard.vue'
import { usePreferencesStore } from '../stores/preferences'

const preferences = usePreferencesStore()
</script>

<template>
  <section class="py-8 sm:py-10 xl:py-12">
    <div class="mb-7 flex items-center justify-between gap-4">
      <h1 class="text-2xl font-semibold tracking-tight text-neutral-950 sm:text-3xl">
        {{ preferences.t('availableTools') }}
      </h1>
      <span aria-hidden="true" class="hidden h-px flex-1 bg-neutral-200 sm:block"></span>
    </div>
    <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 2xl:grid-cols-3">
      <ToolCard
        :title="preferences.t('pdfMergeTitle')"
        :description="preferences.t('pdfMergeDescription')"
        to="/pdf-merge"
      />
      <ToolCard
        :title="preferences.t('docxPdfToolTitle')"
        :description="preferences.t('docxPdfToolDescription')"
        to="/docx-to-pdf"
      />
      <ToolCard
        :title="preferences.t('pdfDocxToolTitle')"
        :description="preferences.t('pdfDocxToolDescription')"
        to="/pdf-to-docx"
      />
    </div>
  </section>
</template>
