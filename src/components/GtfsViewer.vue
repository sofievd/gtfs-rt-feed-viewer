<template>
  <div class="p-4">

    <h2 class="text-4xl">Gtfs Feed Viewer</h2>

    <h3> Upload a .pb file</h3>
    <input type="file" @change="handleFileUpload" accept=".pb"/>

    <h3> Or paste a URL to download .pb file</h3>
    <input type="text" v-model="fileUrl" placeholder="Enter URL"/>
    <button @click="downloadFile">Fetch File</button>


    <div v-if="feed">
      <div v-for="(entity, index) in feed.entity"
           :key="index"
           class="border dark:border-gray-500 p-3 mb-3 rounded bg-gray-50"
      >
        <div class="flex items-center cursor-pointer"
             @click="toggleEntity(entity.id)">
      <span class="mr-2 text-lg font-sans text-purple-700">
      <FontAwesomeIcon
          :icon="isEntityExpanded(entity.id) ? 'fa-chevron-down' : 'fa-chevron-right'"
          class="text-purple-700"
      />
      </span>
          <p class="font-bold text-gray-800">
            Entity ID: {{ entity.id || "(no id)" }}
          </p>
        </div>

        <div v-if="isEntityExpanded(entity.id)" class="mt-2">
          <tree-node :data="entity"/>
        </div>

        <!--       <p class="font-bold text-lg text-gray-800 mb-2" >
                 Entity ID: {{ entity.id || "(no id)" }}
               </p>
                  <TreeNode :data="entity" />-->
      </div>

      <!--        <template v-for="(value , key) in entity" :key="key" >
                <div v-if="key !== entity.id">
                  <span> {{key}}</span>
                  <template v-if="isObject(value)">
                    <div>
                      <template v-for="(subValue, subKey) in value" :key="subKey" >
                        <span class="font-semibold">{{ subKey }}:</span>
                        <template v-if="isObject(subValue)">
                          <div class="ml-4">
                            <template v-for="(innerValue, innerKey) in subValue" :key="innerKey">
                              <div>
                                <span class="font-semibold">{{ innerKey }}:</span> {{ innerValue }}
                              </div>
                            </template>
                          </div>
                        </template>
                        <template v-else>
                          {{ subValue }}
                        </template>
                      </template>
                    </div>
                  </template>
                </div>

              </template>

           <div v-if="entity.vehicle" class="border border-gray-600 p-2 mb-2">
                <p class="font-bold">VehiclePosition</p>
                <div class="ml-2">
                  <template v-for="(value, key) in entity.vehicle" :key="key">
                    <div>
                      <span class="font-semibold">{{ key }}:</span>
                      <template v-if="isObject(value)">
                        <div class="ml-4">
                          <template v-for="(subValue, subKey) in value" :key="subKey">
                            <div>
                              <span class="font-semibold">{{ subKey }}:</span> {{ subValue }}
                            </div>
                          </template>
                        </div>
                      </template>
                      <template v-else>
                        {{ value }}
                      </template>
                    </div>
                  </template>
                </div>
              </div>-->

    </div>

  </div>


</template>

<script>
import root from "/src/assets/gtfs-realtime.js";
import TreeNode from "@/components/TreeNode.vue";
import {FontAwesomeIcon} from "@fortawesome/vue-fontawesome";

export default {
  name: "GtfsViewer",
  components: {FontAwesomeIcon, TreeNode},
  data() {
    return {
      feed: null,
      fileUrl: "",
      expandedEntities: {}
    }
  },

  methods: {
    async handleFileUpload(event) {
      const file = event.target.files[0];
      if (!file) return;

       /* const arrayBuffer = await file.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        this.decodeProtobuf(uint8Array);*/

      const reader = new FileReader();
      reader.onload = async(e) => {
        const arrayBuffer = e.target.result;
        const uint8Array = new Uint8Array(arrayBuffer);
         this.decodeProtobuf(uint8Array);
      }
      reader.readAsArrayBuffer(file);

    },
    async downloadFile() {
      if(!this.fileUrl) return alert("Please paste a URL!");
      try{
        const response = await fetch(this.fileUrl)
        if(!response.ok) throw new Error("Failed to download file");

        const blob = await response.blob();
        const arrayBuffer = await blob.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        this.decodeProtobuf(uint8Array);

      } catch (error) {
        console.log(error);
      }
    },
    toggleEntity(id) {
      this.expandedEntities = {
        ...this.expandedEntities,
        [id]: !this.expandedEntities[id],
      }
    },
    isEntityExpanded(id) {
      return this.expandedEntities[id]
    },
    decodeProtobuf(arrayBuffer) {
      try {
        const FeedMessage = root.transit_realtime.FeedMessage;
        const decoded = FeedMessage.decode(arrayBuffer);
        this.feed = decoded;

        console.log('Decoded message:', decoded);
      } catch (error) {
        console.log(error);
      }
    }
  }
}
</script>

<style scoped>
</style>