import { useEffect, useState } from 'react'
import { supabase } from './supabase'
import AcoesPessoa from './AcoesPessoa'
import PostCard from './PostCard'
import type { Post } from './PostCard'
import { Avatar } from './Fotos'

type Perfil = {
  id: string
  nome: string
  utilizador: string
  biografia: string | null
  localizacao: string | null
  foto_url: string | null
}

type Props = { userId: string; meuId: string; onVoltar: () => void }

const CAMPOS =
  'id, autor_id, texto, imagem_url, criado_em, editado_em, profiles!posts_autor_id_fkey(nome, utilizador, foto_url)'

export default function PerfilPublico({ userId, meuId, onVoltar }: Props) {
  const [perfil, setPerfil] = useState<Perfil | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [seguidores, setSeguidores] = useState(0)
  const [aSeguir, setASeguir] = useState(0)
  const [aCarregar, setACarregar] = useState(true)
  const meu = userId === meuId

  async function contar() {
    const a = await supabase.from('follows').select('*', { count: 'exact', head: true }).eq('followed_id', userId)
    const b = await supabase.from('follows').select('*', { count: 'exact', head: true }).eq('follower_id', userId)
    setSeguidores(a.count ?? 0)
    setASeguir(b.count ?? 0)
  }

  async function carregar() {
    const p = await supabase
      .from('profiles')
      .select('id, nome, utilizador, biografia, localizacao, foto_url')
      .eq('id', userId)
      .single()
    setPerfil((p.data as Perfil) ?? null)
    const l = await supabase
      .from('posts')
      .select(CAMPOS)
      .eq('autor_id', userId)
      .is('video_url', null)
      .order('criado_em', { ascending: false })
      .limit(20)
    setPosts((l.data as unknown as Post[]) ?? [])
    await contar()
    setACarregar(false)
  }

  useEffect(() => {
    carregar()
  }, [userId])

  if (aCarregar) return <p className="text-center text-gray-500">A carregar...</p>
  if (!perfil) {
    return (
      <div>
        <button onClick={onVoltar} className="mb-3 font-semibold text-roxo">← Voltar</button>
        <p className="text-center text-gray-600">Não foi possível abrir este perfil.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <button onClick={onVoltar} className="text-left font-semibold text-roxo">← Voltar</button>
      <div className="rounded-2xl bg-white p-5 shadow-md text-center">
        <div className="flex justify-center">
          <Avatar nome={perfil.nome} url={perfil.foto_url} tamanho="h-24 w-24" />
        </div>
        <h2 className="mt-3 text-xl font-bold text-escuro">{perfil.nome}</h2>
        <p className="text-gray-600">@{perfil.utilizador}</p>
        {perfil.biografia && <p className="mt-2 text-gray-700">{perfil.biografia}</p>}
        {perfil.localizacao && <p className="mt-1 text-sm text-gray-500">{perfil.localizacao}</p>}
        <div className="mt-3 flex justify-center gap-8 text-sm text-gray-600">
          <p><span className="font-bold text-escuro">{seguidores}</span> seguidores</p>
          <p><span className="font-bold text-escuro">{aSeguir}</span> a seguir</p>
        </div>
        {!meu && (
          <div className="flex justify-center">
            <AcoesPessoa meuId={meuId} outroId={userId} onMudou={contar} />
          </div>
        )}
      </div>
      {posts.length === 0 && <p className="text-center text-gray-500">Ainda não há publicações.</p>}
      {posts.map((p) => (
        <PostCard key={p.id} post={p} meuId={meuId} onApagado={carregar} />
      ))}
    </div>
  )
}
