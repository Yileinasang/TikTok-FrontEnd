/**
 * Mock请求工具，用于开发阶段模拟API响应
 * @param data 要返回的模拟数据
 * @param delay 延迟时间（毫秒）
 * @returns Promise对象，延迟指定时间后resolve数据
 */
export const mockRequest = <T>(data: T, delay = 300): Promise<T> => {
  return new Promise(resolve => {
    setTimeout(() => resolve(data), delay);
  });
};
