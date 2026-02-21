import React, { useState, useCallback, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useApp } from '../context/AppContext'
import { modules } from '../data/modules'
import { quizData } from '../data/quizData'
import styles from './QuizPage.module.css'

const PASS_THRESHOLD = 0.8 // 80%

function fisherYatesShuffle(array) {
  const arr = [...array]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

function buildShuffledQuestions(moduleId) {
  const raw = quizData[moduleId] || []
  return fisherYatesShuffle(raw).map((q) => {
    // Shuffle options while tracking the correct answer text
    const correctText = q.options[q.correctIndex]
    const shuffledOptions = fisherYatesShuffle(q.options)
    const newCorrectIndex = shuffledOptions.indexOf(correctText)
    return { ...q, options: shuffledOptions, correctIndex: newCorrectIndex }
  })
}

export default function QuizPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { modules: moduleState, completeModule, updateBestScore, studyMode, setUserName, userName, allCompleted } = useApp()

  const moduleId = parseInt(id, 10)
  const mod = modules.find((m) => m.id === moduleId)
  const ms = moduleState.find((m) => m.id === moduleId)

  // Name collection for module 8
  const [nameInput, setNameInput] = useState(userName || '')
  const [nameSubmitted, setNameSubmitted] = useState(moduleId !== 8 || !!userName)

  const [questions] = useState(() => buildShuffledQuestions(moduleId))
  const [currentQ, setCurrentQ] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState(null)
  const [answered, setAnswered] = useState(false)
  const [score, setScore] = useState(0)
  const [finished, setFinished] = useState(false)
  const [answers, setAnswers] = useState([]) // track per-question results

  if (!mod || !questions.length) {
    return (
      <div className={styles.error}>
        <p>Quiz not found.</p>
        <button onClick={() => navigate('/')}>← Home</button>
      </div>
    )
  }

  const isLocked = studyMode === 'challenge' && ms?.locked
  if (isLocked) { navigate('/'); return null }

  const handleNameSubmit = (e) => {
    e.preventDefault()
    const trimmed = nameInput.trim()
    if (!trimmed) return
    setUserName(trimmed)
    setNameSubmitted(true)
  }

  const handleSelect = (optionIndex) => {
    if (answered) return
    setSelectedAnswer(optionIndex)
    setAnswered(true)
    const isCorrect = optionIndex === questions[currentQ].correctIndex
    if (isCorrect) setScore((s) => s + 1)
    setAnswers((prev) => [...prev, { questionIndex: currentQ, selected: optionIndex, correct: isCorrect }])
  }

  const handleNext = () => {
    if (currentQ + 1 < questions.length) {
      setCurrentQ((q) => q + 1)
      setSelectedAnswer(null)
      setAnswered(false)
    } else {
      handleFinish()
    }
  }

  const handleFinish = () => {
    const previousCorrect = answers.filter((a) => a.correct).length
    const currentAlreadyCounted = answers.some((a) => a.questionIndex === currentQ)
    const currentIsCorrect = selectedAnswer === questions[currentQ].correctIndex
    const finalScore = previousCorrect + (!currentAlreadyCounted && currentIsCorrect ? 1 : 0)
    const pct = Math.round((finalScore / questions.length) * 100)
    const passed = finalScore / questions.length >= PASS_THRESHOLD

    if (passed) {
      completeModule(moduleId, pct)
    } else {
      updateBestScore(moduleId, pct)
    }

    setScore(finalScore)
    setFinished(true)
  }

  const handleRetake = () => {
    window.location.reload()
  }

  // Name input screen for module 8
  if (moduleId === 8 && !nameSubmitted) {
    return (
      <main className={styles.main} id="main-content">
        <div className={styles.nameScreen}>
          <motion.div
            className={styles.nameCard}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className={styles.nameIcon} aria-hidden="true">🎓</div>
            <h1 className={styles.nameTitle}>Final Module Quiz</h1>
            <p className={styles.nameDesc}>
              This is the <strong>last quiz</strong>! After passing, you'll earn your Certificate of Completion.
              Please enter your name as it should appear on the certificate.
            </p>
            <form onSubmit={handleNameSubmit} className={styles.nameForm}>
              <label htmlFor="cert-name" className={styles.nameLabel}>
                Your Full Name (for the certificate)
              </label>
              <input
                id="cert-name"
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                className={styles.nameInput}
                placeholder="e.g. Jane Smith"
                required
                autoFocus
                aria-required="true"
                maxLength={80}
              />
              <button
                type="submit"
                className={styles.nameBtn}
                disabled={!nameInput.trim()}
              >
                Start Final Quiz 🚀
              </button>
            </form>
          </motion.div>
        </div>
      </main>
    )
  }

  const question = questions[currentQ]
  const currentAlreadyAnswered = answers.some((a) => a.questionIndex === currentQ)
  const currentAnswerIsCorrect = answered && selectedAnswer === question.correctIndex && !currentAlreadyAnswered
  const totalCorrect = answers.filter((a) => a.correct).length + (currentAnswerIsCorrect ? 1 : 0)

  // Results screen
  if (finished) {
    const total = questions.length
    const finalPct = Math.round((score / total) * 100)
    const passed = score / total >= PASS_THRESHOLD
    const allModulesComplete = moduleState.every((m) => m.completed) || (passed && moduleId === modules.length)

    return (
      <main className={styles.main} id="main-content">
        <div className={styles.resultsOuter}>
          <motion.div
            className={`${styles.resultsCard} ${passed ? styles.resultsPassed : styles.resultsFailed}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className={styles.resultsBig} aria-hidden="true">
              {passed ? '🎉' : '💪'}
            </div>
            <h1 className={styles.resultsTitle}>
              {passed ? 'Quiz Passed!' : 'Not Quite Yet!'}
            </h1>
            <div className={styles.scoreCircle} aria-label={`Score: ${finalPct}%`}>
              <span className={styles.scoreNum}>{finalPct}%</span>
              <span className={styles.scoreSub}>{score}/{total} correct</span>
            </div>
            <p className={styles.resultsMsg}>
              {passed
                ? `Excellent work! You scored ${finalPct}% and passed Module ${moduleId}.`
                : `You scored ${finalPct}%. You need 80% (4/5) to pass. Keep trying!`}
            </p>

            {/* Review answers */}
            <div className={styles.reviewSection}>
              <h2 className={styles.reviewTitle}>Review Your Answers</h2>
              {questions.map((q, idx) => {
                const ans = answers[idx]
                if (!ans) return null
                return (
                  <div
                    key={idx}
                    className={`${styles.reviewItem} ${ans.correct ? styles.reviewCorrect : styles.reviewWrong}`}
                  >
                    <div className={styles.reviewQ}>
                      <span aria-hidden="true">{ans.correct ? '✅' : '❌'}</span>
                      <strong>Q{idx + 1}:</strong> {q.question}
                    </div>
                    {!ans.correct && (
                      <div className={styles.reviewAnswer}>
                        <span className={styles.yourAnswer}>Your answer: {q.options[ans.selected]}</span>
                        <span className={styles.correctAnswer}>Correct: {q.options[q.correctIndex]}</span>
                      </div>
                    )}
                    <div className={styles.reviewExplanation}>💡 {q.explanation}</div>
                  </div>
                )
              })}
            </div>

            <div className={styles.resultsBtns}>
              <button className={styles.btnSecondary} onClick={() => navigate('/')}>
                ← Back to Modules
              </button>
              {passed && allModulesComplete ? (
                <button className={styles.btnCert} onClick={() => navigate('/certificate')}>
                  🎓 Claim Certificate!
                </button>
              ) : passed && moduleId < modules.length ? (
                <button className={styles.btnNext} onClick={() => navigate(`/module/${moduleId + 1}`)}>
                  Next Module →
                </button>
              ) : (
                <button className={styles.btnRetry} onClick={handleRetake}>
                  🔄 Retake Quiz
                </button>
              )}
            </div>
          </motion.div>
        </div>
      </main>
    )
  }

  // Quiz in progress
  return (
    <main className={styles.main} id="main-content">
      <div className={styles.quizOuter}>
        {/* Header */}
        <div className={styles.quizHeader}>
          <button className={styles.backBtn} onClick={() => navigate(`/module/${moduleId}`)}>
            ← Back to Module
          </button>
          <div className={styles.quizMeta}>
            <span className={styles.quizTitle}>{mod.emoji} {mod.title}</span>
            <span className={styles.quizCounter}>Question {currentQ + 1} of {questions.length}</span>
          </div>
        </div>

        {/* Progress bar */}
        <div className={styles.progressTrack} role="progressbar" aria-valuenow={currentQ + 1} aria-valuemin={1} aria-valuemax={questions.length}>
          <div className={styles.progressFill} style={{ width: `${((currentQ + (answered ? 1 : 0)) / questions.length) * 100}%` }} />
        </div>

        {/* Question card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQ}
            className={styles.questionCard}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div className={styles.qNum} aria-label={`Question ${currentQ + 1}`}>
              Q{currentQ + 1}
            </div>
            <h2 className={styles.questionText}>{question.question}</h2>

            <div className={styles.options} role="group" aria-label="Answer options">
              {question.options.map((option, idx) => {
                let optClass = styles.option
                if (answered) {
                  if (idx === question.correctIndex) optClass = `${styles.option} ${styles.optionCorrect}`
                  else if (idx === selectedAnswer) optClass = `${styles.option} ${styles.optionWrong}`
                  else optClass = `${styles.option} ${styles.optionDim}`
                } else if (idx === selectedAnswer) {
                  optClass = `${styles.option} ${styles.optionSelected}`
                }

                return (
                  <button
                    key={idx}
                    className={optClass}
                    onClick={() => handleSelect(idx)}
                    disabled={answered}
                    aria-label={`Option ${String.fromCharCode(65 + idx)}: ${option}${answered && idx === question.correctIndex ? ' — Correct' : answered && idx === selectedAnswer && idx !== question.correctIndex ? ' — Incorrect' : ''}`}
                  >
                    <span className={styles.optLetter} aria-hidden="true">
                      {answered
                        ? idx === question.correctIndex ? '✓' : idx === selectedAnswer ? '✗' : String.fromCharCode(65 + idx)
                        : String.fromCharCode(65 + idx)}
                    </span>
                    <span className={styles.optText}>{option}</span>
                  </button>
                )
              })}
            </div>

            {/* Feedback */}
            <AnimatePresence>
              {answered && (
                <motion.div
                  className={`${styles.feedback} ${selectedAnswer === question.correctIndex ? styles.feedbackCorrect : styles.feedbackWrong}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  role="status"
                  aria-live="polite"
                >
                  <div className={styles.feedbackTitle}>
                    {selectedAnswer === question.correctIndex ? '🎉 Correct!' : '❌ Not quite!'}
                  </div>
                  <p className={styles.feedbackExplanation}>💡 {question.explanation}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {answered && (
              <button className={styles.nextBtn} onClick={handleNext} autoFocus>
                {currentQ + 1 < questions.length ? 'Next Question →' : 'See Results 🏁'}
              </button>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </main>
  )
}
