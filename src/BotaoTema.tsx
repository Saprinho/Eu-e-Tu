import { useEffect, useState } from 'react'

function lerTema() {
  try {
    return localStorage.getItem('tema') === 'escuro'
  } catch {
    return false
  }
}

export default function BotaoTema() {
  const [escuro, setEscuro] = useState(lerTema)

  useEffect(() => {
    document.documentElement.classList.toggle('escuro', escuro)
    try {
      localStorage.setItem('tema', escuro ? 'escuro' : 'claro')
    } catch {
      return
    }
  }, [escuro])

  return (
    <button
      onClick={() => setEscuro(!escuro)}
      aria-label="Mudar tema"
      className="fixed right-3 top-3 z-30 rounded-full bg-black/40 px-3 py-2 text-sm font-semibold text-white"
    >
      {escuro ? '☀ Claro' : '☾ Escuro'}
    </button>
  )
}
