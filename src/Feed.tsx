import { useEffect, useState } from 'react'
import { supabase } from './supabase'
import PostCard from './PostCard'
import type { Post } from './PostCard'

const POR_PAGINA = 10
const CAMPOS = 'id, autor_id, texto, imagem_url, criado_em, editado_em, profiles(nome, utilizador, foto_url)'

export default function Feed({ meuId, versao }: { meuId: string; versao: number }) {
  const [posts, setPosts] = useState<Post[]>([])
  const [aCarregar, setACarregar] = useState(true)
  const [temMais, setTemMais] = useState(false)
  const [erro, setErro] = useState('')

  async function buscar(de: number) {
    const { data, error } = await supabase
      .from('posts')
      .select(CAMPOS)
      .order('criado_em', { ascending: false })
      .range(de, de + POR_PAGINA - 1)
    if (error) {
      setErro('Não foi possível carregar: ' + error.message)
      return []
    }
    return (data as unknown as Post[]) ?? []
  }

  async function iniciar() {
    setACarregar(true)
    setErro('')
    const lista = await buscar(0)
    setPosts(lista)
    setTemMais(lista.length === POR_PAGINA)
    setACarregar(false)
  }

  async function maisPosts() {
    const lista = await buscar(posts.length)
    setPosts([...posts, ...lista])
    setTemMais(lista.length === POR_PAGINA)
  }

  useEffect(() => {
    iniciar()
  }, [versao])

  if (aCarregar) return <p className="text-center text-gray-500">A carregar...</p>
  if (erro) return <p className="text-center text-red-600">{erro}</p>

  return (
    <div className="flex flex-col gap-4">
      {posts.length === 0 && (
        <div className="rounded-2xl bg-white p-5 shadow-md text-center">
          <p className="text-gray-600">Ainda não há publicações. Sê o primeiro a publicar!</p>
        </div>
      )}
      {posts.map((p) => (
        <PostCard key={p.id} post={p} meuId={meuId} onApagado={iniciar} />
      ))}
      {temMais && (
        <button onClick={maisPosts} className="rounded-full border-2 border-roxo py-3 font-semibold text-roxo">
          Ver mais
        </button>
      )}
    </div>
  )
}
