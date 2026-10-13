import { useEffect, useState } from 'react'
import { supabase } from './supabase'

type Props = { meuId: string; onAbrir: () => void }

export default function CaixaPublicar({ meuId, onAbrir }: Props) {
  const [foto, setFoto] = useState<string | null>(null)
  const [nome, setNome] = useState('U')

  useEffect(() => {
    supabase
      .from('profiles')
      .select('nome, foto_url')
      .eq('id', meuId)
      .single()
      .then(({ data }) => {
        if (data) {
          setFoto(data.foto_url)
          setNome(data.nome)
        }
      })
  }, [])

  return (
    <div className="mb-4 flex items-center gap-3 rounded-2xl bg-white p-3 shadow-md">
      {foto ? (
        <img src={foto} alt="" className="h-11 w-11 rounded-full object-cover" />
      ) : (
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-roxo to-rosa font-bold text-white">
          {nome.charAt(0).toUpperCase()}
        </div>
      )}
      <button
        onClick={onAbrir}
        className="flex-1 rounded-full bg-gray-50 px-4 py-3 text-left text-gray-600"
      >
        Em que estás a pensar?
      </button>
      <button onClick={onAbrir} className="text-sm font-semibold text-roxo">
        Foto
      </button>
    </div>
  )
}
