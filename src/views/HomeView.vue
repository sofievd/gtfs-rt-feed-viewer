<template>
  <GtfsViewer :loaded-file="loadedFile" :active-view="activeView" @feed-loaded="$emit('feed-loaded', $event)" />
</template>

<script>
import GtfsViewer from '@/components/GtfsViewer.vue';

export default {
  name: 'HomeView',
  components: { GtfsViewer },
  props: {
    loadedFile: { type: Object, default: null },
    activeView: { type: String, default: 'json' },
  },
  emits: ['feed-loaded'],
}
</script>
