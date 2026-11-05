<template>
  <GtfsViewer @feed-loaded="$emit('feed-loaded', $event)" />
</template>

<script>
import GtfsViewer from '@/components/GtfsViewer.vue';

export default {
  name: 'HomeView',
  components: { GtfsViewer },
  emits: ['feed-loaded'],
}
</script>
