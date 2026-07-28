import { reactive } from "vue";
import { getDictByKey } from "@/api/index";

// 模块级单例：字典数据在所有组件间共享
const _dictData = reactive({});
const _fetchingKeys = {};

const dictMap = new Proxy(_dictData, {
  get(target, key) {
    if (typeof key === "symbol" || String(key).startsWith("__v_"))
      return Reflect.get(target, key);

    if (!(key in target) && !_fetchingKeys[key]) {
      _fetchingKeys[key] = true;
      getDictByKey({ type: key, parentId: 0 })
        .then((res) => {
          target[key] =
            res.map((i) => ({
              value: i.dictValue,
              label: i.dictLabel,
            })) || [];
        })
        .catch(() => {
          _fetchingKeys[key] = false;
        });
    }
    return target[key] || [];
  },
  set(target, key, value) {
    target[key] = value;
    return true;
  },
});

export function useDict() {
  // 根据字典 key 和 value 获取对应的 label
  function getDictLabel(dictKey, val) {
    const list = dictMap[dictKey];
    const item = list.find((i) => i.value === val);
    return item ? item.label : val;
  }

  return { dictMap, getDictLabel };
}
