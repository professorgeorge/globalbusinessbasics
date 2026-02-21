import React from 'react'
import { Link } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import styles from './Navigation.module.css'
import { modules } from '../data/modules'

export default function Navigation() {
  const { studyMode, setStudyMode, completedCount } = useApp()
  const total = modules.length

  const toggleMode = () => {
    setStudyMode(studyMode === 'challenge' ? 'exploration' : 'challenge')
  }

  return (
    <header className={styles.header} role="banner">
      <div className={styles.inner}>
        <Link to="/" className={styles.logo} aria-label="Global Business Basics — Home">
          <span className={styles.logoIcon} aria-hidden="true">🌍</span>
          <div className={styles.logoText}>
            <span className={styles.logoMain}>Global Business</span>
            <span className={styles.logoSub}>Basics</span>
          </div>
        </Link>

        <nav className={styles.nav} aria-label="Main navigation">
          <div className={styles.progressPill} aria-label={`${completedCount} of ${total} modules completed`}>
            <span aria-hidden="true">📊</span>
            <span>{completedCount}/{total}</span>
          </div>

          <button
            className={`${styles.modeToggle} ${studyMode === 'exploration' ? styles.modeExploration : styles.modeChallenge}`}
            onClick={toggleMode}
            aria-pressed={studyMode === 'exploration'}
            aria-label={`Switch to ${studyMode === 'exploration' ? 'Challenge' : 'Exploration'} Mode`}
            title={studyMode === 'exploration' ? 'Switch to Challenge Mode (quizzes required)' : 'Switch to Exploration Mode (free browsing)'}
          >
            <span aria-hidden="true">{studyMode === 'exploration' ? '🔓' : '🎯'}</span>
            <span className={styles.modeLabel}>
              {studyMode === 'exploration' ? 'Exploration' : 'Challenge'}
            </span>
          </button>
        </nav>
      </div>
    </header>
  )
}
