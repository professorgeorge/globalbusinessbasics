import React, { useRef, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useApp } from '../context/AppContext'
import styles from './CertificatePage.module.css'

export default function CertificatePage() {
  const navigate = useNavigate()
  const { allCompleted, userName, modules: moduleState } = useApp()
  const certRef = useRef(null)
  const [downloading, setDownloading] = useState(false)
  const [downloadType, setDownloadType] = useState(null)

  const today = new Date()
  const dateStr = today.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  const completionDate = dateStr

  useEffect(() => {
    if (!allCompleted) {
      navigate('/')
      return
    }
    // Fire confetti
    import('canvas-confetti').then(({ default: confetti }) => {
      const duration = 3000
      const end = Date.now() + duration
      const colors = ['#1e3a8a', '#fbbf24', '#ffffff', '#10b981']
      const frame = () => {
        confetti({
          particleCount: 4,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors,
        })
        confetti({
          particleCount: 4,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors,
        })
        if (Date.now() < end) requestAnimationFrame(frame)
      }
      frame()
    })
  }, [allCompleted, navigate])

  const handleDownloadPDF = async () => {
    if (!certRef.current || downloading) return
    setDownloading(true)
    setDownloadType('pdf')
    try {
      const [html2canvasModule, jsPDFModule] = await Promise.all([
        import('html2canvas'),
        import('jspdf'),
      ])
      const html2canvas = html2canvasModule.default
      const { jsPDF } = jsPDFModule

      const canvas = await html2canvas(certRef.current, {
        scale: 3,
        useCORS: true,
        allowTaint: true,
        backgroundColor: null,
        logging: false,
      })

      const imgData = canvas.toDataURL('image/jpeg', 0.95)
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
      })

      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = pdf.internal.pageSize.getHeight()
      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight)
      pdf.save(`Global-Business-Basics-Certificate-${(userName || 'Student').replace(/\s+/g, '-')}.pdf`)
    } catch (err) {
      console.error('PDF generation failed:', err)
    } finally {
      setDownloading(false)
      setDownloadType(null)
    }
  }

  const handleDownloadJPEG = async () => {
    if (!certRef.current || downloading) return
    setDownloading(true)
    setDownloadType('jpeg')
    try {
      const html2canvasModule = await import('html2canvas')
      const html2canvas = html2canvasModule.default

      const canvas = await html2canvas(certRef.current, {
        scale: 3,
        useCORS: true,
        allowTaint: true,
        backgroundColor: null,
        logging: false,
      })

      const link = document.createElement('a')
      link.download = `Global-Business-Basics-Certificate-${(userName || 'Student').replace(/\s+/g, '-')}.jpg`
      link.href = canvas.toDataURL('image/jpeg', 0.95)
      link.click()
    } catch (err) {
      console.error('JPEG generation failed:', err)
    } finally {
      setDownloading(false)
      setDownloadType(null)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  if (!allCompleted) return null

  return (
    <main className={styles.main} id="main-content">
      <div className={styles.outer}>
        {/* Actions */}
        <motion.div
          className={styles.actions}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <button className={styles.backBtn} onClick={() => navigate('/')}>
            ← Back to Modules
          </button>
          <div className={styles.downloadBtns}>
            <button
              className={styles.dlBtn}
              onClick={handleDownloadPDF}
              disabled={downloading}
              aria-label="Download certificate as PDF"
            >
              {downloading && downloadType === 'pdf' ? '⏳ Generating...' : '📄 Download PDF'}
            </button>
            <button
              className={styles.dlBtnAlt}
              onClick={handleDownloadJPEG}
              disabled={downloading}
              aria-label="Download certificate as JPEG image"
            >
              {downloading && downloadType === 'jpeg' ? '⏳ Generating...' : '🖼️ Download JPEG'}
            </button>
            <button
              className={styles.printBtn}
              onClick={handlePrint}
              aria-label="Print certificate"
            >
              🖨️ Print
            </button>
          </div>
        </motion.div>

        {/* Certificate */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, duration: 0.5 }}
        >
          <div
            id="certificate-print-area"
            ref={certRef}
            className={styles.certificate}
            aria-label={`Certificate of Completion for ${userName || 'Student'}`}
            role="img"
          >
            {/* Background decorative elements */}
            <div className={styles.certBg} aria-hidden="true" />
            <div className={styles.certBgPattern} aria-hidden="true" />

            {/* Outer border */}
            <div className={styles.outerBorder} aria-hidden="true" />
            <div className={styles.innerBorder} aria-hidden="true" />

            {/* Header */}
            <div className={styles.certHeader}>
              <div className={styles.certLogo} aria-hidden="true">🌍</div>
              <div className={styles.certBrand}>ELI5 Global Business Curriculum</div>
            </div>

            {/* Title block */}
            <div className={styles.titleBlock}>
              <h1 className={styles.certTitle}>Certificate of Completion</h1>
              <div className={styles.certSubtitle}>This is to certify that</div>
            </div>

            {/* Recipient name */}
            <div className={styles.recipientBlock}>
              <div className={styles.recipientName}>{userName || 'Graduate'}</div>
              <div className={styles.recipientLine} aria-hidden="true" />
            </div>

            {/* Body text */}
            <div className={styles.bodyText}>
              has successfully completed the
            </div>
            <div className={styles.programName}>
              Fundamentals of International Business
            </div>
            <div className={styles.programDetails}>
              an 8-module interactive micro-learning program covering international trade,
              cultural communication, currency markets, global supply chains, trade policy,
              market entry strategies, international law, and global marketing.
            </div>

            {/* Stats row */}
            <div className={styles.statsRow} aria-label="Course completion stats">
              <div className={styles.statItem}>
                <span className={styles.statVal}>8</span>
                <span className={styles.statLbl}>Modules</span>
              </div>
              <div className={styles.statDivider} aria-hidden="true" />
              <div className={styles.statItem}>
                <span className={styles.statVal}>40</span>
                <span className={styles.statLbl}>Questions</span>
              </div>
              <div className={styles.statDivider} aria-hidden="true" />
              <div className={styles.statItem}>
                <span className={styles.statVal}>≥80%</span>
                <span className={styles.statLbl}>Pass Score</span>
              </div>
            </div>

            {/* Footer */}
            <div className={styles.certFooter}>
              <div className={styles.dateBlock}>
                <div className={styles.dateLabel}>Date of Completion</div>
                <div className={styles.dateVal}>{completionDate}</div>
              </div>

              {/* Seal */}
              <div className={styles.seal} aria-label="Official seal" role="img">
                <div className={styles.sealInner}>
                  <div className={styles.sealGlobe} aria-hidden="true">🌍</div>
                  <div className={styles.sealText}>CERTIFIED</div>
                </div>
              </div>

              <div className={styles.signatureBlock}>
                <a
                  href="https://www.linkedin.com/in/beingbabu/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.sigLink}
                  aria-label="Professor Babu George LinkedIn profile"
                >
                  <div className={styles.sigName}>Professor Babu George</div>
                </a>
                <div className={styles.sigLine} aria-hidden="true" />
                <div className={styles.sigRole}>Program Director</div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </main>
  )
}
