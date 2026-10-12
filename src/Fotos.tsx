import { useState } from 'react'
import Visualizador from './Visualizador'

type AvatarProps = { nome: string; url?: string | null; tamanho: string }

export function Avatar({ nome, url, tamanho }: AvatarProps) {
  const [aberto, setAberto] = useState(false)
  if (!url) {
    return (
      <div className={tamanho + ' flex items-center justify-center rounded-full bg-gradient-to-br from-roxo to-rosa text-xl font-bold text-white'}>
        {nome.charAt(0).toUpperCase()}
      </div>
    )
  }
  return (
    <>
      <img
        src={url}
        alt=""
        onClick={() => setAberto(true)}
        className={tamanho + ' cursor-pointer rounded-full object-cover'}
      />
      {aberto && <Visualizador url={url} onFechar={() => setAberto(false)} />}
    </>
  )
}

type FotoPostProps = {
  url: string
  gostos: number
  gostei: boolean
  comentarios: number
  onGosto: () => void
  onComentar: () => void
}

export function FotoPost(p: FotoPostProps) {
  const [aberto, setAberto] = useState(false)

  function comentar() {
    setAberto(false)
    p.onComentar()
  }

  return (
    <>
      <img
        src={p.url}
        alt=""
        loading="lazy"
        onClick={() => setAberto(true)}
        className="mt-3 w-full cursor-pointer rounded-2xl object-cover"
      />
      {aberto && (
        <Visualizador
          url={p.url}
          onFechar={() => setAberto(false)}
          gostos={p.gostos}
          gostei={p.gostei}
          comentarios={p.comentarios}
          onGosto={p.onGosto}
          onComentar={comentar}
        />
      )}
    </>
  )
}
