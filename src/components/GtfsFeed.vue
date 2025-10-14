<template>
  <div>
    <div v-for="(entity, index) in feed.entity"
         :key="index"
    >
      <GtfsFeedEntity :entity="entity" class="px-4"/>

      <hr
          v-if="index < feed.entity.length - 1"
          class="border-t border-indigo-900 my-2"
      />
    </div>
  </div>
</template>

<script>
import GtfsFeedEntity from "@/components/GtfsFeedEntity.vue";

export default {
  name: "GtfsFeed",
  components: {GtfsFeedEntity},
  props: ['feed']
}
</script>

<style scoped>

</style>