import { useEffect, useState } from 'react'
import { supabase } from './supabase'

type Comentario = {
  id: string
  texto: string
  criado_em: string
  parent_id: string | null
  autor_id: string
  profiles: { nome: string; utilizador: string } | null
}

type Props = {
  postId: string
  meuId: string
  onMudou: () => void
}

export default function Comentarios({ postId, meuId, onMudou }: Props) {
  const [lista, setLista] = useState<Comentario[]>([])
  const [texto, setTexto] = useState('')
  const [respondeA, setRespondeA] = useState<Comentario | null>(null)
  const [erro, setErro] = useState('')

  async function carregar() {
    const { data } = await supabase
      .from('comments')
      .select('id, texto, criado_em, parent_id, autor_id, profiles(nome, utilizador)')
      .eq('post_id', postId)
      .order('criado_em', { ascending: true })
    setLista((data as unknown as Comentario[]) ?? [])
  }

  useEffect(() => {
    carregar()
  }, [])

  async function enviar() {
    setErro('')
    if (!texto.trim()) return
    const { error } = await supabase.from('comments').insert({
      post_id: postId,
      autor_id: meuId,
      parent_id: respondeA ? respondeA.id : null,
      texto: texto.trim(),
    })
    if (error) {
      setErro('Não foi possível comentar. Tenta outra vez.')
      return
    }
    setTexto('')
    setRespondeA(null)
    await carregar()
    onMudou()
  }

  async function apagar(id: string) {
    await supabase.from('comments').delete().eq('id', id)
    await carregar()
    onMudou()
  }

  function linha(c: Comentario) {
    const resposta = c.parent_id !== null
    return (
      <div key={c.id} className={(resposta ? 'ml-6 ' : '') + 'mt-3 rounded-xl bg-gray-50 p-3'}>
        <p className="text-sm font-bold text-escuro">
          {c.profiles?.nome ?? 'Utilizador'}
        </p>
        <p className="text-sm text-gray-700">{c.texto}</p>
        <div className="mt-1 flex gap-4 text-xs font-semibold">
          {!resposta && (
            <button onClick={() => setRespondeA(c)} className="text-roxo">
              Responder
            </button>
          )}
          {c.autor_id === meuId && (
            <button onClick={() => apagar(c.id)} className="text-rosa">
              Apagar
            </button>
          )}
        </div>
      </div>
    )
  }

  const principais = lista.filter((c) => c.parent_id === null)

  return (
    <div className="mt-3 border-t border-gray-200 pt-3">
      {principais.map((c) => (
        <div key={c.id}>
          {linha(c)}
          {lista.filter((r) => r.parent_id === c.id).map((r) => linha(r))}
        </div>
      ))}
      {respondeA && (
        <p className="mt-3 text-xs text-gray-600">
          A responder a {respondeA.profiles?.nome ?? 'utilizador'}{' '}
          <button onClick={() => setRespondeA(null)} className="font-semibold text-rosa">
            Cancelar
          </button>
        </p>
      )}
      <div className="mt-3 flex gap-2">
        <input
          className="flex-1 rounded-full border border-gray-300 px-4 py-2 text-sm"
          placeholder="Escreve um comentário..."
          maxLength={1000}
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
        />
        <button onClick={enviar} className="rounded-full bg-roxo px-4 py-2 text-sm font-semibold text-white">
          Enviar
        </button>
      </div>
      {erro && <p className="mt-2 text-sm text-red-600">{erro}</p>}
    </div>
  )
}
