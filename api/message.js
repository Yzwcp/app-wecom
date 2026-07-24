import { get, post } from "@/utils/request";

/**
 * 消息分页列表
 * @param {Object} params - 查询参数
 * @param {number} params.current - 当前页码
 * @param {number} params.size - 每页条数
 * @param {number} [params.isRead] - 是否已读：0-未读 / 1-已读
 * @returns {Promise}
 */
export function getMessagePage(params) {
  return get("/wjapp/wjMobile/message/page", { ...params });
}

/**
 * 未读消息数
 * @returns {Promise<number>}
 */
export function getUnreadCount() {
  return get("/wjapp/wjMobile/message/unreadCount");
}

/**
 * 标记已读
 * @param {Object} data
 * @param {number|string} data.id - 消息ID
 * @returns {Promise}
 */
export function markAsRead(data) {
  return post("/wjapp/wjMobile/message/read", data);
}

/**
 * 全部标记已读
 * @returns {Promise}
 */
export function markAllAsRead() {
  return post("/wjapp/wjMobile/message/readAll");
}
