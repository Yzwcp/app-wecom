// 打包前自动递增版本号（patch 位 +1），作为 prebuild:h5 钩子执行
const fs = require("fs");
const path = require("path");

const pkgPath = path.resolve(__dirname, "../package.json");
const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));

const parts = String(pkg.version || "1.0.0").split(".");
while (parts.length < 3) parts.push("0");
parts[2] = String(parseInt(parts[2], 10) + 1 || 1);
pkg.version = parts.slice(0, 3).join(".");

fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n");
console.log(`[bump-version] 版本号已递增为 ${pkg.version}`);
