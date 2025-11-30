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

console.log('global.tsx - 模块导入完成，开始应用初始化');
console.log('global.tsx - 路由组件导入检查:', {
  HomePageExists: !!HomePage,
  RootLayoutExists: !!RootLayout,
  DetailPageExists: !!DetailPage,
});

// 启用全局暗色模式
console.log('global.tsx - 设置全局暗色模式');
document.body.setAttribute('theme-mode', 'dark');

// 定义路由配置
console.log('global.tsx - 开始创建路由配置');
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
console.log('global.tsx - 路由配置创建完成');

// 定义扩展Window接口
interface AppWindow extends Window {
  __DOUYIN_APP__?: {
    root: ReactDOM.Root;
  };
}

// 获取root元素
console.log('global.tsx - 查找root元素');
const rootElement = document.getElementById('root');
console.log('global.tsx - root元素查找结果:', {
  exists: !!rootElement,
  tagName: rootElement?.tagName || 'null',
  id: rootElement?.id || 'null',
});

// 确保root元素存在
if (!rootElement) {
  console.error('global.tsx - 严重错误: Root element not found');
  throw new Error('Root element not found');
}
console.log('global.tsx - root元素验证通过');

// 获取扩展的window对象
const appWindow = window as AppWindow;

// 解决方案：拦截ReactDOM.createRoot方法调用
// 这是为了防止第三方库重复创建React根实例
const originalCreateRoot = ReactDOM.createRoot;

// 重写createRoot方法，使用ReactDOM自带的类型定义
ReactDOM.createRoot = (
  container: ReactDOM.Container,
  options?: ReactDOM.RootOptions,
): ReactDOM.Root => {
  // 检查是否是root元素
  if (container === rootElement) {
    // 如果是root元素且已有根实例，直接返回已有实例
    if (appWindow.__DOUYIN_APP__?.root) {
      console.log('Using existing React root instance for root element');
      return appWindow.__DOUYIN_APP__.root;
    }
  }

  // 对于其他元素，调用原始方法
  return originalCreateRoot(container, options);
};

// 初始化React应用
console.log('global.tsx - 开始React应用初始化', {
  hasExistingRoot: !!appWindow.__DOUYIN_APP__?.root,
});

if (!appWindow.__DOUYIN_APP__?.root) {
  try {
    console.log('global.tsx - 创建新的React root实例...');
    // 创建根实例
    appWindow.__DOUYIN_APP__ = {
      root: originalCreateRoot(rootElement),
    };
    console.log('global.tsx - React root实例创建成功');

    // 渲染应用
    console.log('global.tsx - 开始渲染React应用...');
    appWindow.__DOUYIN_APP__.root.render(<RouterProvider router={router} />);
    console.log('global.tsx - React app rendered successfully');
  } catch (error) {
    console.error('global.tsx - Error initializing React app:', error);
    throw error;
  }
} else {
  // 如果已有根实例，使用它进行渲染更新
  try {
    console.log('global.tsx - Updating existing React root instance...');
    appWindow.__DOUYIN_APP__.root.render(<RouterProvider router={router} />);
    console.log('global.tsx - React app updated successfully');
  } catch (error) {
    console.error('global.tsx - Error updating React app:', error);
  }
}
