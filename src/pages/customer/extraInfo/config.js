// 客户信息表 6 类字段配置（infoContent 为对象 JSON，嵌套对象保持结构存储）
export const INFO_TYPES = [
  {
    value: "NETWORK_DEVICE",
    label: "网络设备",
    icon: "/static/construction/network-device.svg",
    fields: [
      { key: "publicIp.ip", label: "公网IP" },
      { key: "publicIp.netmask", label: "子网掩码" },
      { key: "publicIp.gateway", label: "网关" },
      { key: "portMapping", label: "端口映射" },
      { key: "routerIp", label: "路由器IP" },
      { key: "switchIp.ip", label: "交换机IP" },
      { key: "switchIp.manageMode", label: "交换机管理方式" },
      { key: "remark", label: "备注", type: "textarea" },
    ],
  },
  {
    value: "DISKLESS_SYSTEM",
    label: "无盘系统",
    icon: "/static/construction/diskless-system.svg",
    fields: [
      { key: "serverIp", label: "服务器IP" },
      { key: "wwId.id", label: "万象账号" },
      { key: "wwId.password", label: "万象密码" },
      { key: "diskInfo.system", label: "系统盘" },
      { key: "diskInfo.image", label: "镜像盘" },
      { key: "diskInfo.writeBack", label: "回写盘" },
      { key: "diskInfo.game", label: "游戏盘" },
      { key: "remark", label: "备注", type: "textarea" },
    ],
  },
  {
    value: "CHARGING_SYSTEM",
    label: "收费系统",
    icon: "/static/construction/charging-system.svg",
    fields: [
      { key: "serverIp", label: "服务器IP" },
      { key: "consoleIp", label: "控制台IP" },
      { key: "faceDeviceIp", label: "人脸设备IP" },
      { key: "pubwinId", label: "Pubwin ID" },
      { key: "remark", label: "备注", type: "textarea" },
    ],
  },
  {
    value: "SUPERVISION_SYSTEM",
    label: "监管系统",
    icon: "/static/construction/supervision-system.svg",
    fields: [
      { key: "policeServerIp", label: "公安服务器IP" },
      { key: "cultureServerIp", label: "文化服务器IP" },
      { key: "remark", label: "备注", type: "textarea" },
    ],
  },
  {
    value: "CLIENT_MACHINE",
    label: "客户机",
    icon: "/static/construction/client-machine.svg",
    fields: [
      { key: "ipRange", label: "IP段" },
      { key: "remark", label: "备注", type: "textarea" },
    ],
  },
  {
    value: "OTHER",
    label: "其他",
    icon: "/static/construction/other.svg",
    fields: [
      { key: "monitorIpRange", label: "监控IP段" },
      { key: "wirelessIp", label: "无线IP" },
      { key: "remark", label: "备注", type: "textarea" },
    ],
  },
];

export function getInfoType(typeValue) {
  return INFO_TYPES.find((t) => t.value === typeValue);
}

export function getInfoTypeLabel(typeValue) {
  return getInfoType(typeValue)?.label || typeValue || "-";
}

// 按 "a.b" 路径读值
export function getByPath(obj, path) {
  return path.split(".").reduce((o, k) => (o ? o[k] : undefined), obj);
}

// 按 "a.b" 路径写值（自动创建中间对象）
export function setByPath(obj, path, value) {
  const keys = path.split(".");
  let cur = obj;
  for (let i = 0; i < keys.length - 1; i++) {
    if (!cur[keys[i]] || typeof cur[keys[i]] !== "object") cur[keys[i]] = {};
    cur = cur[keys[i]];
  }
  cur[keys[keys.length - 1]] = value;
}
