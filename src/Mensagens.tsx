import { useEffect, useState } from 'react'
import { supabase } from './supabase'
import { Avatar } from './Fotos'

type Item = {
  cid: string
  outroId: string
  nome: string
  foto: string | null
  ultima: string
  quando: number
  naoLidas: number
}

type Props = { meuId: string; onAbrir: (id: string, nome: string) => void }

export default function Mensagens({ meuId, onAbrir }: Props) {
  const [itens, setItens] = useState<Item[]>([])
  const [aCarregar, setACarregar] = useState(true)

  async function carregar() {
    const c = await supabase.from('conversations').select('id, user_a, user_b')
    const conversas = c.data ?? []
    if (conversas.length === 0) {
      setItens([])
      setACarregar(false)
      return
    }
    const cids = conversas.map((x) => x.id)
    const outros = conversas.map((x) => (x.user_a === meuId ? x.user_b : x.user_a))
    const p = await supabase.from('profiles').select('id, nome, foto_url').in('id', outros)
    const m = await supabase
      .from('messages')
      .select('conversation_id, sender_id, texto, criado_em, lida_em')
      .in('conversation_id', cids)
      .order('criado_em', { ascending: false })
      .limit(300)
    const msgs = m.data ?? []
    const lista: Item[] = conversas.map((x) => {
      const outroId = x.user_a === meuId ? x.user_b : x.user_a
      const perfil = (p.data ?? []).find((q) => q.id === outroId)
      const dela = msgs.filter((y) => y.conversation_id === x.id)
      const ultima = dela[0]
      return {
        cid: x.id,
        outroId,
        nome: perfil?.nome ?? 'Utilizador',
        foto: perfil?.foto_url ?? null,
        ultima: ultima ? (ultima.sender_id === meuId ? 'Tu: ' : '') + (ultima.texto ?? '') : 'Sem mensagens',
        quando: ultima ? new Date(ultima.criado_em).getTime() : 0,
        naoLidas: dela.filter((y) => y.sender_id !== meuId && !y.lida_em).length,
      }
    })
    lista.sort((a, b) => b.quando - a.quando)
    setItens(lista)
    setACarregar(false)
  }

  useEffect(() => {
    carregar()
    const canal = supabase
      .channel('lista-mensagens')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, () => carregar())
      .subscribe()
    return () => {
      supabase.removeChannel(canal)
    }
  }, [])

  if (aCarregar) return <p className="text-center text-gray-500">A carregar...</p>

  if (itens.length === 0) {
    return (
      <div className="rounded-2xl bg-white p-5 shadow-md text-center">
        <p className="text-gray-600">Ainda não tens conversas. Abre o perfil de alguém e toca em Mensagem.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      {itens.map((i) => (
        <button
          key={i.cid}
          onClick={() => onAbrir(i.outroId, i.nome)}
          className="flex w-full items-center gap-3 rounded-2xl bg-white p-3 text-left shadow-md"
        >
          <Avatar nome={i.nome} url={i.foto} tamanho="h-12 w-12" />
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-escuro">{i.nome}</p>
            <p className="truncate text-sm text-gray-600">{i.ultima}</p>
          </div>
          {i.naoLidas > 0 && (
            <span className="rounded-full bg-rosa px-2 py-1 text-xs font-bold text-
