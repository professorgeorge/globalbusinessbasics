import React, { useState } from 'react'
import styles from './FlipCard.module.css'

export default function FlipCard({ front, back, index }) {
  const [flipped, setFlipped] = useState(false)

  const handleToggle = () => setFlipped((f) => !f)

  const handleKey = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleToggle()
    }
  }

  return (
    <div
      className={`${styles.scene}`}
      onClick={handleToggle}
      onKeyDown={handleKey}
      tabIndex={0}
      role="button"
      aria-pressed={flipped}
      aria-label={flipped ? `Card ${index + 1} showing back: ${back}` : `Card ${index + 1} showing front: ${front}. Click to flip.`}
    >
      <div className={`${styles.card} ${flipped ? styles.flipped : ''}`}>
        <div className={styles.face + ' ' + styles.front}>
          <div className={styles.content}>
            <div className={styles.termText}>{front}</div>
            <div className={styles.hint}>Click to reveal ✨</div>
          </div>
        </div>
        <div className={styles.face + ' ' + styles.back}>
          <div className={styles.content}>
            <div className={styles.defText}>{back}</div>
            <div className={styles.hint}>Click to flip back 🔄</div>
          </div>
        </div>
      </div>
    </div>
  )
}
