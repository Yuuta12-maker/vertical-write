import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';

// ローディング画面を非表示にする
const hideLoadingScreen = () => {
  const loadingScreen = document.querySelector('.loading-screen') as HTMLElement;
  if (loadingScreen) {
    loadingScreen.style.opacity = '0';
    loadingScreen.style.transition = 'opacity 0.5s ease-out';
    setTimeout(() => {
      loadingScreen.remove();
    }, 500);
  }
};

// React アプリケーションをマウント
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

// アプリケーションの準備ができたらローディング画面を隠す
setTimeout(hideLoadingScreen, 1000);