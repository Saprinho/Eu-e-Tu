import { useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from './supabase'
import PerfilEcra from './PerfilEcra'
import Feed from './Feed'
import Videos from './Videos'
import PublicarEcra from './PublicarEcra'
import Pesquisa from './Pesquisa'
import PerfilPublico from './PerfilPublico'
import CaixaPublicar from './CaixaPublicar'
import Mensagens from './Mensagens'
import Conversa from './Conversa'

type Aba = 'inicio' | 'videos' | 'publicar' | 'mensagens' | 'perfil'

const abas: { id: Aba; texto: string }[] = [
  { id: 'inicio', texto: 'Início' },
  { id: 'videos', texto: 'Vídeos' },
  { id: 'publicar', texto: 'Publicar' },
  { id: 'mensagens', texto: 'Mensagens' },
  { id: 'perfil', texto: 'Perfil' },
]

export default function Principal({ session }: { session: Session }) {
  const [aba, setAba] = useState<Aba>('inicio')
  const [versao, setVersao] = useState(0)
  const [versaoV, setVersaoV] = useState(0)
  const [pesquisa, setPesquisa] = useState(false)
  const [verPerfil, setVerPerfil] = useState<string | null>(null)
  const [conversa, setConversa] = useState<{ id: string; nome: string } | null>(null)
  const [naoLidas, setNaoLidas] = useState(0)
  const meuId = session.user.id

  async function contarNaoLidas() {
    const r = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .is('lida_em', null)
      .neq('sender_id', meuId)
    setNaoLidas(r.count ?? 0)
  }

  useEffect(() => {
    contarNaoLidas()
    const canal = supabase
      .channel('nao-lidas')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, () => contarNaoLidas())
      .subscribe()
    return () => {
      supabase.removeChannel(canal)
    }
  }, [])

  function irPara(a: Aba) {
    setAba(a)
    setPesquisa(false)
    setVerPerfil(null)
    setConversa(null)
  }

  function abrirConversa(id: string, nome: string) {
    setVerPerfil(null)
    setPesquisa(false)
    setAba('mensagens')
    setConversa({ id, nome })
  }

  function abrirPesquisa() {
    setVerPerfil(null)
    setConversa(null)
    setPesquisa(true)
  }

  const noMeio = !pesquisa && !verPerfil

  return (
    <div className="min-h-screen bg-white pb-24">
      <header className="relative px-6 py-5 text-white bg-gradient-to-r from-roxo via-azul to-rosa shadow-md">
        <h1 className="text-2xl font-extrabold">Eu e Tu</h1>
        <button
          onClick={abrirPesquisa}
          aria-label="Pesquisar"
          className="absolute right-32 top-3 rounded-full bg-black/40 px-3 py-2 text-sm font-semibold"
        >
          🔍
        </button>
      </header>

      <main className="px-4 py-6 max-w-md mx-auto">
        {verPerfil && (
          <PerfilPublico userId={verPerfil} meuId={meuId} onVoltar={() => setVerPerfil(null)} onMensagem={abrirConversa} />
        )}
        {pesquisa && !verPerfil && <Pesquisa meuId={meuId} onAbrir={setVerPerfil} />}
        {noMeio && aba === 'inicio' && (
          <>
            <CaixaPublicar meuId={meuId} onAbrir={() => irPara('publicar')} />
            <Feed meuId={meuId} versao={versao} />
          </>
        )}
        {noMeio && aba === 'videos' && <Videos meuId={meuId} versao={versaoV} />}
        {noMeio && aba === 'publicar' && (
          <PublicarEcra
            session={session}
            onPublicado={() => {
              setVersao(versao + 1)
              setAba('inicio')
            }}
            onVideoPublicado={() => {
              setVersaoV(versaoV + 1)
              setAba('videos')
            }}
          />
        )}
        {noMeio && aba === 'perfil' && <PerfilEcra session={session} />}
        {noMeio && aba === 'mensagens' && conversa && (
          <Conversa meuId={meuId} outroId={conversa.id} outroNome={conversa.nome} onVoltar={() => setConversa(null)} />
        )}
        {noMeio && aba === 'mensagens' && !conversa && <Mensagens meuId={meuId} onAbrir={abrirConversa} />}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 flex border-t border-gray-200 bg-white">
        {abas.map((a) => (
          <button
            key={a.id}
            onClick={() => irPara(a.id)}
            className={'relative flex-1 py-4 text-xs font-semibold ' + (aba === a.id && noMeio ? 'text-roxo' : 'text-gray-500')}
          >
            {a.texto}
            {a.id === 'mensagens' && naoLidas > 0 && (
              <span className="absolute right-2 top-1 rounded-full bg-red-600 px-1.5 text-[10px] font-bold text-white">
                {naoLidas > 9 ? '9+' : naoLidas}
              </span>
            )}
          </button>
        ))}
      </nav>
    </div>
  )
}
