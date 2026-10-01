import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Spinner from './components/Spinner'

function FullScreenLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center text-indigo-600">
      <Spinner className="h-8 w-8" />
    </div>
  )
}

// Sin sesión -> /login
function ProtectedRoute({ children }) {
  const { session, loading } = useAuth()
  if (loading) return <FullScreenLoader />
  return session ? children : <Navigate to="/login" replace />
}

// Con sesión -> /
function PublicRoute({ children }) {
  const { session, loading } = useAuth()
  if (loading) return <FullScreenLoader />
  return session ? <Navigate to="/" replace /> : children
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
