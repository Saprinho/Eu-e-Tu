import { useState } from 'react'

type Props = { url: string; onFechar: () => void }

export default function Visualizador({ url, onFechar }: Props) {
  const [msg, setMsg] = useState('')

  async function obter() {
    const r = await fetch(url)
    return await r.blob()
  }

  async function descarregar() {
    setMsg('')
    try {
      const blob = await obter()
      const a = document.createElement('a')
      a.href = URL.createObjectURL(blob)
      a.download = 'eu-e-tu-' + Date.now() + '.jpg'
      a.click()
      setMsg('Fotografia descarregada!')
    } catch {
      setMsg('Não foi possível descarregar.')
    }
  }

  async function partilhar() {
    setMsg('')
    try {
      const blob = await obter()
      const ficheiro = new File([blob], 'eu-e-tu.jpg', { type: blob.type })
      if (navigator.canShare && navigator.canShare({ files: [ficheiro] })) {
        await navigator.share({ files: [ficheiro], title: 'Eu e Tu' })
      } else if (navigator.share) {
        await navigator.share({ title: 'Eu e Tu', url })
      } else {
        await navigator.clipboard.writeText(url)
        setMsg('Link copiado!')
      }
    } catch {
      setMsg('')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black">
      <div className="flex justify-end p-4">
        <button onClick={onFechar} className="rounded-full bg-white/20 px-4 py-2 font-semibold text-white">
          Fechar
        </button>
      </div>
      <div className="flex flex-1 items-center justify-center overflow-hidden px-2">
        <img src={url} alt="Fotografia" className="max-h-full max-w-full object-contain" />
      </div>
      {msg && <p className="text-center text-sm text-white">{msg}</p>}
      <div className="flex gap-3 p-4">
        <button onClick={descarregar} className="flex-1 rounded-full bg-gradient-to-r from-roxo to-rosa py-3 font-semibold text-white">
          Descarregar
        </button>
        <button onClick={partilhar} className="flex-1 rounded-full border-2 border-white py-3 font-semibold text-white">
          Partilhar
        </button>
      </div>
    </div>
  )
}
