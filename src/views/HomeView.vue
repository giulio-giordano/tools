<script setup lang="ts">
import ToolCard from '../components/ToolCard.vue'
import { usePreferencesStore } from '../stores/preferences'

const preferences = usePreferencesStore()
</script>

<template>
  <section class="py-16 sm:py-24">
    <div class="max-w-3xl">
      <p class="font-mono text-xs uppercase tracking-[0.2em] text-neutral-500">
        {{ preferences.t('homeEyebrow') }}
      </p>
      <h1 class="mt-5 text-4xl font-semibold tracking-[-0.05em] text-black sm:text-6xl">
        {{ preferences.t('homeTitleFirst') }}<br />
        {{ preferences.t('homeTitleSecond') }}
      </h1>
      <p class="mt-6 max-w-xl text-base leading-7 text-neutral-600 sm:text-lg">
        {{ preferences.t('homeDescription') }}
      </p>
    </div>

    <div class="mt-14 flex items-end justify-between border-b border-black pb-3">
      <h2 class="text-sm font-semibold">{{ preferences.t('availableTools') }}</h2>
      <span class="font-mono text-xs text-neutral-500">{{ preferences.t('toolCount') }}</span>
    </div>
    <div class="mt-5 grid max-w-md grid-cols-1 gap-4">
      <ToolCard
        index="01"
        :title="preferences.t('pdfMergeTitle')"
        :description="preferences.t('pdfMergeDescription')"
        to="/pdf-merge"
      />
    </div>
  </section>
</template>
