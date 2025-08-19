import React from 'react';
import ReactDOM from 'react-dom/client';
import TestPreview from './components/test-preview';
import './index.css';

// 创建测试页面
const TestApp: React.FC = () => {
  return (
    <div className="App">
      <TestPreview />
    </div>
  );
};

// 渲染到页面
const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <TestApp />
  </React.StrictMode>
);