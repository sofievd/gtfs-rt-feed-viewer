<template>
  <TreeNode :level="0" title="FeedEntity" :data="entity" ref="rootTreeNode"></TreeNode>
</template>

<script>
import TreeNode from "@/components/TreeNode.vue";
import {FontAwesomeIcon} from "@fortawesome/vue-fontawesome";

export default {
  name: "GtfsTreeView",
  components: {FontAwesomeIcon, TreeNode},
  props: ['entity'],
}
</script>

<style scoped>

</style>