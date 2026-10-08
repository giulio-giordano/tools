<script setup lang="ts">
import { usePreferencesStore } from '../stores/preferences'

const preferences = usePreferencesStore()
</script>

<template>
  <section class="mx-auto max-w-3xl py-8 sm:py-10 xl:py-12">
    <h1 class="text-3xl font-semibold tracking-[-0.04em] text-neutral-950 sm:text-4xl">
      {{ preferences.t('privacyPageTitle') }}
    </h1>
    <p class="mt-2 text-base leading-7 text-neutral-600">
      {{ preferences.t('privacyPageIntro') }}
    </p>

    <section class="mt-8">
      <h2 class="text-lg font-semibold tracking-tight text-neutral-950">
        {{ preferences.t('privacyFilesHeading') }}
      </h2>
      <p class="mt-2 text-sm leading-6 text-neutral-700">
        {{ preferences.t('privacyFilesText') }}
      </p>
    </section>

    <section class="mt-6">
      <h2 class="text-lg font-semibold tracking-tight text-neutral-950">
        {{ preferences.t('privacyLanguageHeading') }}
      </h2>
      <p class="mt-2 text-sm leading-6 text-neutral-700">
        {{ preferences.t('privacyLanguageText') }}
      </p>
    </section>

    <section class="mt-6">
      <h2 class="text-lg font-semibold tracking-tight text-neutral-950">
        {{ preferences.t('privacyHostingHeading') }}
      </h2>
      <p class="mt-2 text-sm leading-6 text-neutral-700">
        {{ preferences.t('privacyHostingText') }}
        <a
          class="font-medium text-neutral-950 underline underline-offset-2 hover:text-neutral-600"
          href="https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement"
          target="_blank"
          rel="noopener noreferrer"
        >
          {{ preferences.t('privacyGithubLink') }}
        </a>.
      </p>
    </section>
  </section>
</template>
