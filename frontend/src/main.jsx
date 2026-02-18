import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext'

// Inject skip-to-content link for keyboard/screen-reader users
const skipLink = document.createElement('a')
skipLink.href = '#main-scroll-area'
skipLink.className = 'skip-link'
skipLink.textContent = 'Skip to main content'
document.body.prepend(skipLink)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>,
)
