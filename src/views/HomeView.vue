<script setup lang="ts">
import ToolCard from '../components/ToolCard.vue'
import { usePreferencesStore } from '../stores/preferences'

const preferences = usePreferencesStore()
</script>

<template>
  <section class="py-10 sm:py-14">
    <h1 class="border-b border-neutral-200 pb-4 text-2xl font-semibold tracking-tight text-black sm:text-3xl">
      {{ preferences.t('availableTools') }}
    </h1>
    <div class="mt-6 grid max-w-lg grid-cols-1 gap-4">
      <ToolCard
        index="01"
        :title="preferences.t('pdfMergeTitle')"
        :description="preferences.t('pdfMergeDescription')"
        to="/pdf-merge"
      />
    </div>
  </section>
</template>
