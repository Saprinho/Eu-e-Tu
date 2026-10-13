type Props = { onCriar: () => void; onEntrar: () => void }

export default function Inicial({ onCriar, onEntrar }: Props) {
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
            onClick={onCriar}
            className="rounded-full bg-gradient-to-r from-roxo to-rosa py-3 text-lg font-semibold text-white shadow-md"
          >
            Criar conta
          </button>
          <button
            onClick={onEntrar}
            className="rounded-full border-2 border-roxo py-3 text-lg font-semibold text-roxo"
          >
            Iniciar sessão
          </button>
        </div>
      </main>
    </div>
  )
}
