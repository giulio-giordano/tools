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
      path: '/pdf-merge',
      name: 'pdf-merge',
      component: () => import('../tools/pdf-merge/PdfMergeView.vue'),
    },
  ],
})

export default router
