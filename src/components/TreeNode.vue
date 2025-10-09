<template>
  <div>
    <div v-for="(value, key) in data" :key="key" class="ml-2">
      <!-- Toggleable key if it's expandable -->
      <div
          v-if="isExpandable(value)"
          class="cursor-pointer select-none font-semibold text-blue-600"
          @click="toggleNode(key)"
      >
        <FontAwesomeIcon
        :icon="isExpanded(key) ? 'fa-chevron-down' : 'fa-chevron-right'" />
        {{ key }}
      </div>

      <!-- Simple key:value if not expandable -->
      <div v-else class="ml-4">
        <span class="font-semibold">{{ key }}:</span>
        <span class="text-gray-700"> {{ value }}</span>
      </div>

      <!-- Nested expandable content -->
      <div
          v-if="isExpanded(key)"
          class="ml-4 border-l border-gray-300 pl-2 mt-1"
      >
        <tree-node :data="value" />
      </div>
    </div>
  </div>
</template>

<script>
import {FontAwesomeIcon} from "@fortawesome/vue-fontawesome";

export default {
  name: "TreeNode",
  components: {FontAwesomeIcon},
  props: {
    data: {
      type:[Object, Array, String, Number],
      required:true
    },
  },
  data(){
    return {
      expandedKeys: {},
    }
  },
  methods:{
    toggleNode(key){
      this.expandedKeys[key] = !this.expandedKeys[key];
    },
    isExpanded(key){
      return !!this.expandedKeys[key]
    },
    isExpandable(val) {
      return val && typeof val === "object";
    }
  }
}
</script>

<style>

</style>