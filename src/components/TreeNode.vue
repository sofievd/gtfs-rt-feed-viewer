<template>
  <div v-if="isRoot">
    <button @click="toggleAll(true)" class="mr-2 px-2 py-1 bg-indigo-500 text-white rounded">Expand All</button>
    <button @click="toggleAll(false)" class="px-2 py-1 bg-gray-500 text-white rounded">Collapse All</button>
  </div>
  <div v-for="(value, key) in data" :key="key" class="ml-2">

    <!-- Toggleable key if it's expandable -->
    <div
        v-if="isExpandable(value)"
        class="cursor-pointer select-none font-bold text-xl"
        @click="toggleNode(key)"
    >
        <span class="text-indigo-900">
           <FontAwesomeIcon
               :icon="isExpanded(key) ? 'fa-chevron-down' : 'fa-chevron-right'"/>
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
      <tree-node :data="value" :is-root="false"/>
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
      type: [Object, Array, String, Number],
      required: true
    },
    isRoot: {
      type: Boolean,
      required: true
    }
  },
  data() {
    return {
      expandedKeys: {},
    }
  },
  methods: {
    toggleNode(key) {
      this.expandedKeys[key] = !this.expandedKeys[key];
    },
    isExpanded(key) {
      return !!this.expandedKeys[key]
    },
    isExpandable(val) {
      return val && typeof val === "object";
    },
    toggleAll(expand) {
      console.log(expand);
      const toggleRecursive = (data) => {
        for (const key in data) {
          if (this.isExpandable(data[key])) {
            this.expandedKeys[key] = expand;
            // Recurse into nested objects
            toggleRecursive(data[key]);
          }
        }
      };
      toggleRecursive(this.data);
    }
  }
}
</script>

<style>

</style>