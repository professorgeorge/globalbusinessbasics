import React from 'react'
import styles from './ProgressBar.module.css'
import { modules } from '../data/modules'

export default function ProgressBar({ completedCount }) {
  const total = modules.length
  const pct = Math.round((completedCount / total) * 100)

  return (
    <div className={styles.wrapper} role="region" aria-label="Course progress">
      <div className={styles.header}>
        <span className={styles.label}>
          📊 Progress: {completedCount} of {total} modules completed
        </span>
        <span className={styles.pct}>{pct}%</span>
      </div>
      <div
        className={styles.track}
        role="progressbar"
        aria-valuenow={completedCount}
        aria-valuemin={0}
        aria-valuemax={total}
        aria-label={`${completedCount} of ${total} modules completed`}
      >
        <div
          className={styles.fill}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className={styles.dots} aria-hidden="true">
        {modules.map((m, i) => (
          <div
            key={m.id}
            className={`${styles.dot} ${i < completedCount ? styles.dotDone : ''}`}
            title={`Module ${m.id}: ${m.title}`}
          >
            {i < completedCount ? '✓' : i + 1}
          </div>
        ))}
      </div>
    </div>
  )
}
