/**
 * API 服务统一入口
 * 基于 Swagger 文档: http://49.232.250.11:8080
 */

import { request } from '@umijs/max';

// ==================== 认证相关 ====================

/** 登录 POST /v1/iam/login */
export async function login(data: API.LoginParams) {
  return request<API.LoginResult>('/api/v1/iam/login', {
    method: 'POST',
    data,
  });
}

/** 获取当前用户信息 GET /v1/iam/users/current */
export async function getCurrentUser() {
  return request<API.Response<API.CurrentUser>>('/api/v1/iam/users/current', {
    method: 'GET',
  });
}

/** 修改密码 PUT /v1/iam/user/password */
export async function changePassword(data: {
  old_password: string;
  new_password: string;
}) {
  return request<API.Response>('/api/v1/iam/user/password', {
    method: 'PUT',
    data,
  });
}

/** 退出登录 POST /v1/iam/logout */
export async function logout() {
  return request<API.Response>('/api/v1/iam/logout', {
    method: 'POST',
    data: {},
  });
}

// ==================== 应用管理 (Applications) ====================

/** 获取应用列表 GET /v1/applications */
export async function getApplicationList(params?: API.ApplicationListParams) {
  return request<API.Response<API.ApplicationListResult>>('/api/v1/applications', {
    method: 'GET',
    params,
  });
}

/** 创建应用 POST /v1/applications */
export async function createApplication(params: API.ApplicationCreateParams) {
  return request<API.Response>('/api/v1/applications', {
    method: 'POST',
    params,
  });
}

/** 更新应用 PUT /v1/applications/:id */
export async function updateApplication(
  id: number,
  params: API.ApplicationUpdateParams,
) {
  return request<API.Response<API.Application>>(`/api/v1/applications/${id}`, {
    method: 'PUT',
    params,
  });
}

/** 删除应用 DELETE /v1/applications/:id */
export async function deleteApplication(id: number) {
  return request<API.Response>(`/api/v1/applications/${id}`, {
    method: 'DELETE',
  });
}

// ==================== 设备管理 (Devices) ====================

/** 获取设备列表 GET /v1/devices */
export async function getDeviceList(params?: API.PageParams) {
  return request<API.Response<API.DeviceListResult>>('/api/v1/devices', {
    method: 'GET',
    params,
  });
}

/** 获取设备详情 GET /v1/devices/:id */
export async function getDeviceDetail(id: number) {
  return request<API.Response<API.Device>>(`/api/v1/devices/${id}`, {
    method: 'GET',
  });
}

/** 更新设备 PUT /v1/devices/:id */
export async function updateDevice(id: number, params: API.DeviceUpdateParams) {
  return request<API.Response<API.Device>>(`/api/v1/devices/${id}`, {
    method: 'PUT',
    params,
  });
}

// ==================== 连接器/边缘节点 (Edges) ====================

/** 获取连接器列表 GET /v1/edges */
export async function getEdgeList(params?: API.PageParams) {
  return request<API.Response<API.EdgeListResult>>('/api/v1/edges', {
    method: 'GET',
    params,
  });
}

/** 获取连接器详情 GET /v1/edges/:id */
export async function getEdgeDetail(id: number) {
  return request<API.Response<API.Edge>>(`/api/v1/edges/${id}`, {
    method: 'GET',
  });
}

/** 检测连接器在线状态 GET /v1/edges/:id */
export async function checkEdgeOnline(id: number) {
  return request<API.Response<API.Edge>>(`/api/v1/edges/${id}`, {
    method: 'GET',
  });
}

/** 获取安装链接 GET /v1/edges/install-link */
export async function getEdgeInstallLink() {
  return request<API.Response<API.EdgeInstallLink>>('/api/v1/edges/install-link', {
    method: 'GET',
  });
}

/** 确认连接器安装 POST /v1/edges */
export async function confirmEdgeInstall(data: API.EdgeConfirmParams) {
  return request<API.Response<API.Edge>>('/api/v1/edges', {
    method: 'POST',
    data,
  });
}

/** 更新连接器 PUT /v1/edges/:id */
export async function updateEdge(id: number, data: API.EdgeUpdateParams) {
  return request<API.Response<API.Edge>>(`/api/v1/edges/${id}`, {
    method: 'PUT',
    data,
  });
}

/** 删除连接器 DELETE /v1/edges/:id */
export async function deleteEdge(id: number) {
  return request<API.Response>(`/api/v1/edges/${id}`, {
    method: 'DELETE',
  });
}

/** 获取扫描应用任务 GET /v1/edges/:edge_id/scan_application_tasks */
export async function getEdgeScanTask(edgeId: number) {
  return request<API.Response<API.EdgeScanApplicationTask>>(
    `/api/v1/edges/${edgeId}/scan_application_tasks`,
    {
      method: 'GET',
      params: { edge_id: edgeId },
    },
  );
}

/** 创建扫描应用任务 POST /v1/edges/:edge_id/scan_application_tasks */
export async function createEdgeScanTask(params: API.EdgeScanTaskCreateParams) {
  return request<API.Response>(
    `/api/v1/edges/${params.edge_id}/scan_application_tasks`,
    {
      method: 'POST',
      params,
    },
  );
}

// ==================== 代理管理 (Proxies) ====================

/** 获取代理列表 GET /v1/proxies */
export async function getProxyList(params?: API.PageParams) {
  return request<API.Response<API.ProxyListResult>>('/api/v1/proxies', {
    method: 'GET',
    params,
  });
}

/** 创建代理 POST /v1/proxies */
export async function createProxy(params: API.ProxyCreateParams) {
  return request<API.Response<API.Proxy>>('/api/v1/proxies', {
    method: 'POST',
    params,
  });
}

/** 更新代理 PUT /v1/proxies/:id */
export async function updateProxy(id: number, params: API.ProxyUpdateParams) {
  return request<API.Response<API.Proxy>>(`/api/v1/proxies/${id}`, {
    method: 'PUT',
    params,
  });
}

/** 删除代理 DELETE /v1/proxies/:id */
export async function deleteProxy(id: number) {
  return request<API.Response>(`/api/v1/proxies/${id}`, {
    method: 'DELETE',
  });
}
