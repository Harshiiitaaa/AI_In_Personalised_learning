// main.jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'   // not inside pages, just directly from src folder
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
