<script setup lang="ts">
import AppHeader from './components/AppHeader.vue'
import AppSidebar from './components/AppSidebar.vue'
import { usePreferencesStore } from './stores/preferences'

const preferences = usePreferencesStore()
</script>

<template>
  <div class="flex min-h-screen flex-col bg-neutral-50 text-neutral-950">
    <AppHeader />
    <div class="flex flex-1 flex-col lg:flex-row">
      <AppSidebar />
      <main class="min-w-0 flex-1 px-5 sm:px-8 xl:px-12">
        <RouterView />
      </main>
    </div>
    <footer class="border-t border-neutral-200 bg-white">
      <div class="flex items-center justify-between gap-4 px-5 py-5 text-xs text-neutral-500 sm:px-8 xl:px-12">
        <span>{{ preferences.t('brand') }}</span>
        <RouterLink
          to="/privacy"
          class="underline underline-offset-2 hover:text-neutral-900"
        >
          {{ preferences.t('privacyLink') }}
        </RouterLink>
      </div>
    </footer>
  </div>
</template>
