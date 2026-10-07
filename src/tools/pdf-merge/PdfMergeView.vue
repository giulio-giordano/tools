<script setup lang="ts">
import { computed, ref } from 'vue'
import PdfFileList from './PdfFileList.vue'
import { PdfMergeError, mergePdfFiles, type PdfMergeErrorCode } from './merge-pdfs'
import { usePreferencesStore } from '../../stores/preferences'

const preferences = usePreferencesStore()
const files = ref<File[]>([])
const outputName = ref('merged.pdf')
const isDragging = ref(false)
const isMerging = ref(false)
const errorCode = ref<PdfMergeErrorCode | 'merge-failed' | null>(null)
const errorFileName = ref('')
const isComplete = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)

const errorMessage = computed(() => {
  switch (errorCode.value) {
    case 'minimum-files':
      return preferences.t('minimumFiles')
    case 'invalid-pdf':
      return preferences.t('invalidPdf')
    case 'unreadable-pdf':
      return preferences.t('unreadablePdf', { name: errorFileName.value })
    case 'merge-failed':
      return preferences.t('mergeFailed')
    default:
      return ''
  }
})

function addFiles(fileList: FileList | null) {
  if (!fileList?.length) return
  files.value = [...files.value, ...Array.from(fileList)]
  errorCode.value = null
  isComplete.value = false
}

function onFileSelection(event: Event) {
  const input = event.currentTarget as HTMLInputElement
  addFiles(input.files)
  input.value = ''
}

function onDragOver(event: DragEvent) {
  event.preventDefault()
  if (!isMerging.value) isDragging.value = true
}

function onDrop(event: DragEvent) {
  isDragging.value = false
  if (isMerging.value) return
  addFiles(event.dataTransfer?.files ?? null)
}

function moveFile(from: number, to: number) {
  if (from < 0 || from >= files.value.length || to < 0 || to >= files.value.length) return
  const nextFiles = [...files.value]
  const [file] = nextFiles.splice(from, 1)
  if (!file) return
  nextFiles.splice(to, 0, file)
  files.value = nextFiles
  errorCode.value = null
  isComplete.value = false
}

function removeFile(index: number) {
  files.value = files.value.filter((_, fileIndex) => fileIndex !== index)
  errorCode.value = null
  isComplete.value = false
}

function outputFileName(): string {
  const name = outputName.value.trim() || 'merged.pdf'
  return name.toLowerCase().endsWith('.pdf') ? name : `${name}.pdf`
}

async function mergeAndDownload() {
  errorCode.value = null
  isComplete.value = false
  isMerging.value = true

  try {
    const bytes = await mergePdfFiles(files.value)
    const blob = new Blob([bytes.slice().buffer as ArrayBuffer], { type: 'application/pdf' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = outputFileName()
    link.click()
    window.setTimeout(() => URL.revokeObjectURL(url), 1000)
    isComplete.value = true
  } catch (error) {
    if (error instanceof PdfMergeError) {
      errorCode.value = error.code
      errorFileName.value = error.fileName ?? ''
    } else {
      errorCode.value = 'merge-failed'
    }
  } finally {
    isMerging.value = false
  }
}
</script>

<template>
  <section class="py-12 sm:py-20">
    <RouterLink
      class="inline-flex items-center gap-2 text-sm text-neutral-500 transition hover:text-black"
      :to="{ name: 'home' }"
    >
      <span aria-hidden="true">←</span>
      {{ preferences.t('backToTools') }}
    </RouterLink>

    <div class="mt-10 max-w-3xl">
      <p class="font-mono text-xs uppercase tracking-[0.2em] text-neutral-500">
        {{ preferences.t('toolIndex') }}
      </p>
      <h1 class="mt-4 text-4xl font-semibold tracking-[-0.05em] text-black sm:text-5xl">
        {{ preferences.t('pdfMergeHeading') }}
      </h1>
      <p class="mt-5 max-w-2xl text-base leading-7 text-neutral-600">
        {{ preferences.t('pdfMergeIntroduction') }}
      </p>
      <p id="privacy-copy" class="mt-3 text-sm leading-6 text-neutral-500">
        {{ preferences.t('privacyMessage') }}
      </p>
    </div>

    <div class="mt-10 max-w-3xl border border-neutral-200 bg-white p-5 sm:p-8">
      <input
        ref="fileInput"
        class="hidden"
        type="file"
        accept=".pdf,application/pdf"
        multiple
        tabindex="-1"
        aria-hidden="true"
        @change="onFileSelection"
      />
      <div
        class="border border-dashed px-5 py-9 text-center transition sm:py-12"
        :class="isDragging ? 'border-black bg-neutral-50' : 'border-neutral-300'"
        @dragenter="onDragOver"
        @dragover="onDragOver"
        @dragleave="isDragging = false"
        @drop.prevent="onDrop"
      >
        <svg aria-hidden="true" class="mx-auto size-8 text-neutral-500" fill="none" viewBox="0 0 24 24">
          <path d="M12 16V4m0 0L8 8m4-4 4 4M5 14v5h14v-5" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" />
        </svg>
        <p class="mt-4 text-sm font-semibold text-neutral-900">{{ preferences.t('dropzoneTitle') }}</p>
        <p class="mt-1 text-sm text-neutral-500">{{ preferences.t('dropzoneHint') }}</p>
        <button
          type="button"
          class="mt-5 border border-black px-4 py-2 text-sm font-medium text-black transition hover:bg-black hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black disabled:cursor-not-allowed disabled:opacity-50"
          :disabled="isMerging"
          @click="fileInput?.click()"
        >
          {{ preferences.t('chooseFiles') }}
        </button>
      </div>

      <div class="mt-8 flex items-center justify-between gap-4">
        <h2 class="text-sm font-semibold">{{ preferences.t('selectedFiles') }}</h2>
        <span class="font-mono text-xs text-neutral-500" aria-live="polite">
          {{ preferences.t('fileCount', { count: files.length }) }}
        </span>
      </div>

      <p v-if="files.length === 0" class="py-6 text-sm text-neutral-500">
        {{ preferences.t('noFilesSelected') }}
      </p>
      <PdfFileList
        v-else
        class="mt-3"
        :files="files"
        :disabled="isMerging"
        @move="moveFile"
        @remove="removeFile"
      />

      <p class="mt-3 text-xs leading-5 text-neutral-500">{{ preferences.t('reorderHint') }}</p>
      <p v-if="files.length < 2" class="mt-2 text-sm text-neutral-600">
        {{ preferences.t('minimumFiles') }}
      </p>

      <div class="mt-8 border-t border-neutral-200 pt-6">
        <label for="output-name" class="block text-sm font-medium text-neutral-800">
          {{ preferences.t('outputName') }}
        </label>
        <input
          id="output-name"
          v-model="outputName"
          class="mt-2 w-full border border-neutral-300 px-3 py-2 text-sm outline-none transition focus:border-black focus:ring-1 focus:ring-black sm:max-w-sm"
          type="text"
          maxlength="120"
          :disabled="isMerging"
        />
      </div>

      <div class="mt-6 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
        <button
          type="button"
          class="min-h-11 bg-black px-5 py-3 text-sm font-medium text-white transition hover:bg-neutral-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black disabled:cursor-not-allowed disabled:bg-neutral-300"
          :disabled="files.length < 2 || isMerging"
          @click="mergeAndDownload"
        >
          {{ isMerging ? preferences.t('merging') : preferences.t('mergePdfs') }}
        </button>
        <p v-if="isMerging" role="status" aria-live="polite" class="text-sm text-neutral-600">
          {{ preferences.t('merging') }}
        </p>
        <p v-else-if="isComplete" role="status" aria-live="polite" class="text-sm text-neutral-700">
          {{ preferences.t('mergeSuccess') }}
        </p>
        <p v-else-if="errorMessage" role="alert" class="text-sm text-red-700">
          {{ errorMessage }}
        </p>
      </div>
    </div>
  </section>
</template>
