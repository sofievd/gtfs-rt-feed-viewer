<template>
  <nav aria-label="File navigation" class="flex h-14 min-w-0 items-center gap-3 border-b border-gray-200 px-4 sm:gap-6 sm:px-6">
    <div role="tablist" aria-label="File views" class="relative flex h-full min-w-0 flex-1 overflow-x-auto">
      <button v-for="(tab, index) in tabs" :key="tab.id" :id="'file-tab-' + tab.id"
              :ref="element => { if (element) tabButtons[index] = element }"
              type="button" role="tab" :aria-selected="activeView === tab.id"
              :aria-controls="'file-panel-' + tab.id" :tabindex="activeView === tab.id ? 0 : -1"
              class="h-full shrink-0 cursor-pointer whitespace-nowrap border-b-4 px-3 text-sm text-indigo-900 focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-indigo-900 sm:px-4"
              :class="activeView === tab.id ? 'border-indigo-900 font-semibold' : 'border-transparent hover:border-indigo-200'"
              @click="$emit('select-view', tab.id)" @keydown="navigateTabs($event, index)">
        {{ tab.label }}
      </button>
    </div>
    <div class="ml-auto flex min-w-0 max-w-[35%] shrink-0 items-center gap-1 text-sm text-indigo-900">
      <span class="min-w-0 truncate" :title="fileName">{{ fileName }}</span>
      <button type="button" @click="$emit('close')" aria-label="Close feed and return to landing page"
              class="shrink-0 rounded p-2 hover:bg-indigo-50 focus-visible:outline-2 focus-visible:outline-indigo-900">
        <XMarkIcon class="size-5" aria-hidden="true" />
      </button>
    </div>
  </nav>
</template>

<script>
import { XMarkIcon } from '@heroicons/vue/24/outline';

export default {
  name: 'FileNavigation',
  components: { XMarkIcon },
  props: {
    fileName: { type: String, required: true },
    activeView: { type: String, required: true },
    hasMap: { type: Boolean, default: false },
  },
  emits: ['select-view', 'close'],
  data() {
    return { tabButtons: [] }
  },
  computed: {
    tabs() {
      return [
        { id: 'details', label: 'File details' },
        { id: 'json', label: 'JSON' },
        { id: 'tree', label: 'Tree' },
        { id: 'table', label: 'Table' },
        ...(this.hasMap ? [{ id: 'map', label: 'Map' }] : []),
      ];
    },
  },
  mounted() {
    this.ensureActiveTabVisible();
  },
  watch: {
    activeView() {
      this.$nextTick(this.ensureActiveTabVisible);
    },
  },
  methods: {
    ensureActiveTabVisible() {
      const button = this.tabButtons[this.tabs.findIndex(tab => tab.id === this.activeView)];
      if (!button) return;
      const list = button.parentElement;
      if (button.offsetLeft < list.scrollLeft) list.scrollLeft = button.offsetLeft;
      else if (button.offsetLeft + button.offsetWidth > list.scrollLeft + list.clientWidth) {
        list.scrollLeft = button.offsetLeft + button.offsetWidth - list.clientWidth;
      }
    },
    navigateTabs(event, index) {
      let next;
      if (event.key === 'ArrowRight') next = (index + 1) % this.tabs.length;
      else if (event.key === 'ArrowLeft') next = (index + this.tabs.length - 1) % this.tabs.length;
      else if (event.key === 'Home') next = 0;
      else if (event.key === 'End') next = this.tabs.length - 1;
      else return;
      event.preventDefault();
      this.tabButtons[next]?.focus();
      this.$emit('select-view', this.tabs[next].id);
    },
  },
}
</script>
