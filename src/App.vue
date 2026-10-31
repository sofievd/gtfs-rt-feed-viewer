<template>

  <div class="font-sans">
    <header class="sticky top-0 z-50 h-20 w-full border-b border-gray-200 bg-white px-4 sm:px-6">
      <nav aria-label="Site navigation" class="flex h-full items-center gap-4 sm:gap-8">
        <RouterLink to="/" class="text-lg font-semibold text-indigo-900 sm:text-xl">Gtfs-RT Feed Viewer</RouterLink>
        <div class="flex items-center gap-4 text-sm sm:gap-6">
          <RouterLink to="/documentation" class="text-indigo-900 hover:underline"
                      exact-active-class="font-semibold underline">Documentation</RouterLink>
          <RouterLink to="/about" class="text-indigo-900 hover:underline"
                      exact-active-class="font-semibold underline">About</RouterLink>
        </div>
        <div v-if="loadedFileName" class="ml-auto flex min-w-0 items-center gap-2 text-sm text-indigo-900">
          <span class="truncate" :title="loadedFileName">{{ loadedFileName }}</span>
          <button type="button" @click="resetFeed" aria-label="Close feed and return to landing page"
                  class="shrink-0 rounded p-2 hover:bg-indigo-50 focus-visible:outline-2 focus-visible:outline-indigo-900">
            <XMarkIcon class="size-5" aria-hidden="true" />
          </button>
        </div>
      </nav>
    </header>
    <main>
      <RouterView v-slot="{ Component }">
        <KeepAlive :key="viewerKey" include="HomeView">
          <component :is="Component" @feed-loaded="loadedFileName = $event" />
        </KeepAlive>
      </RouterView>
    </main>
  </div>

</template>

<script>
import { RouterLink, RouterView } from 'vue-router';
import { XMarkIcon } from '@heroicons/vue/24/outline';

export default {
  name: "App",
  components: { RouterLink, RouterView, XMarkIcon },
  data() {
    return { loadedFileName: '', viewerKey: 0 }
  },
  methods: {
    async resetFeed() {
      this.loadedFileName = '';
      this.viewerKey += 1;
      await this.$router.push('/');
      this.$nextTick(() => window.scrollTo({
        top: 0,
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
      }));
    },
  },
}

</script>

<style scoped>

</style>
