// src/routes/layout.tsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../components/layout/Header';
import Sidebar from '../components/layout/Sidebar';

console.log('layout.tsx - 模块导入完成');

export default function RootLayout() {
  console.log('layout.tsx - RootLayout组件实例化');

  // 使用useEffect来跟踪组件挂载
  React.useEffect(() => {
    console.log('layout.tsx - RootLayout组件挂载完成');

    // 使用setTimeout延迟检查，确保子路由有足够时间渲染
    const checkContentTimer = setTimeout(() => {
      console.log('layout.tsx - 延迟检查子路由渲染情况...');
      const mainContent = document.querySelector('main');

      if (mainContent) {
        console.log('layout.tsx - 主内容区域存在，检查内部内容...');
        const childElements = mainContent.children;
        console.log(`layout.tsx - main内部元素数量: ${childElements.length}`);

        // 检查Outlet是否成功渲染子路由内容
        if (childElements.length === 0) {
          console.warn(
            'layout.tsx - WARNING: main元素内没有子元素,Outlet可能未正确渲染',
          );
        } else {
          console.log('layout.tsx - Outlet已成功渲染子路由内容');
        }
      } else {
        console.error('layout.tsx - ERROR: 未找到main元素');
      }
    }, 500);

    return () => {
      clearTimeout(checkContentTimer);
      console.log('layout.tsx - RootLayout组件将被卸载');
    };
  }, []);

  return (
    <div
      className="flex flex-col min-h-screen"
      style={{
        backgroundColor: 'var(--semi-color-bg-0)',
        color: 'var(--semi-color-text-0)',
      }}
    >
      {/* 顶部导航栏 */}
      <Header />

      {/* 主体内容区：左侧 Sidebar + 右侧主内容 */}
      <div className="flex flex-1">
        {/* 左侧侧边栏 */}
        <Sidebar />

        {/* 右侧主内容区 */}
        <main className="flex-1 p-0 overflow-auto bg-black min-h-[calc(100vh-60px)]">
          {/* 直接渲染Outlet，避免嵌套函数可能引起的渲染问题 */}
          <Outlet />
        </main>
      </div>
    </div>
  );
}
