import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import RequestDetails from './pages/RequestDetails.jsx'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

const AppRouter = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/requests/:id" element={<RequestDetails />} />
      </Routes>
    </Router>
  )
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)