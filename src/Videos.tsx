import { useEffect, useState } from 'react'
import { supabase } from './supabase'
import VideoItem from './VideoItem'
import type { VideoPost } from './VideoItem'

const POR_PAGINA = 5
const CAMPOS =
  'id, autor_id, texto, video_url, criado_em, profiles!posts_autor_id_fkey(nome, utilizador, foto_url)'

export default function Videos({ meuId, versao }: { meuId: string; versao: number }) {
  const [lista, setLista] = useState<VideoPost[]>([])
  const [aCarregar, setACarregar] = useState(true)
  const [temMais, setTemMais] = useState(false)
  const [erro, setErro] = useState('')

  async function buscar(de: number) {
    const { data, error } = await supabase
      .from('posts')
      .select(CAMPOS)
      .not('video_url', 'is', null)
      .order('criado_em', { ascending: false })
      .range(de, de + POR_PAGINA - 1)
    if (error) {
      setErro('Não foi possível carregar: ' + error.message)
      return []
    }
    return (data as unknown as VideoPost[]) ?? []
  }

  async function iniciar() {
    setACarregar(true)
    setErro('')
    const v = await buscar(0)
    setLista(v)
    setTemMais(v.length === POR_PAGINA)
    setACarregar(false)
  }

  async function mais() {
    const v = await buscar(lista.length)
    setLista([...lista, ...v])
    setTemMais(v.length === POR_PAGINA)
  }

  useEffect(() => {
    iniciar()
  }, [versao])

  if (aCarregar) return <p className="text-center text-gray-500">A carregar...</p>
  if (erro) return <p className="text-center text-red-600">{erro}</p>

  if (lista.length === 0) {
    return (
      <div className="rounded-2xl bg-white p-5 shadow-md text-center">
        <p className="text-gray-600">Ainda não há vídeos. Sê o primeiro a publicar!</p>
      </div>
    )
  }

  return (
    <div className="h-[calc(100dvh-11rem)] snap-y snap-mandatory overflow-y-scroll">
      {lista.map((v) => (
        <div key={v.id} className="h-full snap-start py-1">
          <VideoItem v={v} meuId={meuId} onApagado={iniciar} />
        </div>
      ))}
      {temMais && (
        <div className="flex h-24 snap-start items-center justify-center">
          <button onClick={mais} className="rounded-full border-2 border-roxo px-6 py-3 font-semibold text-roxo">
            Ver mais vídeos
          </button>
        </div>
      )}
    </div>
  )
}
