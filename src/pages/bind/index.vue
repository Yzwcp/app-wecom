<template>
  <view class="page"></view>
</template>

<script setup>
import { computed, ref, onMounted } from "vue";
import { onLoad, onLaunch } from "@dcloudio/uni-app";
import { useGlobalStore } from "../../store/global";
import { storeToRefs } from "pinia";
import { getOpenidByCode } from "@/api/index.js";
const global = useGlobalStore();
const { systemInfo, configInfo, userInfo } = storeToRefs(global);
const query = ref({});
const params = ref({});
const allList = ref([]);
const allData = ref({});

onLoad(async () => {
  query.value = uni.$router.query || {};
  params.value = uni.$router.params || {};
  console.log(query.value);
  getOpenidByCode(query.value).then((res) => {
    uni.showModal({
      title: "提示",
      content: "绑定成功",
      showCancel: false,
    });
  });
});
</script>

<style scoped lang="scss">
:deep(.wd-tabbar) {
  background: transparent !important;
}
.page {
  width: 100%;
  min-height: 100vh;
}
</style>
