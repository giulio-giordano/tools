<script setup lang="ts">
import { RouterLink } from 'vue-router'

defineProps<{
  title: string
  description: string
  to: string
  index: string
}>()
</script>

<template>
  <RouterLink
    :to="to"
    class="group flex min-h-52 flex-col justify-between border border-neutral-200 bg-white p-6 text-black no-underline transition hover:border-black focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-black"
  >
    <div class="flex items-start justify-between gap-4">
      <span class="font-mono text-xs text-neutral-500">{{ index }}</span>
      <svg
        aria-hidden="true"
        class="size-5 transition-transform group-hover:translate-x-1"
        fill="none"
        viewBox="0 0 24 24"
      >
        <path d="M5 12h14m-6-6 6 6-6 6" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" />
      </svg>
    </div>
    <div>
      <h2 class="text-xl font-semibold tracking-tight">{{ title }}</h2>
      <p class="mt-2 max-w-xs text-sm leading-6 text-neutral-600">{{ description }}</p>
    </div>
  </RouterLink>
</template>
