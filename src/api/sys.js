import { get, post } from "@/utils/request";

export function getDictByKey(data) {
  return get("/wjapp/wjMobile/dict/list", data);
}

// 上传文件：返回 Promise<{ code, data: string }>，data 为文件 URL
export function uploadFile({ filePath, category, token }) {
  return new Promise((resolve, reject) => {
    uni.uploadFile({
      url: "https://nyq.win.shengdajia.cn/wjapp/wjMobile/file/upload",
      filePath,
      name: "file",
      formData: { category },
      header: { Token: token || "" },
      success: (res) => {
        try {
          const result = JSON.parse(res.data);
          if (result.code === 200) {
            resolve(result);
          } else {
            reject(result);
          }
        } catch {
          reject({ msg: "解析上传响应失败" });
        }
      },
      fail: (err) => reject(err),
    });
  });
}
