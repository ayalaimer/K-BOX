import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { installGlobalErrorLogging, safeConsole } from '@/lib/logging'

// Install global error logging
installGlobalErrorLogging()

// Replace native console in production
if (import.meta.env.MODE === 'production') {
  Object.assign(window.console, safeConsole);
}

createRoot(document.getElementById("root")!).render(<App />);
