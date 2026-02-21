import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { AppProvider } from './context/AppContext'
import ErrorBoundary from './components/ErrorBoundary'
import Navigation from './components/Navigation'
import Footer from './components/Footer'
import HomePage from './pages/HomePage'
import ModulePage from './pages/ModulePage'
import QuizPage from './pages/QuizPage'
import CertificatePage from './pages/CertificatePage'
import styles from './App.module.css'

function AppRoutes() {
  return (
    <div className={styles.layout}>
      <Navigation />
      <ErrorBoundary>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/module/:id" element={<ModulePage />} />
          <Route path="/quiz/:id" element={<QuizPage />} />
          <Route path="/certificate" element={<CertificatePage />} />
          <Route path="*" element={<HomePage />} />
        </Routes>
      </ErrorBoundary>
      <Footer />
    </div>
  )
}

export default function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <AppRoutes />
      </AppProvider>
    </ErrorBoundary>
  )
}
