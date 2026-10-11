import { useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from './supabase'
import Auth from './Auth'
import PerfilEcra from './PerfilEcra'
import Feed from './Feed'
import Publicar from './Publicar'

type Aba = 'inicio' | 'videos' | 'publicar' | 'mensagens' | 'perfil'

const abas: { id: Aba; texto: string }[] = [
  { id: 'inicio', texto: 'Início' },
  { id: 'videos', texto: 'Vídeos' },
  { id: 'publicar', texto: 'Publicar' },
  { id: 'mensagens', texto: 'Mensagens' },
  { id: 'perfil', texto: 'Perfil' },
]

function Principal({ session }: { session: Session }) {
  const [aba, setAba] = useState<Aba>('inicio')
  const [versao, setVersao] = useState(0)

  function publicado() {
    setVersao(versao + 1)
    setAba('inicio')
  }

  return (
    <div className="min-h-screen bg-white pb-24">
      <header className="px-6 py-5 text-white bg-gradient-to-r from-roxo via-azul to-rosa shadow-md">
        <h1 className="text-2xl font-extrabold">Eu e Tu</h1>
      </header>

      <main className="px-4 py-6 max-w-md mx-auto">
        {aba === 'inicio' && <Feed meuId={session.user.id} versao={versao} />}
        {aba === 'publicar' && <Publicar session={session} onPublicado={publicado} />}
        {aba === 'perfil' && <PerfilEcra session={session} />}
        {(aba === 'videos' || aba === 'mensagens') && (
          <div className="rounded-2xl bg-white p-5 shadow-md text-center">
            <p className="text-gray-600">Esta secção chega numa próxima etapa.</p>
          </div>
        )}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 flex border-t border-gray-200 bg-white">
        {abas.map((a) => (
          <button
            key={a.id}
            onClick={() => setAba(a.id)}
            className={
              'flex-1 py-4 text-xs font-semibold ' +
              (aba === a.id ? 'text-roxo' : 'text-gray-500')
            }
          >
            {a.texto}
          </button>
        ))}
      </nav>
    </div>
  )
}

export default function App() {
  const [session, setSession] = useState<Session | null>(null)
  const [aCarregar, setACarregar] = useState(true)
  const [ecra, setEcra] = useState<'inicio' | 'criar' | 'entrar'>('inicio')

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setACarregar(false)
    })
    const { data } = supabase.auth.onAuthStateChange((_evento, s) => {
      setSession(s)
    })
    return () => data.subscription.unsubscribe()
  }, [])

  if (aCarregar) {
    return <div className="min-h-screen flex items-center justify-center text-gray-500">A carregar...</div>
  }

  if (session) return <Principal session={session} />

  if (ecra !== 'inicio') {
    return <Auth modoInicial={ecra} onVoltar={() => setEcra('inicio')} />
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="px-6 pt-10 pb-12 text-center text-white bg-gradient-to-br from-roxo via-azul to-rosa rounded-b-[2.5rem] shadow-lg">
        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-white/20 text-3xl font-bold">
          E&amp;T
        </div>
        <h1 className="text-4xl font-extrabold">Eu e Tu</h1>
        <p className="mt-2 text-lg opacity-90">Conecta-te com o teu mundo</p>
      </header>

      <main className="flex-1 px-6 py-8 max-w-md mx-auto w-full">
        <p className="text-center text-gray-600">
          A rede social onde partilhas fotografias, vídeos e momentos, e falas com
          os teus amigos em segurança.
        </p>

        <div className="mt-8 flex flex-col gap-3">
          <button
            onClick={() => setEcra('criar')}
            className="rounded-full bg-gradient-to-r from-roxo to-rosa py-3 text-lg font-semibold text-white shadow-md"
          >
            Criar conta
          </button>
          <button
            onClick={() => setEcra('entrar')}
            className="rounded-full border-2 border-roxo py-3 text-lg font-semibold text-roxo"
          >
            Iniciar sessão
          </button>
        </div>
      </main>
    </div>
  )
}
