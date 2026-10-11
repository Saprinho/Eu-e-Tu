import { useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from './supabase'
import { comprimir } from './comprimir'

type Props = {
  session: Session
  onPublicado: () => void
}

export default function Publicar({ session, onPublicado }: Props) {
  const [texto, setTexto] = useState('')
  const [imagem, setImagem] = useState<Blob | null>(null)
  const [previa, setPrevia] = useState('')
  const [erro, setErro] = useState('')
  const [aEnviar, setAEnviar] = useState(false)

  async function escolher(e: React.ChangeEvent<HTMLInputElement>) {
    setErro('')
    const f = e.target.files?.[0]
    if (!f) return
    const tipos = ['image/jpeg', 'image/png', 'image/webp']
    if (!tipos.includes(f.type)) {
      setErro('Escolhe uma fotografia JPG, PNG ou WEBP.')
      return
    }
    if (f.size > 15 * 1024 * 1024) {
      setErro('A fotografia é grande demais. O máximo é 15 MB.')
      return
    }
    try {
      const pequena = await comprimir(f, 1280)
      setImagem(pequena)
      setPrevia(URL.createObjectURL(pequena))
    } catch {
      setErro('Não foi possível preparar a fotografia. Tenta outra.')
    }
  }

  function tirarImagem() {
    setImagem(null)
    setPrevia('')
  }

  async function publicar() {
    setErro('')
    if (!texto.trim() && !imagem) {
      setErro('Escreve algo ou escolhe uma fotografia.')
      return
    }
    setAEnviar(true)
    let imagemUrl: string | null = null
    if (imagem) {
      const caminho = session.user.id + '/' + Date.now() + '.jpg'
      const { error: e1 } = await supabase.storage
        .from('publicacoes')
        .upload(caminho, imagem, { contentType: 'image/jpeg' })
      if (e1) {
        setErro('Não foi possível enviar a fotografia. Tenta outra vez.')
        setAEnviar(false)
        return
      }
      imagemUrl = supabase.storage.from('publicacoes').getPublicUrl(caminho).data.publicUrl
    }
    const { error: e2 } = await supabase.from('posts').insert({
      autor_id: session.user.id,
      texto: texto.trim() || null,
      imagem_url: imagemUrl,
    })
    if (e2) {
      setErro('Não foi possível publicar. Tenta outra vez.')
    } else {
      setTexto('')
      tirarImagem()
      onPublicado()
    }
    setAEnviar(false)
  }

  return (
    <div className="rounded-2xl bg-white p-5 shadow-md">
      <h2 className="text-xl font-bold text-escuro">Nova publicação</h2>
      <textarea
        className="mt-3 w-full rounded-2xl border border-gray-300 px-4 py-3 text-base"
        rows={4}
        maxLength={2000}
        placeholder="Em que estás a pensar?"
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
      />
      {previa && (
        <div className="mt-3">
          <img src={previa} alt="Pré-visualização" className="w-full rounded-2xl object-cover" />
          <button onClick={tirarImagem} className="mt-2 text-sm font-semibold text-rosa">
            Tirar fotografia
          </button>
        </div>
      )}
      <label className="mt-3 block rounded-full border-2 border-roxo py-3 text-center font-semibold text-roxo">
        Adicionar fotografia
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={escolher}
          className="hidden"
        />
      </label>
      {erro && <p className="mt-3 text-red-600 font-medium">{erro}</p>}
      <button
        onClick={publicar}
        disabled={aEnviar}
        className="mt-3 w-full rounded-full bg-gradient-to-r from-roxo to-rosa py-3 text-lg font-semibold text-white shadow-md disabled:opacity-60"
      >
        {aEnviar ? 'A publicar...' : 'Publicar'}
      </button>
    </div>
  )
}
