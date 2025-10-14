<template>
  <div>
    <GtfsEntitySummary :entity="entity" class="mb-2"></GtfsEntitySummary>
    <GtfsTreeView :entity="entity"/>
  </div>
</template>

<script>
import GtfsTreeView from "@/components/GtfsTreeView.vue";
import GtfsEntitySummary from "@/components/GtfsEntitySummary.vue";

export default {
  name: "GtfsFeedEntity",
  components: {GtfsEntitySummary, GtfsTreeView},
  props: ["entity"],
}
</script>
<style scoped>

</style>