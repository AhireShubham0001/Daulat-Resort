import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import axios from 'axios';

// Automatically use Render backend in production, or localhost in development
axios.defaults.baseURL = import.meta.env.PROD 
  ? 'https://daulat-resort.onrender.com' 
  : 'http://localhost:5000';
axios.defaults.withCredentials = true;

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
