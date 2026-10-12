import { useState } from 'react'

type Props = {
  url: string
  onFechar: () => void
  gostos?: number
  gostei?: boolean
  comentarios?: number
  onGosto?: () => void
  onComentar?: () => void
}

export default function Visualizador(p: Props) {
  const [msg, setMsg] = useState('')
  const [menu, setMenu] = useState(false)
  const temAcoes = p.onGosto !== undefined

  async function obter() {
    const r = await fetch(p.url)
    return await r.blob()
  }

  async function descarregar() {
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
    try {
      const blob = await obter()
      const f = new File([blob], 'eu-e-tu.jpg', { type: blob.type })
      if (navigator.canShare && navigator.canShare({ files: [f] })) {
        await navigator.share({ files: [f], title: 'Eu e Tu' })
      } else if (navigator.share) {
        await navigator.share({ title: 'Eu e Tu', url: p.url })
      } else {
        await navigator.clipboard.writeText(p.url)
        setMsg('Link copiado!')
      }
    } catch {
      setMsg('')
    }
  }

  async function copiar() {
    try {
      await navigator.clipboard.writeText(p.url)
      setMsg('Link copiado!')
    } catch {
      setMsg('Não foi possível copiar.')
    }
  }

  function escolher(acao: () => void) {
    setMenu(false)
    acao()
  }

  const botao = 'flex flex-1 flex-col items-center gap-1 py-2 text-xs font-semibold text-white'
  const item = 'block w-full border-b border-white/10 px-5 py-4 text-left text-base text-white'

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black">
      <div className="flex items-center justify-between p-3">
        <button onClick={p.onFechar} className="rounded-full bg-white/20 px-4 py-2 text-lg font-semibold text-white">
          ✕
        </button>
        <button onClick={() => setMenu(true)} className="rounded-full bg-white/20 px-5 py-2 text-lg font-bold text-white">
          ⋮
        </button>
      </div>
      <div className="flex flex-1 items-center justify-center overflow-hidden px-2">
        <img src={p.url} alt="Fotografia" className="max-h-full max-w-full object-contain" />
      </div>
      {msg && <p className="py-1 text-center text-sm text-white">{msg}</p>}
      <div className="flex border-t border-white/20 pb-2">
        {temAcoes && (
          <button onClick={p.onGosto} className={botao}>
            <span className={'text-xl ' + (p.gostei ? 'text-rosa' : '')}>{p.gostei ? '♥' : '♡'}</span>
            {p.gostos ?? 0}
          </button>
        )}
        <button onClick={descarregar} className={botao}>
          <span className="text-xl">⤓</span>
          Guardar
        </button>
        <button onClick={partilhar} className={botao}>
          <span className="text-xl">↗</span>
          Partilhar
        </button>
        {temAcoes && (
          <button onClick={p.onComentar} className={botao}>
            <span className="text-xl">💬</span>
            {p.comentarios ?? 0}
          </button>
        )}
      </div>

      {menu && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/60" onClick={() => setMenu(false)}>
          <div className="rounded-t-3xl bg-gray-900 pb-4" onClick={(e) => e.stopPropagation()}>
            <div className="mx-auto my-3 h-1 w-12 rounded-full bg-white/30" />
            {temAcoes && (
              <button className={item} onClick={() => escolher(() => p.onComentar && p.onComentar())}>
                Comentar
              </button>
            )}
            <button className={item} onClick={() => escolher(partilhar)}>
              Partilhar
            </button>
            <button className={item} onClick={() => escolher(descarregar)}>
              Guardar
            </button>
            <button className={item} onClick={() => escolher(copiar)}>
              Copiar link da foto
            </button>
            <a href={p.url} target="_blank" rel="noreferrer" className={item}>
              Abrir noutro separador
            </a>
          </div>
        </div>
      )}
    </div>
  )
}
