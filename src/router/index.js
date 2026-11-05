import { createRouter, createWebHashHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import FeedView from '@/views/FeedView.vue'
import DocumentationView from '@/views/DocumentationView.vue'
import AboutView from '@/views/AboutView.vue'

export default createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'home', component: HomeView },
    { path: '/feed', name: 'feed', component: FeedView },
    { path: '/documentation', name: 'documentation', component: DocumentationView },
    { path: '/about', name: 'about', component: AboutView },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
  scrollBehavior(to, from, savedPosition) {
    return savedPosition || { top: 0 }
  },
})
