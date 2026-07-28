import { get, post } from "@/utils/request";

/**
 * 待回访列表分页
 * @param {Object} params - 查询参数
 * @param {number} params.current - 当前页码
 * @param {number} params.size - 每页条数
 * @returns {Promise}
 */
export function getVisitPendingPage(params) {
  return get("/wjapp/wjMobile/visitRecord/pendingPage", { ...params });
}

/**
 * 回访记录分页
 * @param {Object} params - 查询参数
 * @param {number} params.current - 当前页码
 * @param {number} params.size - 每页条数
 * @returns {Promise}
 */
export function getVisitRecordPage(params) {
  return get("/wjapp/wjMobile/visitRecord/page", { ...params });
}

/**
 * 新增回访记录
 * @param {Object} data
 * @param {string} data.customerId - 客户ID
 * @param {string} data.contractId - 合同ID
 * @param {string} data.visitTime - 回访时间
 * @param {string} data.satisfaction - 满意度
 * @param {string} data.content - 回访内容
 * @param {string} [data.problems] - 问题记录
 * @param {string} [data.plans] - 后续维护计划
 * @returns {Promise}
 */
export function addVisitRecord(data) {
  return post("/wjapp/wjMobile/visitRecord/add", data);
}

/**
 * 回访记录详情
 * @param {Object} data
 * @param {string|number} data.id - 记录ID
 * @returns {Promise}
 */
export function getVisitRecordDetail(data) {
  return get("/wjapp/wjMobile/visitRecord/detail", data);
}
