<script setup lang="ts">
import { RouterLink } from 'vue-router'

defineProps<{
  title: string
  description: string
  to: string
}>()
</script>

<template>
  <RouterLink
    :to="to"
    class="group flex min-h-64 flex-col justify-between rounded-3xl border border-neutral-200 bg-white p-6 text-neutral-950 no-underline shadow-sm transition duration-200 hover:-translate-y-1 hover:border-neutral-300 hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-black sm:p-7"
  >
    <div class="flex items-start justify-between gap-4">
      <span class="grid size-12 place-items-center rounded-2xl bg-neutral-100 text-neutral-700 transition group-hover:bg-neutral-950 group-hover:text-white">
        <svg aria-hidden="true" class="size-6" fill="none" viewBox="0 0 24 24">
          <path d="M6 3.75h8l4.25 4.5v12H6z" stroke="currentColor" stroke-linejoin="round" stroke-width="1.5" />
          <path d="M14 4v5h4M9 13h6m-6 3h6" stroke="currentColor" stroke-linecap="round" stroke-width="1.5" />
        </svg>
      </span>
      <span class="grid size-10 place-items-center rounded-full border border-neutral-200 text-neutral-500 transition group-hover:border-neutral-950 group-hover:bg-neutral-950 group-hover:text-white">
        <svg aria-hidden="true" class="size-5 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24">
          <path d="M5 12h14m-6-6 6 6-6 6" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" />
        </svg>
      </span>
    </div>
    <div class="mt-12">
      <h2 class="text-xl font-semibold tracking-tight sm:text-2xl">{{ title }}</h2>
      <p class="mt-2 max-w-sm text-sm leading-6 text-neutral-600">{{ description }}</p>
    </div>
  </RouterLink>
</template>
