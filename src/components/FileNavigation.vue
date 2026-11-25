<template>
  <nav aria-label="File navigation" class="flex h-[73px] min-w-0 flex-col border-b border-[#7977A6] px-4 text-[#4A4966] sm:px-6 lg:flex-row lg:items-center lg:gap-6">
    <div role="tablist" aria-label="File views" class="relative flex min-w-0 flex-1 overflow-x-auto lg:h-full">
      <button v-for="(tab, index) in tabs" :key="tab.id" :id="'file-tab-' + tab.id"
              :ref="element => { if (element) tabButtons[index] = element }"
              type="button" role="tab" :aria-selected="activeView === tab.id"
              :aria-controls="'file-panel-' + tab.id" :tabindex="activeView === tab.id ? 0 : -1"
              class="h-full shrink-0 cursor-pointer whitespace-nowrap border-b-4 px-3 font-bold text-sm focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-[#4A4966] sm:px-4"
              :class="activeView === tab.id ? 'border-[#4A4966] font-semibold' : 'border-transparent hover:border-[#7977A6]'"
              @click="$emit('select-view', tab.id)" @keydown="navigateTabs($event, index)">
        {{ tab.label }}
      </button>
    </div>
    <div class="ml-auto flex h-9 min-w-0 max-w-full shrink-0 items-center gap-1 text-sm lg:h-auto lg:max-w-[65%]">
      <span v-if="canRefresh" aria-hidden="true" class="h-6 shrink-0 border-l border-[#7977A6]"></span>
      <button v-if="canRefresh" type="button" :disabled="isRefreshing" @click="requestRefresh"
              :aria-busy="isRefreshing" title="Refresh feed"
              class="shrink-0 rounded p-2 font-semibold hover:bg-indigo-100 focus-visible:outline-2 focus-visible:outline-[#4A4966] disabled:opacity-50">
        Refresh
      </button>
      <select v-if="canRefresh" :value="refreshIntervalSeconds" aria-label="Refresh rate"
              @change="$emit('change-refresh-interval', Number($event.target.value))"
              class="min-w-0 shrink-0 rounded bg-transparent py-1 text-xs hover:bg-indigo-100 focus-visible:outline-2 focus-visible:outline-[#4A4966]">
        <option :value="0">Once / manual refresh</option>
        <option :value="5">5 seconds</option>
        <option :value="10">10 seconds</option>
        <option :value="30">30 seconds</option>
      </select>
      <span v-if="canRefresh" aria-hidden="true" class="mx-1 h-6 shrink-0 border-l border-[#7977A6]"></span>
      <div class="flex min-w-0 flex-col lg:flex-row lg:items-baseline lg:gap-1">
        <div class="truncate" :title="fileName"> <strong class="font-bold">{{ fileName }}</strong></div>
        <time v-if="timestampIso" :datetime="timestampIso" class="truncate text-xs lg:shrink-0" title="Feed timestamp (UTC)">({{ timestampIso.slice(0, 19).replace('T', ' ') }} UTC)</time>
        <span v-else class="truncate text-xs lg:shrink-0">(Feed timestamp not provided)</span>
      </div>
      <button type="button" @click="$emit('close')" aria-label="Close feed and return to landing page"
              class="shrink-0 rounded p-2 hover:bg-indigo-100 focus-visible:outline-2 focus-visible:outline-[#4A4966]">
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
    feedHeader: { type: Object, default: null },
    activeView: { type: String, required: true },
    hasMap: { type: Boolean, default: false },
    canRefresh: { type: Boolean, default: false },
    isRefreshing: { type: Boolean, default: false },
    refreshIntervalSeconds: { type: Number, default: 0 },
  },
  emits: ['select-view', 'close', 'refresh', 'change-refresh-interval'],
  data() {
    return { tabButtons: [] }
  },
  computed: {
    timestampIso() {
      if (!this.feedHeader || !Object.prototype.hasOwnProperty.call(this.feedHeader, 'timestamp') ||
          this.feedHeader.timestamp == null) return null;
      const seconds = Number(this.feedHeader.timestamp.toString());
      const date = new Date(seconds * 1000);
      return seconds >= 0 && Number.isFinite(date.getTime()) ? date.toISOString() : null;
    },
    tabs() {
      return [
        { id: 'details', label: 'Overview' },
        ...(this.hasMap ? [{ id: 'map', label: 'Map' }] : []),
        { id: 'json', label: 'JSON' },
       // { id: 'tree', label: 'Tree' },
        { id: 'table', label: 'Table' },
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
    requestRefresh() {
      console.info('[Feed refresh] Navbar button clicked');
      this.$emit('refresh');
    },
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
