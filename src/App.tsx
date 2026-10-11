import { useState } from 'react'
import Auth from './Auth'

export default function App() {
  const [ecra, setEcra] = useState<'inicio' | 'criar' | 'entrar'>('inicio')

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

        <div className="mt-10 grid gap-4">
          <div className="rounded-2xl bg-white p-4 shadow-md">
            <h2 className="font-bold text-escuro">Publicações</h2>
            <p className="text-sm text-gray-600">Partilha textos, fotografias e vídeos.</p>
          </div>
          <div className="rounded-2xl bg-white p-4 shadow-md">
            <h2 className="font-bold text-escuro">Vídeos</h2>
            <p className="text-sm text-gray-600">Vê e cria vídeos curtos.</p>
          </div>
          <div className="rounded-2xl bg-white p-4 shadow-md">
            <h2 className="font-bold text-escuro">Mensagens</h2>
            <p className="text-sm text-gray-600">Conversa em privado com os teus amigos.</p>
          </div>
        </div>
      </main>
    </div>
  )
    }
