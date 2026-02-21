import React from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useApp } from '../context/AppContext'
import { modules } from '../data/modules'
import ProgressBar from '../components/ProgressBar'
import styles from './HomePage.module.css'

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
}

export default function HomePage() {
  const navigate = useNavigate()
  const { modules: moduleState, studyMode, completedCount, allCompleted } = useApp()

  const getModuleState = (id) => moduleState.find((m) => m.id === id)

  const handleCardClick = (mod) => {
    const ms = getModuleState(mod.id)
    if (studyMode === 'exploration' || !ms.locked) {
      navigate(`/module/${mod.id}`)
    }
  }

  return (
    <main className={styles.main} id="main-content">
      <section className={styles.hero} aria-labelledby="hero-title">
        <div className={styles.heroInner}>
          <div className={styles.heroBadge}>
            <span aria-hidden="true">🎓</span> ELI5 Micro-Learning Platform
          </div>
          <h1 id="hero-title" className={styles.heroTitle}>
            Global Business{' '}
            <span className={styles.heroAccent}>Basics</span>
          </h1>
          <p className={styles.heroDesc}>
            Master international business concepts through fun, easy-to-understand explanations — like a lemonade stand… but for the whole world! 🌍
          </p>
          <div className={styles.heroStats}>
            <div className={styles.stat}>
              <span className={styles.statNum}>8</span>
              <span className={styles.statLabel}>Modules</span>
            </div>
            <div className={styles.statDivider} aria-hidden="true" />
            <div className={styles.stat}>
              <span className={styles.statNum}>40</span>
              <span className={styles.statLabel}>Quiz Questions</span>
            </div>
            <div className={styles.statDivider} aria-hidden="true" />
            <div className={styles.stat}>
              <span className={styles.statNum}>1</span>
              <span className={styles.statLabel}>Certificate</span>
            </div>
          </div>
        </div>
      </section>

      <div className={styles.content}>
        <ProgressBar completedCount={completedCount} />

        {studyMode === 'exploration' && (
          <div className={styles.modeBanner} role="status">
            <span aria-hidden="true">🔓</span>
            <span>
              <strong>Exploration Mode Active</strong> — All modules are unlocked for free browsing. Switch to Challenge Mode to track progress and earn a certificate.
            </span>
          </div>
        )}

        {allCompleted && (
          <motion.div
            className={styles.completionBanner}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            role="status"
          >
            <div className={styles.completionInner}>
              <div className={styles.completionIcon} aria-hidden="true">🏆</div>
              <div>
                <h2 className={styles.completionTitle}>🎉 Congratulations! You completed all 8 modules!</h2>
                <p className={styles.completionDesc}>Claim your certificate of completion!</p>
              </div>
              <button
                className={styles.certBtn}
                onClick={() => navigate('/certificate')}
              >
                🎓 Claim Certificate
              </button>
            </div>
          </motion.div>
        )}

        <h2 className={styles.sectionTitle} id="modules-heading">
          📚 Course Modules
        </h2>

        <motion.div
          className={styles.grid}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          aria-labelledby="modules-heading"
          role="list"
        >
          {modules.map((mod) => {
            const ms = getModuleState(mod.id)
            const isLocked = studyMode === 'challenge' && ms.locked
            const isCompleted = ms.completed

            return (
              <motion.article
                key={mod.id}
                variants={cardVariants}
                className={`${styles.card} ${isLocked ? styles.locked : styles.unlocked} ${isCompleted ? styles.completed : ''}`}
                onClick={() => handleCardClick(mod)}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleCardClick(mod) } }}
                tabIndex={0}
                role="listitem button"
                aria-label={`Module ${mod.id}: ${mod.title}${isLocked ? ' — Locked' : isCompleted ? ' — Completed' : ' — Start'}`}
                aria-disabled={isLocked}
                style={{ '--card-color': mod.color }}
              >
                <div className={styles.cardTop}>
                  <div className={styles.emoji} aria-hidden="true">{mod.emoji}</div>
                  <div className={styles.badges}>
                    {isCompleted && <span className={styles.badgeDone} aria-label="Completed">✓ Done</span>}
                    {isLocked && <span className={styles.badgeLocked} aria-label="Locked">🔒</span>}
                    {!isLocked && !isCompleted && <span className={styles.badgeOpen} aria-label="Available">▶ Start</span>}
                  </div>
                </div>

                <div className={styles.cardNum} aria-label={`Module ${mod.id}`}>
                  Module {mod.id}
                </div>
                <h3 className={styles.cardTitle}>{mod.title}</h3>
                <p className={styles.cardSubtitle}>{mod.subtitle}</p>
                <p className={styles.cardDesc}>{mod.description}</p>

                <div className={styles.cardFooter}>
                  <span className={styles.readTime}>⏱ {mod.readTime} read</span>
                  {ms.bestScore > 0 && (
                    <span className={styles.bestScore} aria-label={`Best score: ${ms.bestScore}%`}>
                      🏆 {ms.bestScore}%
                    </span>
                  )}
                </div>
              </motion.article>
            )
          })}
        </motion.div>
      </div>
    </main>
  )
}
