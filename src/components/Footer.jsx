import React, { useState } from 'react'
import { useApp } from '../context/AppContext'
import Modal from './Modal'
import styles from './Footer.module.css'

export default function Footer() {
  const { resetProgress } = useApp()
  const [showModal, setShowModal] = useState(false)

  const handleReset = () => {
    resetProgress()
    setShowModal(false)
  }

  return (
    <>
      <footer className={styles.footer} role="contentinfo">
        <div className={styles.inner}>
          <div className={styles.brand}>
            <span aria-hidden="true">🌍</span>
            <span>
              <strong>Global Business Basics</strong>
              {' — '}
              <span className={styles.subtitle}>ELI5 Global Business Curriculum</span>
            </span>
          </div>
          <div className={styles.links}>
            <a
              href="https://www.linkedin.com/in/beingbabu/"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.link}
              aria-label="Professor Babu George on LinkedIn (opens in new tab)"
            >
              👨‍🏫 Prof. Babu George
            </a>
            <button
              className={styles.resetBtn}
              onClick={() => setShowModal(true)}
              aria-label="Reset all course progress"
            >
              🔄 Reset Progress
            </button>
          </div>
        </div>
      </footer>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="⚠️ Reset All Progress?"
      >
        <p className={styles.modalText}>
          This will erase <strong>all your module completions, quiz scores, and saved progress</strong>.
          This action cannot be undone.
        </p>
        <div className={styles.modalActions}>
          <button
            className={styles.cancelBtn}
            onClick={() => setShowModal(false)}
          >
            Cancel
          </button>
          <button
            className={styles.confirmBtn}
            onClick={handleReset}
          >
            Yes, Reset Everything
          </button>
        </div>
      </Modal>
    </>
  )
}
