<template>
  <div class="flex min-h-screen bg-[#F0F0FA] font-sans">
    <SidePanel :theme="theme" @home="resetFeed" @toggle-theme="toggleTheme" />
    <div class="min-w-0 flex-1">
      <header v-if="loadedFile" ref="fileHeader" class="sticky top-0 z-50 bg-[#F0F0FA]">
        <FileNavigation :file-name="loadedFile.name" :active-view="activeView"
                        :feed-header="loadedFile.feed.header" :has-map="hasMap" @select-view="selectView" @close="resetFeed" />
      </header>
      <main>
      <RouterView v-slot="{ Component, route }">
          <component :is="Component" :key="route.name + ':' + viewerKey"
                     v-bind="route.name === 'feed' ? { loadedFile, activeView, theme } : {}"
                     @feed-loaded="handleFeedLoaded" />
      </RouterView>
      </main>
    </div>
  </div>
</template>

<script>
import { markRaw } from 'vue';
import { RouterView } from 'vue-router';
import FileNavigation from '@/components/FileNavigation.vue';
import SidePanel from '@/components/SidePanel.vue';
import { getVehicleEntities } from '@/utils/vehiclePositions.js';

function savedTheme() {
  try {
    return localStorage.getItem('theme') === 'dark' ? 'dark' : 'light';
  } catch (_) {
    return 'light';
  }
}

export default {
  name: "App",
  components: { RouterView, FileNavigation, SidePanel },
  data() {
    return { loadedFile: null, activeView: 'json', viewerKey: 0, fileVersion: 0, theme: savedTheme() }
  },
  watch: {
    theme: {
      immediate: true,
      handler(theme) {
        document.documentElement.dataset.theme = theme;
        document.documentElement.style.colorScheme = theme;
        try { localStorage.setItem('theme', theme); } catch (_) { /* Storage may be unavailable. */ }
      },
    },
  },
  computed: {
    hasMap() {
      return this.loadedFile ? getVehicleEntities(this.loadedFile.feed).length > 0 : false;
    },
  },
  methods: {
    toggleTheme() {
      this.theme = this.theme === 'light' ? 'dark' : 'light';
    },
    async handleFeedLoaded(file) {
      this.fileVersion += 1;
      this.loadedFile = { ...file, feed: markRaw(file.feed), version: this.fileVersion };
      this.activeView = this.hasMap ? 'map' : 'json';
      if (this.$route.name !== 'feed') await this.$router.push('/feed');
      this.scrollToFeed();
    },
    async selectView(view) {
      this.activeView = view;
      if (this.$route.name !== 'feed') await this.$router.push('/feed');
      this.scrollToFeed();
    },
    async scrollToFeed() {
      await this.$nextTick();
      // Run after Vue Router's scroll restoration and the view's DOM update.
      requestAnimationFrame(() => {
        const content = document.getElementById('feed-content');
        if (!content) return;
        window.scrollTo({
          top: window.scrollY + content.getBoundingClientRect().top - (this.$refs.fileHeader?.offsetHeight || 0),
          behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
        });
      });
    },
    async resetFeed() {
      await this.$router.push('/');
      this.loadedFile = null;
      this.activeView = 'json';
      this.viewerKey += 1;
      await this.$nextTick();
      requestAnimationFrame(() => window.scrollTo({
        top: 0,
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
      }));
    },
  },
}
</script>
