import { useEffect, useState } from 'react'
import { supabase } from './supabase'
import { Avatar } from './Fotos'

type Pessoa = { id: string; nome: string; utilizador: string; foto_url: string | null }
type Pedido = {
  id: string
  requester_id: string
  profiles: { nome: string; utilizador: string; foto_url: string | null } | null
}

type Props = { meuId: string; onAbrir: (id: string) => void }

const CAMPOS = 'id, nome, utilizador, foto_url'

export default function Pesquisa({ meuId, onAbrir }: Props) {
  const [q, setQ] = useState('')
  const [lista, setLista] = useState<Pessoa[]>([])
  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [aCarregar, setACarregar] = useState(false)

  useEffect(() => {
    supabase
      .from('friendships')
      .select('id, requester_id, profiles!friendships_requester_id_fkey(nome, utilizador, foto_url)')
      .eq('addressee_id', meuId)
      .eq('status', 'pendente')
      .then(({ data }) => setPedidos((data as unknown as Pedido[]) ?? []))
  }, [])

  useEffect(() => {
    const texto = q.replace(/[,()%*]/g, ' ').trim()
    const t = setTimeout(async () => {
      setACarregar(true)
      let resultado: Pessoa[] = []
      if (texto.length >= 2) {
        const r = await supabase
          .from('profiles')
          .select(CAMPOS)
          .neq('id', meuId)
          .or('nome.ilike.%' + texto + '%,utilizador.ilike.%' + texto + '%')
          .limit(20)
        resultado = (r.data as Pessoa[]) ?? []
      } else {
        const r = await supabase
          .from('profiles')
          .select(CAMPOS)
          .neq('id', meuId)
          .order('criado_em', { ascending: false })
          .limit(10)
        resultado = (r.data as Pessoa[]) ?? []
      }
      setLista(resultado)
      setACarregar(false)
    }, 300)
    return () => clearTimeout(t)
  }, [q])

  const linha = 'flex w-full items-center gap-3 rounded-2xl bg-white p-3 text-left shadow-md'

  return (
    <div className="flex flex-col gap-4">
      <input
        className="w-full rounded-2xl border border-gray-300 px-4 py-3 text-base"
        placeholder="Procurar pessoas"
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />

      {pedidos.length > 0 && (
        <div>
          <h3 className="mb-2 font-bold text-escuro">Pedidos de amizade</h3>
          <div className="flex flex-col gap-2">
            {pedidos.map((p) => (
              <button key={p.id} className={linha} onClick={() => onAbrir(p.requester_id)}>
                <Avatar nome={p.profiles?.nome ?? 'U'} url={null} tamanho="h-10 w-10" />
                <span>
                  <span className="block font-semibold text-escuro">{p.profiles?.nome ?? 'Utilizador'}</span>
                  <span className="block text-sm text-gray-600">Toca para aceitar ou recusar</span>
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div>
        <h3 className="mb-2 font-bold text-escuro">{q.trim().length >= 2 ? 'Resultados' : 'Sugestões'}</h3>
        {aCarregar && <p className="text-sm text-gray-500">A procurar...</p>}
        {!aCarregar && lista.length === 0 && <p className="text-sm text-gray-500">Ninguém encontrado.</p>}
        <div className="flex flex-col gap-2">
          {lista.map((p) => (
            <button key={p.id} className={linha} onClick={() => onAbrir(p.id)}>
              <Avatar nome={p.nome} url={null} tamanho="h-10 w-10" />
              <span>
                <span className="block font-semibold text-escuro">{p.nome}</span>
                <span className="block text-sm text-gray-600">@{p.utilizador}</span>
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
