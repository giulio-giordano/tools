<script setup lang="ts">
import type { PdfToDocxQueueItem } from './pdf-files'
import { usePreferencesStore } from '../../stores/preferences'

const props = defineProps<{
  files: PdfToDocxQueueItem[]
  disabled?: boolean
}>()

const emit = defineEmits<{
  remove: [id: string]
  rename: [id: string, name: string]
}>()

const preferences = usePreferencesStore()

function formatFileSize(size: number): string {
  if (size < 1024) return `${size} B`
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(0)} KB`
  return `${(size / (1024 * 1024)).toFixed(1)} MB`
}

function statusLabel(item: PdfToDocxQueueItem): string {
  if (item.status === 'converting') return preferences.t('pdfToDocxFileStatusConverting')
  if (item.status === 'converted') return preferences.t('pdfToDocxFileStatusConverted')
  if (item.status === 'failed') return preferences.t('pdfToDocxFileStatusFailed')
  return preferences.t('pdfToDocxFileStatusReady')
}

function errorMessage(item: PdfToDocxQueueItem): string {
  if (item.error === 'invalid-name') return preferences.t('pdfToDocxInvalidName')
  if (item.error === 'password-protected')
    return preferences.t('pdfToDocxPasswordProtected', { name: item.file.name })
  return preferences.t('pdfToDocxFileConversionFailed', { name: item.file.name })
}

function updateName(item: PdfToDocxQueueItem, event: Event) {
  const input = event.currentTarget as HTMLInputElement
  item.docxName = input.value
  item.status = 'ready'
  delete item.error
  delete item.lossCount
  delete item.lossDetails
  emit('rename', item.id, item.docxName)
}
</script>

<template>
  <ol
    class="divide-y divide-neutral-200 overflow-hidden rounded-xl border border-neutral-200"
    :aria-label="preferences.t('selectedFiles')"
  >
    <li
      v-for="item in props.files"
      :key="item.id"
      class="flex flex-col gap-3 p-4 sm:flex-row sm:items-center"
    >
      <span
        class="grid size-10 shrink-0 place-items-center rounded-xl bg-rose-50 text-[10px] font-bold tracking-wide text-rose-700"
      >
        PDF
      </span>
      <span class="min-w-0 flex-1">
        <span class="block truncate text-sm font-medium text-neutral-900">{{
          item.file.name
        }}</span>
        <span class="mt-1 block text-xs text-neutral-500"
          >{{ formatFileSize(item.file.size) }} · {{ statusLabel(item) }}</span
        >
        <span v-if="item.lossCount" class="mt-1 block text-xs text-amber-800">
          {{ preferences.t('pdfToDocxLossCount', { count: item.lossCount }) }}
        </span>
        <details v-if="item.lossDetails?.length" class="mt-1 text-xs text-neutral-600">
          <summary class="cursor-pointer">{{ preferences.t('pdfToDocxViewLossReport') }}</summary>
          <ul class="mt-1 list-inside list-disc space-y-1">
            <li v-for="(detail, index) in item.lossDetails" :key="`${item.id}-loss-${index}`">
              {{ detail }}
            </li>
          </ul>
        </details>
      </span>
      <div class="flex min-w-0 flex-1 items-end gap-2">
        <div class="min-w-0 flex-1">
          <label :for="`docx-name-${item.id}`" class="block text-xs font-medium text-neutral-600">
            {{ preferences.t('pdfToDocxOutputNameFor', { name: item.file.name }) }}
          </label>
          <input
            :id="`docx-name-${item.id}`"
            :value="item.docxName"
            class="mt-1 w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-neutral-500 focus:ring-2 focus:ring-neutral-200 disabled:bg-neutral-100"
            type="text"
            maxlength="120"
            :disabled="props.disabled"
            @input="updateName(item, $event)"
          />
          <p v-if="item.error" role="alert" class="mt-1 text-xs text-red-700">
            {{ errorMessage(item) }}
          </p>
        </div>
        <button
          type="button"
          class="grid size-10 shrink-0 place-items-center rounded-lg text-neutral-600 hover:bg-neutral-100 hover:text-black focus-visible:outline-2 focus-visible:outline-black disabled:cursor-not-allowed disabled:opacity-30"
          :aria-label="preferences.t('removeFile', { name: item.file.name })"
          :disabled="props.disabled"
          @click="emit('remove', item.id)"
        >
          <svg aria-hidden="true" class="size-4" fill="none" viewBox="0 0 24 24">
            <path
              d="m7 7 10 10M17 7 7 17"
              stroke="currentColor"
              stroke-linecap="round"
              stroke-width="1.5"
            />
          </svg>
        </button>
      </div>
    </li>
  </ol>
</template>
