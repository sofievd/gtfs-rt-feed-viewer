<template>
  <div>
    <div
        v-if="isExpandable"
        class="cursor-pointer select-none font-semibold text-lg"
        @click="toggleNode()"
    >
      <component
          :is="isExpanded ? ChevronUpIcon : ChevronDownIcon"
          class="size-6 text-indigo-900 inline stroke-[3]"
      />

      <!--<FontAwesomeIcon class="text-indigo-900 text-md"
                        :icon="isExpanded ? 'fa-angle-up' : 'fa-angle-down'"/>-->

      {{ title }}
      <span class="float-end">
        <a @click.stop="expand(true)"> <PlusIcon class="inline size-6 text-indigo-900 stroke-[2]" /> </a>
      </span>
    </div>

    <div v-if="isExpanded" v-for="(childValue, childKey) in data" :key="childKey"
         class="ml-2.5 border-l border-gray-300 ">
      <!-- Nested expandable content -->
      <TreeNode v-if="isExpandable(childValue)"
                 class="ml-4 mt-1"
                 :title="(typeof childKey == 'string') ? childKey : childKey.toString()"
                 :data="childValue" :level="level + 1"
                 ref="childNodes"/>

      <!-- Simple key:value if not expandable -->
      <div v-else class="ml-6">
        <span class="text-lg font-semibold">{{ childKey }}: </span>
        <span class="text-lg text-gray-900"> {{ childValue }}</span>
      </div>
    </div>
  </div>
</template>

<script>
import {FontAwesomeIcon} from "@fortawesome/vue-fontawesome";
import {ChevronDownIcon, ChevronUpIcon, ChevronDoubleDownIcon, PlusIcon} from '@heroicons/vue/24/outline';
import {nextTick} from "vue";

export default {
  name: "TreeNode",
  components: {FontAwesomeIcon, ChevronDownIcon, ChevronUpIcon, ChevronDoubleDownIcon, PlusIcon},
  props: {
    title: {
      type: String,
      required: true,
    },
    data: {
      type: [Object, Array, String, Number],
      required: true
    },
    level: {
      type: Number,
      required: true
    }
  },
  data() {
    return {
      isExpanded: false
    }
  },
  computed: {},
  methods: {
    ChevronUpIcon,
    ChevronDownIcon,
    isExpandable(value) {
      return value && typeof value === "object";
    },
    toggleNode() {
      this.isExpanded = !this.isExpanded
    },
    expand(recursive) {
      this.isExpanded = true;
      if (recursive) {
        nextTick(() => {
          if (this.$refs.childNodes) {
            this.$refs.childNodes.forEach((node) => node.expand(true))
          }
        })
      }
    },
    collapse() {
      this.isExpanded = false;
      // always recursive since child elements are destroyed by v-if becoming false
    }
  }
}
</script>

<style>

</style>