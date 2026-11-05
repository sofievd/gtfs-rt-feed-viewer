<template>
      <section v-if="loadedFile" id="feed-content" class="min-h-[calc(100vh-8.5rem)] scroll-mt-[136px] w-full"
               :class="{ 'px-4': !fullWidthView, 'py-6': activeView !== 'map' }">
        <GtfsFeed :key="loadedFile.version" :feed="loadedFile.feed" :loaded-file="loadedFile" :active-view="activeView"
                  class="bg-gray-50 w-full px-4"
                  :class="{ 'max-w-[1200px] mx-auto rounded-3xl': !fullWidthView, 'py-4': activeView !== 'map' }"/>
      </section>
</template>
<script>
import GtfsFeed from '@/components/GtfsFeed.vue';
export default {
  name: 'FeedView',
  components: { GtfsFeed },
  props: {
    loadedFile: { type: Object, default: null },
    activeView: { type: String, default: 'json' },
  },
  computed: {
    fullWidthView() {
      return ['map', 'table', 'json', 'tree', 'details'].includes(this.activeView);
    },
  },
  mounted() {
    if (!this.loadedFile) this.$router.replace('/');
  },
}
</script>
