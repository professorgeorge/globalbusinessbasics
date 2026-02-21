import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { modules } from '../data/modules'
import { useApp } from '../context/AppContext'
import FlipCard from '../components/FlipCard'
import styles from './ModulePage.module.css'

export default function ModulePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { modules: moduleState, studyMode } = useApp()

  const moduleId = parseInt(id, 10)
  const mod = modules.find((m) => m.id === moduleId)
  const ms = moduleState.find((m) => m.id === moduleId)

  if (!mod) {
    return (
      <div className={styles.error}>
        <h2>Module not found</h2>
        <button onClick={() => navigate('/')}>← Back to Home</button>
      </div>
    )
  }

  const isLocked = studyMode === 'challenge' && ms?.locked
  if (isLocked) {
    navigate('/')
    return null
  }

  // Render markdown-like content
  const renderContent = (text) => {
    const lines = text.trim().split('\n')
    const elements = []
    let i = 0

    while (i < lines.length) {
      const line = lines[i].trim()
      if (!line) { i++; continue }

      if (line.startsWith('## ')) {
        elements.push(<h2 key={i} className={styles.h2}>{line.slice(3)}</h2>)
      } else if (line.startsWith('### ')) {
        elements.push(<h3 key={i} className={styles.h3}>{line.slice(4)}</h3>)
      } else if (line.startsWith('**') && line.endsWith('**')) {
        elements.push(<p key={i} className={styles.boldPara}>{line.slice(2, -2)}</p>)
      } else if (line.startsWith('> ')) {
        elements.push(<blockquote key={i} className={styles.blockquote}>{line.slice(2)}</blockquote>)
      } else if (line.startsWith('- ')) {
        // Collect list items
        const items = []
        while (i < lines.length && lines[i].trim().startsWith('- ')) {
          items.push(lines[i].trim().slice(2))
          i++
        }
        elements.push(
          <ul key={`ul-${i}`} className={styles.ul}>
            {items.map((item, idx) => (
              <li key={idx} className={styles.li} dangerouslySetInnerHTML={{ __html: formatInline(item) }} />
            ))}
          </ul>
        )
        continue
      } else if (/^\d+\./.test(line)) {
        const items = []
        while (i < lines.length && /^\d+\./.test(lines[i].trim())) {
          items.push(lines[i].trim().replace(/^\d+\.\s*/, ''))
          i++
        }
        elements.push(
          <ol key={`ol-${i}`} className={styles.ol}>
            {items.map((item, idx) => (
              <li key={idx} className={styles.li} dangerouslySetInnerHTML={{ __html: formatInline(item) }} />
            ))}
          </ol>
        )
        continue
      } else if (line.startsWith('```')) {
        // Skip code blocks
        i++
        while (i < lines.length && !lines[i].trim().startsWith('```')) i++
      } else {
        elements.push(
          <p key={i} className={styles.para} dangerouslySetInnerHTML={{ __html: formatInline(line) }} />
        )
      }
      i++
    }
    return elements
  }

  const formatInline = (text) => {
    return text
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/`(.+?)`/g, '<code>$1</code>')
  }

  return (
    <main className={styles.main} id="main-content">
      {/* Hero banner */}
      <div className={styles.hero} style={{ '--mod-color': mod.color }}>
        <div className={styles.heroInner}>
          <button
            className={styles.backBtn}
            onClick={() => navigate('/')}
            aria-label="Back to home"
          >
            ← Back
          </button>
          <div className={styles.heroContent}>
            <div className={styles.modNum} aria-label={`Module ${mod.id}`}>Module {mod.id} of 8</div>
            <h1 className={styles.heroTitle}>
              <span aria-hidden="true">{mod.emoji}</span> {mod.title}
            </h1>
            <p className={styles.heroSubtitle}>"{mod.subtitle}"</p>
            <div className={styles.heroPills}>
              <span className={styles.pill}>⏱ {mod.readTime} read</span>
              <span className={styles.pill}>🃏 {mod.flipCards.length} flip cards</span>
              <span className={styles.pill}>📝 5 quiz questions</span>
              {ms?.completed && <span className={`${styles.pill} ${styles.pillDone}`}>✅ Completed — Best: {ms.bestScore}%</span>}
            </div>
          </div>
        </div>
      </div>

      <div className={styles.content}>
        {/* Article content */}
        <motion.article
          className={styles.article}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          aria-label={`Module ${mod.id} content: ${mod.title}`}
        >
          {renderContent(mod.content)}
        </motion.article>

        {/* Flip cards section */}
        <section className={styles.cardsSection} aria-labelledby="flip-cards-heading">
          <h2 id="flip-cards-heading" className={styles.sectionTitle}>
            🃏 Key Concept Cards
            <span className={styles.sectionHint}> — Click each card to flip!</span>
          </h2>
          <div className={styles.cardsGrid}>
            {mod.flipCards.map((card, index) => (
              <FlipCard
                key={index}
                front={card.front}
                back={card.back}
                index={index}
              />
            ))}
          </div>
        </section>

        {/* CTA */}
        <div className={styles.cta}>
          {ms?.completed && (
            <div className={styles.completedNote} role="status">
              ✅ You already completed this module with a best score of <strong>{ms.bestScore}%</strong>.
              You can retake the quiz to improve your score!
            </div>
          )}
          <div className={styles.ctaBtns}>
            <button className={styles.btnSecondary} onClick={() => navigate('/')}>
              ← Back to Modules
            </button>
            <button
              className={styles.btnPrimary}
              onClick={() => navigate(`/quiz/${mod.id}`)}
              aria-label={`Start quiz for Module ${mod.id}: ${mod.title}`}
            >
              {ms?.completed ? '🔄 Retake Quiz' : '📝 Take Quiz'} →
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}
