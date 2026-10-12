import { useEffect, useRef, useState } from 'react'
import { supabase } from './supabase'
import Comentarios from './Comentarios'
import { Avatar } from './Fotos'

export type VideoPost = {
  id: string
  autor_id: string
  texto: string | null
  video_url: string
  criado_em: string
  profiles: { nome: string; utilizador: string; foto_url: string | null } | null
}

type Props = { v: VideoPost; meuId: string; onApagado: () => void }

export default function VideoItem({ v, meuId, onApagado }: Props) {
  const caixa = useRef<HTMLDivElement>(null)
  const video = useRef<HTMLVideoElement>(null)
  const [carregar, setCarregar] = useState(false)
  const [mudo, setMudo] = useState(true)
  const [gostos, setGostos] = useState(0)
  const [gostei, setGostei] = useState(false)
  const [comentarios, setComentarios] = useState(0)
  const [painel, setPainel] = useState(false)
  const nome = v.profiles?.nome ?? 'Utilizador'

  async function contar() {
    const g = await supabase.from('likes').select('*', { count: 'exact', head: true }).eq('post_id', v.id)
    const c = await supabase.from('comments').select('*', { count: 'exact', head: true }).eq('post_id', v.id)
    const m = await supabase.from('likes').select('post_id').eq('post_id', v.id).eq('user_id', meuId)
    setGostos(g.count ?? 0)
    setComentarios(c.count ?? 0)
    setGostei((m.data ?? []).length > 0)
  }

  useEffect(() => {
    contar()
    const el = caixa.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setCarregar(true)
          video.current?.play().catch(() => {})
        } else {
          video.current?.pause()
        }
      },
      { threshold: 0.7 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  async function alternarGosto() {
    if (gostei) await supabase.from('likes').delete().eq('post_id', v.id).eq('user_id', meuId)
    else await supabase.from('likes').insert({ post_id: v.id, user_id: meuId })
    await contar()
  }

  async function partilhar() {
    const url = 'https://saprinho.github.io/Eu-e-Tu/'
    try {
      if (navigator.share) await navigator.share({ title: 'Eu e Tu', text: v.texto ?? 'Vê este vídeo', url })
      else await navigator.clipboard.writeText(url)
    } catch {
      return
    }
  }

  async function apagar() {
    if (!window.confirm('Apagar este vídeo?')) return
    const { error } = await supabase.from('posts').delete().eq('id', v.id)
    if (!error) onApagado()
  }

  function tocar() {
    const el = video.current
    if (!el) return
    if (el.paused) el.play().catch(() => {})
    else el.pause()
  }

  const lado = 'flex flex-col items-center text-xs font-semibold text-white'

  return (
    <div ref={caixa} className="relative h-full w-full snap-start overflow-hidden rounded-2xl bg-black">
      {carregar && (
        <video
          ref={video}
          src={v.video_url}
          className="h-full w-full object-contain"
          muted={mudo}
          loop
          playsInline
          autoPlay
          preload="metadata"
          onClick={tocar}
        />
      )}
      {!carregar && <p className="pt-20 text-center text-white">A carregar...</p>}

      <div className="absolute bottom-4 left-4 right-20 text-white">
        <div className="flex items-center gap-2">
          <Avatar nome={nome} url={v.profiles?.foto_url} tamanho="h-9 w-9" />
          <p className="font-bold">{nome}</p>
        </div>
        {v.texto && <p className="mt-2 text-sm">{v.texto}</p>}
      </div>

      <div className="absolute bottom-6 right-3 flex flex-col gap-5">
        <button onClick={alternarGosto} className={lado}>
          <span className={'text-3xl ' + (gostei ? 'text-rosa' : '')}>{gostei ? '♥' : '♡'}</span>
          {gostos}
        </button>
        <button onClick={() => setPainel(true)} className={lado}>
          <span className="text-2xl">💬</span>
          {comentarios}
        </button>
        <button onClick={partilhar} className={lado}>
          <span className="text-2xl">↗</span>
        </button>
        <button onClick={() => setMudo(!mudo)} className={lado}>
          <span className="text-2xl">{mudo ? '🔇' : '🔊'}</span>
        </button>
        {v.autor_id === meuId && (
          <button onClick={apagar} className={lado}>
            <span className="text-2xl">🗑</span>
          </button>
        )}
      </div>

      {painel && (
        <div className="fixed inset-0 z-40 flex flex-col justify-end bg-black/60" onClick={() => setPainel(false)}>
          <div className="max-h-[70vh] overflow-y-auto rounded-t-3xl bg-white p-4" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setPainel(false)} className="mb-2 font-semibold text-roxo">
              ✕ Fechar
            </button>
            <Comentarios postId={v.id} meuId={meuId} onMudou={contar} />
          </div>
        </div>
      )}
    </div>
  )
}
