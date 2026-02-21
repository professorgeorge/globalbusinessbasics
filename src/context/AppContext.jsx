import React, { createContext, useContext, useReducer, useEffect } from 'react'
import { modules } from '../data/modules'

const STORAGE_KEY = 'gbb_progress_v1'
const CURRENT_VERSION = 1

const AppContext = createContext(null)

const initialModulesState = modules.map((m, index) => ({
  id: m.id,
  locked: index !== 0,
  completed: false,
  bestScore: 0,
}))

function buildInitialState() {
  return {
    version: CURRENT_VERSION,
    modules: initialModulesState,
    studyMode: 'challenge',
    userName: '',
  }
}

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return buildInitialState()
    const parsed = JSON.parse(raw)
    if (parsed.version !== CURRENT_VERSION) return buildInitialState()
    return parsed
  } catch {
    return buildInitialState()
  }
}

function reducer(state, action) {
  switch (action.type) {
    case 'COMPLETE_MODULE': {
      const { moduleId, score } = action.payload
      const newModules = state.modules.map((m) => {
        if (m.id === moduleId) {
          return {
            ...m,
            completed: true,
            bestScore: Math.max(m.bestScore, score),
          }
        }
        if (m.id === moduleId + 1) {
          return { ...m, locked: false }
        }
        return m
      })
      return { ...state, modules: newModules }
    }
    case 'UPDATE_BEST_SCORE': {
      const { moduleId, score } = action.payload
      const newModules = state.modules.map((m) =>
        m.id === moduleId ? { ...m, bestScore: Math.max(m.bestScore, score) } : m
      )
      return { ...state, modules: newModules }
    }
    case 'SET_STUDY_MODE':
      return { ...state, studyMode: action.payload }
    case 'SET_USER_NAME':
      return { ...state, userName: action.payload }
    case 'RESET_PROGRESS':
      return buildInitialState()
    default:
      return state
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, null, loadFromStorage)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }, [state])

  const completeModule = (moduleId, score) => {
    dispatch({ type: 'COMPLETE_MODULE', payload: { moduleId, score } })
  }

  const updateBestScore = (moduleId, score) => {
    dispatch({ type: 'UPDATE_BEST_SCORE', payload: { moduleId, score } })
  }

  const setStudyMode = (mode) => {
    dispatch({ type: 'SET_STUDY_MODE', payload: mode })
  }

  const setUserName = (name) => {
    dispatch({ type: 'SET_USER_NAME', payload: name })
  }

  const resetProgress = () => {
    dispatch({ type: 'RESET_PROGRESS' })
  }

  const completedCount = state.modules.filter((m) => m.completed).length
  const allCompleted = completedCount === modules.length

  return (
    <AppContext.Provider
      value={{
        modules: state.modules,
        studyMode: state.studyMode,
        userName: state.userName,
        completedCount,
        allCompleted,
        completeModule,
        updateBestScore,
        setStudyMode,
        setUserName,
        resetProgress,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
