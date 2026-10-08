import { createRouter, createWebHashHistory } from 'vue-router'

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../views/HomeView.vue'),
    },
    {
      path: '/privacy',
      name: 'privacy',
      component: () => import('../views/PrivacyView.vue'),
    },
    {
      path: '/pdf-merge',
      name: 'pdf-merge',
      component: () => import('../tools/pdf-merge/PdfMergeView.vue'),
    },
    {
      path: '/docx-to-pdf',
      name: 'docx-to-pdf',
      component: () => import('../tools/docx-to-pdf/DocxToPdfView.vue'),
    },
    {
      path: '/pdf-to-docx',
      name: 'pdf-to-docx',
      component: () => import('../tools/pdf-to-docx/PdfToDocxView.vue'),
    },
  ],
})

export default router
