<template>
  <div class="font-sans">
    <header class="sticky top-0 z-50 w-full bg-white">
      <nav aria-label="Site navigation" class="flex h-20 items-center gap-4 border-b border-gray-200 px-4 sm:gap-8 sm:px-6">
        <RouterLink to="/" class="text-lg font-semibold text-indigo-900 sm:text-xl">Gtfs-RT Feed Viewer</RouterLink>
        <div class="flex items-center gap-4 text-sm sm:gap-6">
          <RouterLink to="/documentation" class="text-indigo-900 hover:underline"
                      exact-active-class="font-semibold underline">Documentation</RouterLink>
          <RouterLink to="/about" class="text-indigo-900 hover:underline"
                      exact-active-class="font-semibold underline">About</RouterLink>
        </div>
      </nav>
      <FileNavigation v-if="loadedFile" :file-name="loadedFile.name" :active-view="activeView"
                      :has-map="hasMap" @select-view="selectView" @close="resetFeed" />
    </header>
    <main>
      <RouterView v-slot="{ Component, route }">
        <KeepAlive :key="viewerKey" include="HomeView">
          <component :is="Component"
                     v-bind="route.name === 'home' ? { loadedFile, activeView } : {}"
                     @feed-loaded="handleFeedLoaded" />
        </KeepAlive>
      </RouterView>
    </main>
  </div>
</template>

<script>
import { markRaw } from 'vue';
import { RouterLink, RouterView } from 'vue-router';
import FileNavigation from '@/components/FileNavigation.vue';
import { getVehicleEntities } from '@/utils/vehiclePositions.js';

export default {
  name: "App",
  components: { RouterLink, RouterView, FileNavigation },
  data() {
    return { loadedFile: null, activeView: 'json', viewerKey: 0, fileVersion: 0 }
  },
  computed: {
    hasMap() {
      return this.loadedFile ? getVehicleEntities(this.loadedFile.feed).length > 0 : false;
    },
  },
  methods: {
    async handleFeedLoaded(file) {
      this.fileVersion += 1;
      this.loadedFile = { ...file, feed: markRaw(file.feed), version: this.fileVersion };
      this.activeView = this.hasMap ? 'map' : 'json';
      if (this.$route.name !== 'home') await this.$router.push('/');
      this.scrollToFeed();
    },
    async selectView(view) {
      this.activeView = view;
      if (this.$route.name !== 'home') await this.$router.push('/');
      this.scrollToFeed();
    },
    async scrollToFeed() {
      await this.$nextTick();
      // Run after Vue Router's scroll restoration and the view's DOM update.
      requestAnimationFrame(() => {
        const content = document.getElementById('feed-content');
        if (!content) return;
        window.scrollTo({
          top: window.scrollY + content.getBoundingClientRect().top - 136,
          behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
        });
      });
    },
    async resetFeed() {
      this.loadedFile = null;
      this.activeView = 'json';
      this.viewerKey += 1;
      await this.$router.push('/');
      await this.$nextTick();
      requestAnimationFrame(() => window.scrollTo({
        top: 0,
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
      }));
    },
  },
}
</script>
