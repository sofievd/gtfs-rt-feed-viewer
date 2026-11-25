<template>
  <div class="flex min-h-screen bg-[#F0F0FA] font-sans">
    <SidePanel :theme="theme" @home="resetFeed" @toggle-theme="toggleTheme" />
    <div class="min-w-0 flex-1">
      <header v-if="loadedFile" ref="fileHeader" class="sticky top-0 z-50 bg-[#F0F0FA]">
        <FileNavigation :file-name="loadedFile.name" :active-view="activeView"
                        :feed-header="loadedFile.feed.header" :has-map="hasMap"
                        :can-refresh="canRefresh" :is-refreshing="refreshController !== null"
                        :refresh-interval-seconds="refreshIntervalSeconds"
                        @change-refresh-interval="setRefreshInterval"
                        @select-view="selectView" @refresh="refreshFeed" @close="resetFeed" />
        <p v-if="refreshError" role="alert" class="px-4 py-2 text-sm text-red-700">{{ refreshError }}</p>
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
import { decodeFeed, downloadFeed } from '@/utils/feedLoading.js';
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
    return {
      loadedFile: null,
      activeView: 'json',
      viewerKey: 0,
      fileVersion: 0,
      theme: savedTheme(),
      refreshController: null,
      refreshError: '',
      refreshIntervalSeconds: 0,
      refreshTimer: null,
    }
  },
  watch: {
    '$route.name'(name) {
      if (name !== 'feed') this.clearFeedRefresh();
    },
    theme: {
      immediate: true,
      handler(theme) {
        document.documentElement.dataset.theme = theme;
        document.documentElement.style.colorScheme = theme;
        try { localStorage.setItem('theme', theme); } catch (_) { /* Storage may be unavailable. */ }
      },
    },
  },
  beforeUnmount() {
    this.clearFeedRefresh();
  },
  computed: {
    canRefresh() {
      return this.loadedFile?.source === 'url' && Boolean(this.loadedFile.url);
    },
    hasMap() {
      return this.loadedFile ? getVehicleEntities(this.loadedFile.feed).length > 0 : false;
    },
  },
  methods: {
    toggleTheme() {
      this.theme = this.theme === 'light' ? 'dark' : 'light';
    },
    setLoadedFile(file) {
      this.fileVersion += 1;
      this.loadedFile = { ...file, feed: markRaw(file.feed), version: this.fileVersion };
    },
    async handleFeedLoaded(file) {
      this.clearFeedRefresh();
      this.setLoadedFile(file);
      this.activeView = this.hasMap ? 'map' : 'json';
      if (this.$route.name !== 'feed') await this.$router.push('/feed');
      this.scrollToFeed();
    },
    setRefreshInterval(seconds) {
      clearInterval(this.refreshTimer);
      this.refreshIntervalSeconds = seconds;
      this.refreshTimer = seconds > 0 && this.canRefresh
        ? setInterval(() => this.refreshFeed(), seconds * 1000)
        : null;
    },
    clearFeedRefresh() {
      this.setRefreshInterval(0);
      this.refreshController?.abort();
      this.refreshController = null;
      this.refreshError = '';
    },
    async refreshFeed() {
      if (!this.canRefresh || this.refreshController) {
        console.info('[Feed refresh] Request skipped', {
          canRefresh: this.canRefresh,
          alreadyRefreshing: Boolean(this.refreshController),
        });
        return;
      }

      const previousFile = this.loadedFile;
      const { name, source, url } = previousFile;
      const controller = new AbortController();
      this.refreshController = controller;
      this.refreshError = '';

      let stage = 'download';
      try {
        console.info('[Feed refresh] Fetching feed with browser cache bypassed');
        const bytes = await downloadFeed(url, { cache: 'no-store', signal: controller.signal });
        if (controller.signal.aborted) {
          console.info('[Feed refresh] Request canceled');
          return;
        }
        console.info('[Feed refresh] Download complete', { bytes: bytes.byteLength });

        stage = 'decode';
        const file = decodeFeed(bytes, name, { source, url });
        console.info('[Feed refresh] Feed decoded', {
          previousTimestamp: Object.hasOwn(previousFile.feed.header, 'timestamp')
            ? previousFile.feed.header.timestamp.toString() : null,
          receivedTimestamp: Object.hasOwn(file.feed.header, 'timestamp')
            ? file.feed.header.timestamp.toString() : null,
          previousEntities: previousFile.feed.entity.length,
          receivedEntities: file.feed.entity.length,
        });

        stage = 'update';
        this.setLoadedFile(file);
        if (this.activeView === 'map' && !this.hasMap) this.activeView = 'json';
        await this.$nextTick();
        if (!controller.signal.aborted) {
          console.info('[Feed refresh] Viewer updated', {
            version: this.loadedFile.version,
            activeView: this.activeView,
          });
        }
      } catch (error) {
        if (controller.signal.aborted) {
          console.info('[Feed refresh] Request canceled');
        } else {
          this.refreshError = 'Unable to refresh this feed. The last loaded data is still displayed.';
          console.error('[Feed refresh] Failed', { stage, message: error.message });
        }
      } finally {
        if (this.refreshController === controller) this.refreshController = null;
      }
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
      this.clearFeedRefresh();
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
