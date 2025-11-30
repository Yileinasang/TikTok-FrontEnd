// 导入本地全局样式
import './styles/global.scss';
// 导入React和DOM
import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
// 导入路由页面
import DetailPage from './routes/detail/[id]';
import FeaturedPage from './routes/featured';
import RootLayout from './routes/layout';
import HomePage from './routes/page';

// 启用全局暗色模式
document.body.setAttribute('theme-mode', 'dark');

// 定义路由配置
const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      {
        path: '/',
        element: <HomePage />,
      },
      {
        path: '/featured',
        element: <FeaturedPage />,
      },
      {
        path: '/detail/:id',
        element: <DetailPage />,
      },
    ],
  },
]);

// 定义扩展Window接口
interface AppWindow extends Window {
  __DOUYIN_APP__?: {
    root: ReactDOM.Root;
  };
}

// 获取root元素
const rootElement = document.getElementById('root');

// 确保root元素存在
if (!rootElement) {
  throw new Error('Root element not found');
}

// 获取扩展的window对象
const appWindow = window as AppWindow;

// 初始化React应用
if (!appWindow.__DOUYIN_APP__?.root) {
  // 创建根实例
  appWindow.__DOUYIN_APP__ = {
    root: ReactDOM.createRoot(rootElement),
  };

  // 渲染应用
  appWindow.__DOUYIN_APP__.root.render(<RouterProvider router={router} />);
} else {
  // 如果已有根实例，使用它进行渲染更新
  appWindow.__DOUYIN_APP__.root.render(<RouterProvider router={router} />);
}
