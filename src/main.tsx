import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import Privacy from './Privacy.tsx';
import { BrowserRouter, Routes, Route } from 'react-router-dom'

declare global {
  interface Window {
    cordova?: any;
  }
}

const startApp = () => {
  console.log('Starting app');
  createRoot(document.getElementById('root')!).render(
    <BrowserRouter basename={window.cordova ? "./" : "/contraction-timer/"}>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/privacy" element={<Privacy />} />
      </Routes>
    </BrowserRouter>
  )
}

if (window.cordova) {
  console.log('Cordova detected');
  document.addEventListener('deviceready', startApp, false);
} else {
  startApp();
}