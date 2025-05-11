import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import Privacy from './Privacy.tsx';
import { HashRouter, Routes, Route } from 'react-router-dom'

declare global {
  interface Window {
    cordova?: any;
  }
}

const startApp = () => {
  console.log('Starting app');
  createRoot(document.getElementById('root')!).render(
    <HashRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/privacy" element={<Privacy />} />
      </Routes>
    </HashRouter>
  )
}

if (window.cordova) {
  console.log('Cordova detected');
  document.addEventListener('deviceready', startApp, false);
} else {
  startApp();
}