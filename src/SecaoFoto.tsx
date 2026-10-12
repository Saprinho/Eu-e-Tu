import { useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from './supabase'
import { comprimir } from './comprimir'
import { Avatar } from './Fotos'

type Props = {
  session: Session
  nome: string
  utilizador: string
  fotoUrl: string | null
  onMudou: () => void
}

export default function SecaoFoto({ session, nome, utilizador, fotoUrl, onMudou }: Props) {
  const [ficheiro, setFicheiro] = useState<Blob | null>(null)
  const [previa, setPrevia] = useState('')
  const [msg, setMsg] = useState('')
  const [erro, setErro] = useState('')
  const [aGuardar, setAGuardar] = useState(false)

  function limpar() {
    setMsg('')
    setErro('')
  }

  async function escolher(e: React.ChangeEvent<HTMLInputElement>) {
    limpar()
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
      const pequena = await comprimir(f)
      setFicheiro(pequena)
      setPrevia(URL.createObjectURL(pequena))
    } catch {
      setErro('Não foi possível preparar a fotografia. Tenta outra.')
    }
  }

  async function confirmar() {
    if (!ficheiro) return
    limpar()
    setAGuardar(true)
    const caminho = session.user.id + '/' + Date.now() + '.jpg'
    const { error: e1 } = await supabase.storage
      .from('avatares')
      .upload(caminho, ficheiro, { contentType: 'image/jpeg' })
    if (e1) {
      setErro('Não foi possível enviar a fotografia. Tenta outra vez.')
      setAGuardar(false)
      return
    }
    const { data: url } = supabase.storage.from('avatares').getPublicUrl(caminho)
    const { error: e2 } = await supabase
      .from('profiles')
      .update({ foto_url: url.publicUrl })
      .eq('id', session.user.id)
    if (e2) {
      setErro('Não foi possível guardar a fotografia.')
    } else {
      setMsg('Fotografia alterada!')
      setFicheiro(null)
      setPrevia('')
      onMudou()
    }
    setAGuardar(false)
  }

  const foto = previa || fotoUrl

  return (
    <div className="rounded-2xl bg-white p-5 shadow-md text-center">
      <div className="flex justify-center">
        <Avatar nome={nome} url={foto} tamanho="h-24 w-24" />
      </div>
      <h2 className="mt-3 text-xl font-bold text-escuro">{nome}</h2>
      <p className="text-gray-600">@{utilizador}</p>

      <label className="mt-4 block rounded-full border-2 border-roxo py-3 font-semibold text-roxo">
        Escolher fotografia
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={escolher}
          className="hidden"
        />
      </label>
      {ficheiro && (
        <button
          onClick={confirmar}
          disabled={aGuardar}
          className="mt-3 w-full rounded-full bg-gradient-to-r from-roxo to-rosa py-3 font-semibold text-white disabled:opacity-60"
        >
          Confirmar fotografia
        </button>
      )}
      <p className="mt-2 text-xs text-gray-500">Podes mudar a fotografia quando quiseres.</p>
      {erro && <p className="mt-2 text-red-600 font-medium">{erro}</p>}
      {msg && <p className="mt-2 text-green-700 font-medium">{msg}</p>}
    </div>
  )
}
