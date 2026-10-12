import { useEffect, useState } from 'react'
import { supabase } from './supabase'
import Comentarios from './Comentarios'
import { Avatar, FotoPost } from './Fotos'

export type Post = {
  id: string
  autor_id: string
  texto: string | null
  imagem_url: string | null
  criado_em: string
  editado_em: string | null
  profiles: { nome: string; utilizador: string; foto_url: string | null } | null
}

type Props = { post: Post; meuId: string; onApagado: () => void }

function formatar(d: string) {
  return new Date(d).toLocaleString('pt-PT', { dateStyle: 'medium', timeStyle: 'short' })
}

export default function PostCard({ post, meuId, onApagado }: Props) {
  const [gostos, setGostos] = useState(0)
  const [gostei, setGostei] = useState(false)
  const [comentarios, setComentarios] = useState(0)
  const [aberto, setAberto] = useState(false)
  const [aEditar, setAEditar] = useState(false)
  const [texto, setTexto] = useState(post.texto ?? '')
  const [guardado, setGuardado] = useState(post.texto)
  const [msg, setMsg] = useState('')
  const nome = post.profiles?.nome ?? 'Utilizador'
  const foto = post.profiles?.foto_url

  async function contar() {
    const g = await supabase.from('likes').select('*', { count: 'exact', head: true }).eq('post_id', post.id)
    const c = await supabase.from('comments').select('*', { count: 'exact', head: true }).eq('post_id', post.id)
    const m = await supabase.from('likes').select('post_id').eq('post_id', post.id).eq('user_id', meuId)
    setGostos(g.count ?? 0)
    setComentarios(c.count ?? 0)
    setGostei((m.data ?? []).length > 0)
  }

  useEffect(() => {
    contar()
  }, [])

  async function alternarGosto() {
    if (gostei) await supabase.from('likes').delete().eq('post_id', post.id).eq('user_id', meuId)
    else await supabase.from('likes').insert({ post_id: post.id, user_id: meuId })
    await contar()
  }

  async function guardarTexto() {
    const { error } = await supabase.from('posts').update({ texto: texto.trim() }).eq('id', post.id)
    if (error) setMsg('Não foi possível editar.')
    else {
      setGuardado(texto.trim())
      setAEditar(false)
      setMsg('')
    }
  }

  async function apagar() {
    if (!window.confirm('Apagar esta publicação?')) return
    const { error } = await supabase.from('posts').delete().eq('id', post.id)
    if (error) setMsg('Não foi possível apagar.')
    else onApagado()
  }

  async function partilhar() {
    const url = 'https://saprinho.github.io/Eu-e-Tu/'
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Eu e Tu', text: guardado ?? 'Vê na Eu e Tu', url })
      } catch {
        return
      }
    } else {
      await navigator.clipboard.writeText(url)
      setMsg('Link copiado!')
    }
  }

  return (
    <div className="rounded-2xl bg-white p-4 shadow-md">
      <div className="flex items-center gap-3">
        <Avatar nome={nome} url={foto} tamanho="h-11 w-11" />
        <div>
          <p className="font-bold text-escuro">{nome}</p>
          <p className="text-xs text-gray-500">
            {formatar(post.criado_em)}
            {post.editado_em ? ' · editado' : ''}
          </p>
        </div>
      </div>

      {aEditar ? (
        <div className="mt-3">
          <textarea
            className="w-full rounded-2xl border border-gray-300 px-4 py-3"
            rows={3}
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
          />
          <button onClick={guardarTexto} className="mt-2 mr-4 font-semibold text-roxo">
            Guardar
          </button>
          <button onClick={() => setAEditar(false)} className="mt-2 font-semibold text-gray-500">
            Cancelar
          </button>
        </div>
      ) : (
        guardado && <p className="mt-3 whitespace-pre-wrap text-gray-800">{guardado}</p>
      )}

      {post.imagem_url && <FotoPost url={post.imagem_url} />}

      <div className="mt-3 flex flex-wrap gap-5 text-sm font-semibold">
        <button onClick={alternarGosto} className={gostei ? 'text-rosa' : 'text-gray-600'}>
          {gostei ? '♥' : '♡'} {gostos}
        </button>
        <button onClick={() => setAberto(!aberto)} className="text-gray-600">
          Comentários {comentarios}
        </button>
        <button onClick={partilhar} className="text-gray-600">
          Partilhar
        </button>
        {post.autor_id === meuId && (
          <>
            <button onClick={() => setAEditar(true)} className="text-roxo">
              Editar
            </button>
            <button onClick={apagar} className="text-rosa">
              Apagar
            </button>
          </>
        )}
      </div>

      {msg && <p className="mt-2 text-sm text-gray-600">{msg}</p>}
      {aberto && <Comentarios postId={post.id} meuId={meuId} onMudou={contar} />}
    </div>
  )
}
