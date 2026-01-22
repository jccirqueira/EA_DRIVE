import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'

/**
 * Páginas (ajuste os imports conforme sua estrutura)
 */
import Home from './pages/Home'
import Dashboard from './pages/Dashboard'
//import Propostas from './pages/Propostas'
import NotFound from './pages/NotFound'

export default function App() {
  useEffect(() => {
    document.title = 'EA_DRIVE | Controle de Propostas'
  }, [])

  return (
    <HashRouter>
      <Routes>
        {/* Rota inicial */}
        <Route path="/" element={<Home />} />

        {/* Rotas principais */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/propostas" element={<Propostas />} />

        {/* Redirecionamento padrão */}
        <Route path="/home" element={<Navigate to="/" replace />} />

        {/* Fallback 404 (GitHub Pages safe) */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </HashRouter>
  )
}