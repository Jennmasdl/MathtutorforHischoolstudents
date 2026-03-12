import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QuizProvider } from './context/QuizContext'
import StartPage from './pages/StartPage'
import QuizPage from './pages/QuizPage'

export default function App() {
  return (
    <BrowserRouter>
      <QuizProvider>
        <Routes>
          <Route path="/" element={<StartPage />} />
          <Route path="/quiz" element={<QuizPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </QuizProvider>
    </BrowserRouter>
  )
}
