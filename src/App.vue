<script setup lang="ts">
import AppHeader from './components/AppHeader.vue'
import { usePreferencesStore } from './stores/preferences'

const preferences = usePreferencesStore()
</script>

<template>
  <div class="flex min-h-screen flex-col bg-white text-black">
    <AppHeader />
    <main class="mx-auto w-full max-w-6xl flex-1 px-5 sm:px-8">
      <RouterView />
    </main>
    <footer class="border-t border-black/10">
      <div class="mx-auto flex max-w-6xl items-center justify-between px-5 py-5 text-xs text-neutral-500 sm:px-8">
        <span>{{ preferences.t('brand') }}</span>
        <span>{{ preferences.t('footerPrivacy') }}</span>
      </div>
    </footer>
  </div>
</template>
