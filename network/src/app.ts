// 运行时配置
import { history, RequestConfig } from '@umijs/max';
import { message, Dropdown } from 'antd';
import { LogoutOutlined, SettingOutlined } from '@ant-design/icons';
import React from 'react';
import { getCurrentUser, logout } from '@/services/api';

// 全局初始化数据配置，用于 Layout 用户信息和权限初始化
export async function getInitialState(): Promise<{
  currentUser?: API.CurrentUser;
  fetchUserInfo?: () => Promise<API.CurrentUser | undefined>;
}> {
  const fetchUserInfo = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        return undefined;
      }
      const res = await getCurrentUser();
      if (res.code === 200 && res.data) {
        return res.data;
      }
      return undefined;
    } catch (error) {
      return undefined;
    }
  };

  // 如果不是登录页面，执行用户信息获取
  const { location } = history;
  if (location.pathname !== '/login') {
    const currentUser = await fetchUserInfo();
    if (!currentUser) {
      history.push('/login');
    }
    return {
      fetchUserInfo,
      currentUser,
    };
  }
  return {
    fetchUserInfo,
  };
}

// 退出登录处理
const handleLogout = async () => {
  try {
    await logout();
  } catch (e) {
    // ignore
  }
  localStorage.removeItem('token');
  message.success('已退出登录');
  history.push('/login');
};

// 下拉菜单配置
const dropdownMenuItems = [
  {
    key: 'settings',
    icon: React.createElement(SettingOutlined),
    label: '个人设置',
    onClick: () => history.push('/settings'),
  },
  {
    type: 'divider' as const,
  },
  {
    key: 'logout',
    icon: React.createElement(LogoutOutlined),
    label: '退出登录',
    onClick: handleLogout,
  },
];

// 布局配置
export const layout = () => {
  return {
    logo: 'https://img.alicdn.com/tfs/TB1YHEpwUT1gK0jSZFhXXaAtVXa-28-27.svg',
    menu: {
      locale: false,
    },
    layout: 'mix',
    splitMenus: false,
    fixedHeader: true,
    fixSiderbar: true,
    navTheme: 'light',
    contentWidth: 'Fluid',
    colorPrimary: '#1890ff',
    siderWidth: 208,
    // 右上角头像下拉菜单
    avatarProps: {
      src: 'https://gw.alipayobjects.com/zos/antfincdn/efFD%24IOql2/weixintupian_20170331104822.jpg',
      size: 'small',
      title: 'Admin',
      render: (_props: any, avatarChildren: React.ReactNode) => {
        return React.createElement(
          Dropdown,
          { menu: { items: dropdownMenuItems } },
          avatarChildren
        );
      },
    },
    // 水印
    waterMarkProps: {
      content: 'Swagger',
    },
  };
};

// 请求配置
export const request: RequestConfig = {
  timeout: 30000,
  // 请求拦截器
  requestInterceptors: [
    (config: any) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers = {
          ...config.headers,
          Authorization: `Bearer ${token}`,
        };
      }
      return config;
    },
  ],
  // 响应拦截器
  responseInterceptors: [
    (response: any) => {
      return response;
    },
  ],
  // 错误处理
  errorConfig: {
    errorHandler: (error: any) => {
      const { response } = error;
      if (response?.status === 401) {
        localStorage.removeItem('token');
        message.error('登录已过期，请重新登录');
        history.push('/login');
      } else if (response?.status === 403) {
        message.error('没有权限访问');
      } else if (response?.status === 500) {
        message.error('服务器错误');
      } else if (!response) {
        message.error('网络异常');
      }
    },
  },
};
