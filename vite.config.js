import { defineConfig } from "vite";
import uni from "@dcloudio/vite-plugin-uni";
import fs from "fs";

// 直接读磁盘上的 package.json 版本号：prebuild 钩子递增后写回文件，
// 此处读到的是递增后的新版本（npm_package_version 环境变量是启动时的旧值，不可用）
const pkg = JSON.parse(
  fs.readFileSync(new URL("./package.json", import.meta.url), "utf-8"),
);

export default defineConfig({
  plugins: [uni()],
  define: {
    // 构建时注入应用版本号（对应 package.json 的 version，打包自动递增）
    __APP_VERSION__: JSON.stringify(pkg.version || "1.0.0"),
  },
  server: {
    port: 5173,
    host: "0.0.0.0",
  },
});
