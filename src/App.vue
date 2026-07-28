<script>
import { useGlobalStore } from "./store/global.js";
import { storeToRefs } from "pinia";
import { debugConfig } from "@/utils/config";
import { initWework } from "@/utils/wx.js";
import VConsole from "vconsole";
export default {
  onLaunch: async function () {
    // vconsole 调试工具（仅在 H5 环境且配置启用时加载）
    // #ifdef H5
    if (debugConfig.enabled) {
      // 初始化 VConsole
      new VConsole();
      console.log("[vconsole] 调试工具已启动");
    }

    // #endif
    await initWework({
      corpId: "wxe7e2fa35ea164594",
      jsApiList: ["geoLocation"],
    });

    const globalStore = useGlobalStore();
    await globalStore.initSystemInfo();
    await globalStore.login();
  },
  onShow: function () {
    console.log("App Show");
  },
  onHide: function () {
    console.log("App Hide");
  },
};
</script>

<style lang="scss">
.uni-scroll-view-refresher {
  background-color: rgba(0, 0, 0, 0) !important;
}
</style>
