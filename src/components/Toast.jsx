import React, { useEffect, useState } from 'react'
import styles from './Toast.module.css'

export default function Toast({ message, type = 'success', onDismiss }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (message) {
      setVisible(true)
      const t = setTimeout(() => {
        setVisible(false)
        setTimeout(onDismiss, 300)
      }, 3000)
      return () => clearTimeout(t)
    }
  }, [message, onDismiss])

  if (!message) return null

  return (
    <div
      role="alert"
      aria-live="assertive"
      className={`${styles.toast} ${styles[type]} ${visible ? styles.visible : styles.hidden}`}
    >
      <span className={styles.icon} aria-hidden="true">
        {type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'}
      </span>
      <span className={styles.msg}>{message}</span>
    </div>
  )
}
