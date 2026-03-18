/* eslint-disable react-refresh/only-export-components */
import React, { StrictMode, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

const Dashboard = React.lazy(() => import('./Dashboard.jsx'))

class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, message: '' }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, message: String(error?.message || error || 'Unknown runtime error') }
  }

  componentDidCatch(error) {
    console.error('Dashboard runtime error:', error)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 24, fontFamily: 'Inter, sans-serif', background: '#0f172a', color: '#f8fafc', minHeight: '100vh' }}>
          <h1 style={{ margin: '0 0 10px', color: '#f87171' }}>Runtime Error</h1>
          <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{this.state.message}</p>
          <p style={{ marginTop: 12, color: '#cbd5e1' }}>Check browser console and share this message so I can patch it immediately.</p>
        </div>
      )
    }
    return this.props.children
  }
}

const rootEl = document.getElementById('root')

if (!rootEl) {
  throw new Error('Root element #root not found.')
}

window.addEventListener('error', (event) => {
  const msg = String(event?.error?.message || event?.message || 'Unknown script error')
  rootEl.innerHTML = `<div style="padding:24px;font-family:Inter,sans-serif;background:#0f172a;color:#f8fafc;min-height:100vh"><h1 style="margin:0 0 10px;color:#f87171">Startup Error</h1><p style="margin:0;white-space:pre-wrap">${msg}</p></div>`
})

window.addEventListener('unhandledrejection', (event) => {
  const msg = String(event?.reason?.message || event?.reason || 'Unhandled promise rejection')
  rootEl.innerHTML = `<div style="padding:24px;font-family:Inter,sans-serif;background:#0f172a;color:#f8fafc;min-height:100vh"><h1 style="margin:0 0 10px;color:#f87171">Unhandled Rejection</h1><p style="margin:0;white-space:pre-wrap">${msg}</p></div>`
})

createRoot(rootEl).render(
  <StrictMode>
    <AppErrorBoundary>
      <Suspense
        fallback={
          <div style={{ padding: 24, fontFamily: 'Inter, sans-serif', background: '#0f172a', color: '#f8fafc', minHeight: '100vh' }}>
            Loading TitoNova...
          </div>
        }
      >
        <AppRouter />
      </Suspense>
    </AppErrorBoundary>
  </StrictMode>,
)

const AUTH_TOKEN_STORAGE_KEY = "titonova_auth_token_v1"
const AUTH_ENABLED = false

function AppRouter() {
  const [path, setPath] = React.useState(window.location.pathname || "/")
  const [isAuthed, setIsAuthed] = React.useState(Boolean(localStorage.getItem(AUTH_TOKEN_STORAGE_KEY)))

  React.useEffect(() => {
    const onPop = () => {
      setPath(window.location.pathname || "/")
      setIsAuthed(Boolean(localStorage.getItem(AUTH_TOKEN_STORAGE_KEY)))
    }
    window.addEventListener("popstate", onPop)
    return () => window.removeEventListener("popstate", onPop)
  }, [])

  const navigate = React.useCallback((nextPath, replace = false) => {
    if (replace) {
      window.history.replaceState({}, "", nextPath)
    } else {
      window.history.pushState({}, "", nextPath)
    }
    setPath(nextPath)
  }, [])

  React.useEffect(() => {
    if (!AUTH_ENABLED) {
      if (path !== "/dashboard") {
        navigate("/dashboard", true)
      }
      return
    }
    if (isAuthed && ["/login", "/signup", "/"].includes(path)) {
      navigate("/dashboard", true)
      return
    }
    if (!isAuthed && path === "/") {
      navigate("/dashboard", true)
    }
  }, [isAuthed, path, navigate])

  if (!AUTH_ENABLED) {
    if (path !== "/dashboard") return null
    return <Dashboard />
  }

  if (isAuthed && ["/login", "/signup", "/"].includes(path)) return null
  if (!isAuthed && path === "/") return null

  return <Dashboard />
}
