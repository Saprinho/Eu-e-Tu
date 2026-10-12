import { useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from './supabase'

const MAX = 30 * 1024 * 1024
const EXT: Record<string, string> = {
  'video/mp4': 'mp4',
  'video/webm': 'webm',
  'video/quicktime': 'mov',
}

type Props = { session: Session; onPublicado: () => void }

export default function PublicarVideo({ session, onPublicado }: Props) {
  const [legenda, setLegenda] = useState('')
  const [ficheiro, setFicheiro] = useState<File | null>(null)
  const [previa, setPrevia] = useState('')
  const [erro, setErro] = useState('')
  const [aEnviar, setAEnviar] = useState(false)

  function escolher(e: React.ChangeEvent<HTMLInputElement>) {
    setErro('')
    const f = e.target.files?.[0]
    if (!f) return
    if (!EXT[f.type]) {
      setErro('Escolhe um vídeo MP4, WEBM ou MOV.')
      return
    }
    if (f.size > MAX) {
      setErro('O vídeo é grande demais. O máximo é 30 MB.')
      return
    }
    setFicheiro(f)
    setPrevia(URL.createObjectURL(f))
  }

  async function publicar() {
    if (!ficheiro) {
      setErro('Escolhe um vídeo primeiro.')
      return
    }
    setErro('')
    setAEnviar(true)
    const caminho = session.user.id + '/' + Date.now() + '.' + EXT[ficheiro.type]
    const { error: e1 } = await supabase.storage
      .from('videos')
      .upload(caminho, ficheiro, { contentType: ficheiro.type })
    if (e1) {
      setErro('Não foi possível enviar o vídeo. Tenta outra vez.')
      setAEnviar(false)
      return
    }
    const url = supabase.storage.from('videos').getPublicUrl(caminho).data.publicUrl
    const { error: e2 } = await supabase.from('posts').insert({
      autor_id: session.user.id,
      texto: legenda.trim() || null,
      video_url: url,
    })
    if (e2) {
      setErro('Não foi possível publicar o vídeo.')
    } else {
      setLegenda('')
      setFicheiro(null)
      setPrevia('')
      onPublicado()
    }
    setAEnviar(false)
  }

  const mb = ficheiro ? (ficheiro.size / 1024 / 1024).toFixed(1) + ' MB' : ''

  return (
    <div className="rounded-2xl bg-white p-5 shadow-md">
      <h2 className="text-xl font-bold text-escuro">Novo vídeo</h2>
      <input
        className="mt-3 w-full rounded-2xl border border-gray-300 px-4 py-3 text-base"
        maxLength={300}
        placeholder="Legenda do vídeo"
        value={legenda}
        onChange={(e) => setLegenda(e.target.value)}
      />
      {previa && (
        <div className="mt-3">
          <video src={previa} controls className="w-full rounded-2xl" />
          <p className="mt-1 text-xs text-gray-500">{mb}</p>
        </div>
      )}
      <label className="mt-3 block rounded-full border-2 border-roxo py-3 text-center font-semibold text-roxo">
        Escolher vídeo (até 30 MB)
        <input type="file" accept="video/mp4,video/webm,video/quicktime" onChange={escolher} className="hidden" />
      </label>
      {erro && <p className="mt-3 font-medium text-red-600">{erro}</p>}
      {aEnviar && <p className="mt-3 text-sm text-gray-600">A enviar... pode demorar com internet lenta.</p>}
      <button
        onClick={publicar}
        disabled={aEnviar}
        className="mt-3 w-full rounded-full bg-gradient-to-r from-roxo to-rosa py-3 text-lg font-semibold text-white shadow-md disabled:opacity-60"
      >
        {aEnviar ? 'A publicar...' : 'Publicar vídeo'}
      </button>
    </div>
  )
}
