<template>
  <div :id="'file-panel-' + activeView" role="tabpanel" :aria-labelledby="'file-tab-' + activeView" tabindex="0">
    <GtfsJsonViewer v-if="activeView === 'json'" :data="feed" />
    <div v-else-if="activeView === 'tree'">
      <div v-for="(entity, index) in feed.entity" :key="index">
        <GtfsFeedEntity :entity="entity" class="px-4" />
        <hr v-if="index < feed.entity.length - 1" class="border-t border-indigo-900 my-2" />
      </div>
    </div>
    <GtfsTableView v-else-if="activeView === 'table'" :feed="feed" />
    <GtfsMapView v-else-if="activeView === 'map' && vehicleEntities.length" :entities="vehicleEntities" />
    <FileDetails v-else-if="activeView === 'details'" :file="loadedFile" />
  </div>
</template>

<script>
import { defineAsyncComponent } from 'vue';
import GtfsFeedEntity from '@/components/GtfsFeedEntity.vue';
import GtfsJsonViewer from '@/components/GtfsJsonViewer.vue';
import GtfsTableView from '@/components/GtfsTableView.vue';
import FileDetails from '@/components/FileDetails.vue';
import { getVehicleEntities } from '@/utils/vehiclePositions.js';

export default {
  name: 'GtfsFeed',
  components: {
    GtfsMapView: defineAsyncComponent(() => import('@/components/GtfsMapView.vue')),
    GtfsTableView, GtfsFeedEntity, GtfsJsonViewer, FileDetails,
  },
  props: {
    feed: { type: Object, required: true },
    activeView: { type: String, required: true },
    loadedFile: { type: Object, required: true },
  },
  computed: {
    vehicleEntities() {
      return getVehicleEntities(this.feed);
    },
  },
}
</script>