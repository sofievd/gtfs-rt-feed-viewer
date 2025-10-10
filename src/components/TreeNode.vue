<template>
  <div>
    <div v-for="(value, key) in data" :key="key" class="ml-2">
      <!-- Toggleable key if it's expandable -->
      <div
          v-if="isExpandable(value)"
          class="cursor-pointer select-none font-bold text-xl"
          @click="toggleNode(key)"
      >
        <span class="text-indigo-900">
           <FontAwesomeIcon
               :icon="isExpanded(key) ? 'fa-chevron-down' : 'fa-chevron-right'" />
        </span>
        {{ key }}
      </div>

      <!-- Simple key:value if not expandable -->
      <div v-else class="ml-4">
        <span class="text-lg font-bold text-indigo-800">{{ key }}: </span>
        <span class="text-lg text-gray-900"> {{ value }}</span>
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