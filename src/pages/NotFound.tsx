import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="p-6 text-center">
      <h1 className="text-3xl font-bold mb-4">404</h1>
      <p className="mb-4">Página não encontrada</p>
      <Link to="/" className="text-blue-600 underline">
        Voltar para Home
      </Link>
    </div>
  )
}